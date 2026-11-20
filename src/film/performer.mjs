import {clamp, ellipse, ink, layer, line, linear, mix, move, noise, path, pulse, rect, smooth, step} from './paint.mjs';

// Solve two fixed-length bones in the plane of the shot.
export function hinge(root, target, upper, lower, bend) {
  const dx=target[0]-root[0];
  const dy=target[1]-root[1];
  const distance=Math.hypot(dx,dy);
  const length=clamp(distance,Math.abs(upper-lower)+.05,upper+lower-.05);
  const ax=distance>0?dx/distance:0;
  const ay=distance>0?dy/distance:1;
  const along=(upper**2-lower**2+length**2)/(2*length);
  const offset=Math.sqrt(Math.max(0,upper**2-along**2))*bend;
  return {
    joint:[root[0]+ax*along-ay*offset,root[1]+ay*along+ax*offset],
    end:[root[0]+ax*length,root[1]+ay*length],
  };
}

export function attachment(prop, x, y) {
  const dx=x*prop.scale*(prop.widthScale ?? 1);
  const dy=y*prop.scale*(prop.heightScale ?? 1);
  return [
    prop.x+dx*Math.cos(prop.angle)-dy*Math.sin(prop.angle),
    prop.y+dx*Math.sin(prop.angle)+dy*Math.cos(prop.angle),
  ];
}

// During stance the foot point is sampled once in world space and held until toe-off.
export function gait(sample, time, {cycle=1.08,support=.65,lift=19,phaseOffset=0}={}) {
  const base=sample(time);
  const travel=(time+phaseOffset)/cycle;
  const ankle=(side, phaseShift)=>{
    const phase=((travel+phaseShift)%1+1)%1;
    const landing=time-phase*cycle;
    const anchor=sample(landing+cycle*support*.5);
    const next=sample(landing+cycle*(1+support*.5));
    const swing=step(phase,support,1);
    const travelDistance=Math.hypot(next.x-anchor.x,next.y-anchor.y);
    const effort=clamp(travelDistance/(base.scale*74));
    const point=move([anchor.x+side*anchor.scale*6,anchor.y],[next.x+side*next.scale*6,next.y],smooth(swing,0,1));
    point[1]+=side*2.8 - Math.sin(Math.PI*swing)*lift*base.scale*effort;
    const pitch=effort*(.31*pulse(phase,support-.16,support,support+.15)-.2*pulse(swing,.69,.9,1));
    return {point,pitch};
  };
  const far=ankle(-1,.5);
  const near=ankle(1,0);
  const drive=clamp((near.point[0]-far.point[0])/(base.scale*64),-1,1);
  const verticalDrive=clamp(Math.hypot(sample(time+.15).x-sample(time-.15).x,sample(time+.15).y-sample(time-.15).y)/(base.scale*38));
  return {...base,feet:[far,near],bob:verticalDrive*2.8*Math.cos(travel*4*Math.PI),drive,verticalDrive};
}

function fabricLimb(ctx, root, joint, end, width, color, light, shadow) {
  const points=[root,joint,end];
  path(ctx,[['M',...root],['L',...joint],['L',...end]],null,ink,width+4);
  path(ctx,[['M',...root],['L',...joint],['L',...end]],null,color,width);
  line(ctx,points.map(([x,y])=>[x-2,y-2]),light,width*.21);
  const [x,y]=joint;
  const d=Math.atan2(end[1]-y,end[0]-x);
  path(ctx,[
    ['M',x+Math.sin(d)*width*.29,y-Math.cos(d)*width*.29],
    ['Q',x+3*Math.cos(d),y+3*Math.sin(d),x-Math.sin(d)*width*.23,y+Math.cos(d)*width*.23],
  ],null,shadow,1.45);
}

const moods={
  neutral: {open:.71,inner:.15,tension:.08,smile:.04,mouth:0},
  confident: {open:.63,inner:.08,tension:.09,smile:.82,mouth:0},
  notice: {open:.94,inner:.74,tension:.15,smile:0,mouth:.28},
  concerned: {open:.66,inner:.87,tension:.71,smile:-.54,mouth:0},
  focused: {open:.62,inner:.42,tension:.56,smile:-.15,mouth:.05},
  relieved: {open:.53,inner:.24,tension:.12,smile:.41,mouth:0},
};

export function mood(from,to=from,t=0) {
  const a=moods[from];
  const b=moods[to];
  return Object.fromEntries(Object.keys(a).map(key=>[key,mix(a[key],b[key],t)]));
}

function face(ctx, person, {emotion, gaze, clock, seed, tilt, lean, back, blink}) {
  layer(ctx,()=>{
    ctx.translate(lean,-193);
    ctx.rotate(tilt);
    rect(ctx,-14,25,28,37,7,person.shade,ink,2.5);
    const skin=linear(ctx,-38,-48,43,36,[[0,person.light],[.63,person.skin],[1,person.shade]]);
    if(back) {
      ellipse(ctx,-42,3,8,11,person.skin,ink,2);
      ellipse(ctx,41,3,8,11,person.skin,ink,2);
      ellipse(ctx,0,-10,46,50,person.hat||person.hair,ink,2.8);
      path(ctx,[['M',-31,-30],['Q',-8,-60,31,-43]],null,person.shine,3);
      if(person.hat) rect(ctx,-44,-30,88,12,4,person.hat,ink,2);
      return;
    }
    if(person.braid) {
      for(let i=0;i<7;i++) ellipse(ctx,-45-i*.7,17+i*6,9-i*.58,7,person.hair,ink,1.8,.27);
      rect(ctx,-54,53,9,5,1.7,'#b77551',ink,1);
    }
    ellipse(ctx,-40,4,10,13,person.skin,ink,2.4);
    path(ctx,[['M',-44,2],['Q',-36,-6,-37,7]],null,person.shade,1.5);
    path(ctx,[
      ['M',-44,-19],['C',-45,-43,-23,-60,5,-59],['C',34,-59,48,-40,45,-14],
      ['C',47,4,44,18,37,28],['C',30,39,21,44,9,44],
      ['C',-16,46,-39,30,-42,11],['Z'],
    ],skin,ink,2.8);
    path(ctx,[
      ['M',-42,8],['C',-58,-1,-58,-37,-40,-52],['Q',-22,-70,2,-63],
      ['Q',27,-75,43,-63],['Q',36,-59,45,-57],['Q',56,-56,50,-44],
      ['Q',33,-39,21,-48],['Q',-4,-27,-31,-35],['Q',-35,-10,-42,-11],['Z'],
    ],person.hair,ink,2.8);
    path(ctx,[['M',-45,-30],['Q',-31,-55,-1,-55],['Q',19,-64,36,-60]],null,person.shine,3.4);
    path(ctx,[['M',-37,-29],['Q',-26,-43,-12,-41]],null,person.shine,1.4);
    if(person.hat) {
      path(ctx,[['M',-51,-33],['C',-55,-67,-19,-80,12,-74],['Q',41,-70,49,-45],['Z']],person.hat,ink,2.8);
      rect(ctx,-50,-44,100,16,5,person.hat,ink,2.3);
      for(let i=0;i<8;i++) line(ctx,[[-45+i*12,-42],[-43+i*12,-31]],'#27333067',1.3);
    }

    const blinkTime=(clock+seed*.74)%(3.9+noise(seed)*1.2);
    const lid=1-Math.max(blink,pulse(blinkTime,2.68,2.75,2.83));
    for(const [i,x,rx] of [[0,-11,10],[1,24,8.6]]) {
      const h=(3.6+emotion.open*5.5)*(i===0?1:.92)*lid;
      const eyeY=-9+(i?1:0);
      if(h<1.2) {
        path(ctx,[['M',x-rx,eyeY],['Q',x,eyeY+2,x+rx,eyeY]],null,ink,2);
      } else {
        const eye=[['M',x-rx,eyeY],['Q',x-1,eyeY-h*1.73,x+rx,eyeY],
          ['Q',x+1,eyeY+h*1.38,x-rx,eyeY],['Z']];
        path(ctx,eye,'#fae7c6',ink,1.45);
        layer(ctx,()=>{
          ctx.clip();
          const px=x+gaze[0]*rx*.48;
          const py=eyeY+gaze[1]*h*.52;
          ellipse(ctx,px,py,i?3.25:3.85,4.3,'#4c3839');
          ellipse(ctx,px,py,2.02,2.9,'#272031');
          ellipse(ctx,px+.95,py-1.65,1,.9,'#fff1d2');
        });
      }
      const browY=-20-emotion.inner*5.1;
      const inner=x+(i?-7:9);
      const outer=x+(i?8:-11);
      path(ctx,[['M',outer,browY+emotion.tension*5+(i?1:0)],
        ['Q',x,browY-3.2,inner,browY-emotion.inner*2.7]],null,person.hair,2.75);
    }
    if(person.glasses) {
      rect(ctx,-25,-21,28,25,6,'#557d9017',ink,2.15);
      rect(ctx,12,-20,24,25,6,'#557d9017',ink,2.05);
      path(ctx,[['M',3,-11],['Q',8,-16,12,-11]],null,ink,1.95);
      line(ctx,[[-25,-12],[-42,-17]],ink,1.8);
      line(ctx,[[-21,-16],[-14,-16]],'#fff0ca88',1.65);
      line(ctx,[[16,-15],[21,-15]],'#fff0ca78',1.45);
    }
    // Keep the nose on the face plane so it mirrors and tilts with the eyes and mouth.
    path(ctx,[['M',12,3],['Q',14,8,18,11],['Q',21,14,17,16],['Q',14,17,11,15]],
      null,person.shade,1.65);
    const mouthX=16;
    const curve=emotion.smile*7.6-emotion.tension*2.5;
    if(emotion.mouth>.11) {
      path(ctx,[['M',mouthX-6,23],['Q',mouthX+2,20,mouthX+8,23],['Q',mouthX+2,24+emotion.mouth*20,mouthX-6,23],['Z']],'#553039',ink,1.15);
    } else {
      path(ctx,[['M',mouthX-9,23],['Q',mouthX-1,23+curve,mouthX+9,22-emotion.smile*2]],null,'#643b3b',2);
    }
    if(emotion.tension>.37) path(ctx,[['M',15,34],['Q',22,35,26,32]],null,person.shade,1.45);
  });
}

function shoe(ctx, person, [x,y], pitch, far) {
  layer(ctx,()=>{
    ctx.translate(x,y);
    ctx.rotate(pitch);
    const leather=far?'#352d38':'#3b3039';
    path(ctx,[['M',-10,-2],['L',-9,-12],['Q',-4,-17,5,-13],['Q',9,-8,17,-8],
      ['Q',25,-7,26,-1],['Q',27,3,20,3],['L',-9,3],['Z']],leather,ink,2.3);
    path(ctx,[['M',-8,1],['L',20,1],['Q',23,1,24,-1]],null,far?'#67565b':'#907365',1.6);
    line(ctx,[[2,-10],[11,-8]],person.shine,1.45);
  });
}

function palm(ctx, person, at, rotation, grip, far) {
  layer(ctx,()=>{
    ctx.translate(...at);
    ctx.rotate(rotation);
    const shape=grip==='fist'?
      [['M',-8,-6],['Q',2,-11,9,-5],['Q',15,1,8,7],['Q',0,10,-8,6],['Z']]:
      [['M',-9,-6],['Q',-1,-11,4,-7],['L',grip==='pinch'?12:14,-4],
        ['Q',17,-2,13,1],['L',7,1],['Q',14,3,11,6],['Q',3,12,-9,6],['Z']];
    path(ctx,shape,far?person.shade:person.skin,ink,1.9);
    path(ctx,[['M',-3,-3],['Q',1,-7,7,-4]],null,person.light,1.4);
  });
}

export function gripThumb(ctx, person, target, angle, scale=1) {
  layer(ctx,()=>{
    ctx.translate(...target);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    path(ctx,[['M',-8,5],['Q',-3,-1,4,-3],['Q',10,-3,10,0],['Q',8,4,2,5],['L',-6,8]],
      person.skin,ink,1.6);
    path(ctx,[['M',1,-.4],['Q',5,-1.8,8,-.8]],null,person.light,1.2);
  });
}

export function performer(ctx, person, {
  x,y,scale=1,facing=1,clock=0,seed=1,lean=0,tilt=0,bob=0,drive=0,verticalDrive=0,
  feet, near, far, emotion=moods.neutral,gaze=[0,0],blink=0,counter,back=false,opacity=1,
}) {
  const ankleHeight=10;
  const hips=[[-11,-92],[10,-92]];
  const upperLeg=43;
  const lowerLeg=41;
  const legReach=upperLeg+lowerLeg-.5;
  const soles=hips.map((hip,index)=>{
    const floor=feet?.[index];
    const point=floor?[(floor.point[0]-x)*facing/scale,(floor.point[1]-y)/scale]:[hip[0]+(index?3:-1),0];
    return {point,pitch:floor?.pitch ?? 0};
  });
  // Let the pelvis settle during a long stance instead of stretching a shin.
  let bodyBob=bob;
  if(feet) {
    for(const [index,{point,pitch}] of soles.entries()) {
      const hip=hips[index];
      const dx=point[0]+Math.sin(pitch)*ankleHeight-hip[0];
      const limit=Math.sqrt(Math.max(0,legReach**2-dx**2));
      bodyBob=Math.max(bodyBob,point[1]-Math.cos(pitch)*ankleHeight-hip[1]-limit);
    }
  }
  const toLocal=([wx,wy])=>[(wx-x)*facing/scale,(wy-y)/scale-bodyBob];
  const arms=[
    {target:far, root:[25+lean,-140], isFar:true},
    {target:near, root:[-27+lean,-140], isFar:false},
  ];
  const armsPosed=arms.map(({target,root,isFar})=>{
    const pointFrom=(point,angle,length)=>[point[0]+Math.cos(angle)*length,point[1]+Math.sin(angle)*length];
    const swing=drive*(isFar?1:-1)*facing;
    if(!target) {
      // Pose the swing from the shoulder. A close hand target makes IK fold the elbow across the body.
      const outward=isFar?-.13:.13;
      const upper=Math.PI/2+outward-.56*swing;
      const flex=.10+.19*verticalDrive*(1+swing);
      const rotation=upper-flex;
      const joint=pointFrom(root,upper,42);
      return {root,joint,end:pointFrom(joint,rotation,36),rotation,isFar,grip:verticalDrive>.3?'fist':'loose'};
    }
    const at=toLocal(target.point);
    const explicitElbow=target.elbow && toLocal(target.elbow);
    const direction=target.angle;
    const aim=direction==null?null:Math.atan2(Math.sin(direction),Math.cos(direction)*facing);
    let rotation=aim ?? Math.atan2(at[1]-root[1],at[0]-root[0]);
    let solved;
    for(let i=0;i<4;i++) {
      const wrist=pointFrom(at,rotation,-5);
      solved=explicitElbow?{joint:explicitElbow,end:wrist}:hinge(root,wrist,49,45,target.bend ?? (isFar?1:-1));
      const forearm=Math.atan2(solved.end[1]-solved.joint[1],solved.end[0]-solved.joint[0]);
      const turn=aim==null?0:Math.atan2(Math.sin(aim-forearm),Math.cos(aim-forearm));
      rotation=forearm+clamp(turn,-.59,.59);
    }
    return {root,...solved,rotation,grip:target.grip ?? 'loose',isFar};
  });
  const paintArm=limb=>{
    const {root,joint,end,rotation,isFar,grip}=limb;
    fabricLimb(ctx,root,joint,end,isFar?14.5:17.5,isFar?person.shadow:person.cloth,isFar?person.cloth:person.lit,person.shadow);
    layer(ctx,()=>{
      ctx.translate(...end);
      ctx.rotate(Math.atan2(end[1]-joint[1],end[0]-joint[0]));
      rect(ctx,-9,-7.2,10,14.4,1.8,isFar?person.cloth:person.shadow,ink,1.65);
      line(ctx,[[-5,-5],[-5,5]],person.lit,1.2);
    });
    palm(ctx,person,[end[0]+Math.cos(rotation)*5,end[1]+Math.sin(rotation)*5],rotation,grip,isFar);
  };
  const inLocal=fn=>layer(ctx,()=>{
    ctx.translate(x,y);
    ctx.scale(scale*facing,scale);
    ctx.translate(0,bodyBob);
    fn();
  });

  layer(ctx,()=>{
    ctx.globalAlpha*=opacity;
    if(counter==null) ellipse(ctx,x+3,y+2,42*scale,7.2*scale,'#2118296b');
    layer(ctx,()=>{
      if(counter!=null) {
        ctx.beginPath();
        ctx.rect(-2400,-1500,4800,counter+1500);
        ctx.clip();
      }
      inLocal(()=>{
        for(const [index,isFar] of [[0,true],[1,false]]) {
          const {point,pitch}=soles[index];
          const sole=[point[0],point[1]-bodyBob];
          const ankle=[sole[0]+Math.sin(pitch)*ankleHeight,sole[1]-Math.cos(pitch)*ankleHeight];
          const hip=hips[index];
          const leg=hinge(hip,ankle,upperLeg,lowerLeg,-1);
          fabricLimb(ctx,hip,leg.joint,leg.end,isFar?15:18,isFar?'#292838':person.pants,'#635464','#322f44');
          shoe(ctx,person,sole,pitch,isFar);
        }
        paintArm(armsPosed[0]);
        const cloth=linear(ctx,-48,-155,51,-85,[[0,person.lit],[.48,person.cloth],[1,person.shadow]]);
        path(ctx,[
          ['M',-15+lean,-162],['Q',-33+lean,-158,-38+lean,-137],['L',-33,-91],
          ['Q',-3,-78,34,-88],['L',36+lean,-137],['Q',30+lean,-155,13+lean,-162],['Z'],
        ],cloth,ink,2.9);
        if(!back) path(ctx,[['M',-14+lean,-160],['Q',1+lean,-150,15+lean,-160],['L',18+lean,-150],
          ['Q',1+lean,-136,-17+lean,-153],['Z']],person.shadow,ink,1.65);
        path(ctx,[['M',-26,-99],['Q',-4,-91,24,-97]],null,person.shadow,1.5);
        face(ctx,person,{emotion,gaze,clock,seed,tilt,lean,back,blink});
      });
    });
    inLocal(()=>paintArm(armsPosed[1]));
  });
}
