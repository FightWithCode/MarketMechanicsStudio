import {ellipse, ink, layer, line, linear, mix, noise, path, poly, rect} from './paint.mjs';

export const trader = {skin:'#dfa475', light:'#f7c894', shade:'#aa634e', hair:'#241f2b', shine:'#65505c', cloth:'#a86c2e', lit:'#e9aa4a', shadow:'#774628', pants:'#2c3448', glasses:true};
export const broker = {skin:'#a96849', light:'#d8986d', shade:'#784839', hair:'#afaba6', shine:'#e1d6be', cloth:'#396f66', lit:'#6d9c81', shadow:'#244943', pants:'#293b43', glasses:true, braid:true};
export const buyer = {skin:'#d49878', light:'#efbb95', shade:'#a96552', hair:'#352730', shine:'#6a4d53', cloth:'#73547b', lit:'#ac7597', shadow:'#4e3d61', pants:'#383143', hat:'#648465'};
export const extras = [
  buyer,
  {...broker, glasses:false, braid:false, cloth:'#415b7c', lit:'#7591a3', shadow:'#263950', hat:'#bf8158'},
  {...trader, glasses:false, cloth:'#737f52', lit:'#a5aa64', shadow:'#434c3c', skin:'#a3664f', light:'#d09166'},
  {...buyer, hat:null, hair:'#3a2b32', cloth:'#aa6651', lit:'#cf8867', shadow:'#6b4149'},
  {...broker, glasses:false, braid:false, cloth:'#825f5c', lit:'#ac7973', shadow:'#5d4449', hat:'#45374d'},
];

function strokeLimb(ctx, a, b, c, width, color, highlight) {
  path(ctx, [['M',...a], ['Q',mix(a[0],b[0],.85),mix(a[1],b[1],.85),...b], ['L',...c]], null, ink, width + 5);
  path(ctx, [['M',...a], ['L',...b], ['L',...c]], null, color, width);
  path(ctx, [['M',a[0]-2,a[1]-2], ['L',b[0]-2,b[1]-2], ['L',c[0]-2,c[1]-2]], null, highlight, width*.34);
}

function arm(ctx, profile, shoulder, target, side, far) {
  const wrist = [target[0], target[1]];
  const dx = wrist[0] - shoulder[0];
  const dy = wrist[1] - shoulder[1];
  const length = Math.hypot(dx,dy) || 1;
  const bend = Math.max(9, 44 - length*.32);
  const elbow = [mix(shoulder[0], wrist[0], .48) - dy / length * bend * side, mix(shoulder[1], wrist[1], .48) + dx / length * bend * side];
  const cuff = [mix(elbow[0],wrist[0],.79), mix(elbow[1],wrist[1],.79)];
  strokeLimb(ctx, shoulder, elbow, cuff, far ? 15 : 19, far ? profile.shadow : profile.cloth, far ? profile.cloth : profile.lit);
  layer(ctx, () => {
    ctx.translate(wrist[0], wrist[1]);
    ctx.rotate(Math.atan2(dy, dx));
    rect(ctx, -14, -7.5, 11, 15, 2, far ? profile.cloth : profile.shadow, ink, 2);
    ellipse(ctx, 2, 0, 12, 8, profile.skin, ink, 2.3);
    ellipse(ctx, 2, -2.2, 6, 2, profile.light);
    path(ctx, [['M',1,5],['Q',8,3,10,1]], null, profile.shade, 1.3);
  });
}

function head(ctx, profile, {tilt, gaze, expression, clock, seed, talk, front, back}) {
  layer(ctx, () => {
    ctx.translate(0,-193);
    ctx.rotate(tilt);
    if (back) {
      rect(ctx,-16,22,32,43,9,profile.shade,ink,3);
      ellipse(ctx,-42,4,10,12,profile.skin,ink,2.2);
      ellipse(ctx,42,4,10,12,profile.skin,ink,2.2);
      ellipse(ctx,0,-11,47,53,profile.hat||profile.hair,ink,3);
      path(ctx,[['M',-34,-30],['Q',-14,-67,26,-48]],null,profile.shine,3.4);
      path(ctx,[['M',-39,4],['Q',-9,28,37,3]],null,'#291f3244',2.3);
      if (profile.hat) rect(ctx,-46,-29,92,13,5,profile.hat,ink,2);
      return;
    }
    if (profile.braid) {
      for (let i=0;i<7;i++) ellipse(ctx,-43-i*.85,22+i*6,10-i*.65,9,profile.hair,ink,2,.25);
      rect(ctx,-53,58,11,5,2,'#bc7a4e',ink,1);
    }
    rect(ctx,-13,27,29,38,9,profile.shade,ink,3);
    ellipse(ctx,-40,4,10,14,profile.skin,ink,2.6);
    path(ctx, [['M',-43,-2],['Q',-37,-5,-38,7]],null,profile.shade,1.7);
    const skin = linear(ctx,-45,-48,48,37,[[0,profile.light],[.62,profile.skin],[1,profile.shade]]);
    path(ctx, [
      ['M',-45,-17],['C',-46,-45,-18,-62,12,-59],['C',37,-58,48,-37,46,-14],
      ['Q',46,-7,49,-3],['Q',59,5,49,10],['L',44,11],['C',42,37,25,49,-2,45],
      ['C',-26,42,-43,24,-43,8],['Z'],
    ],skin,ink,3.2);
    ellipse(ctx,25,17,11,5,profile.shade,null,0,-.15);
    path(ctx, [
      ['M',-42,9],['Q',-57,-1,-54,-28],['C',-50,-55,-29,-68,-4,-66],
      ['Q',18,-76,41,-65],['Q',36,-61,43,-58],['Q',54,-56,52,-44],
      ['Q',33,-38,22,-47],['Q',-1,-27,-30,-36],['Q',-34,-9,-41,-11],['Z'],
    ],profile.hair,ink,3);
    path(ctx,[['M',-45,-33],['Q',-29,-59,-3,-57],['Q',21,-63,38,-60]],null,profile.shine,3.8);
    path(ctx,[['M',-37,-27],['Q',-19,-39,-8,-39]],null,profile.shine,1.7);
    if (profile.hat) {
      path(ctx,[['M',-52,-32],['C',-60,-73,-13,-83,24,-73],['Q',47,-68,50,-47],['Z']],profile.hat,ink,3);
      rect(ctx,-53,-44,106,16,6,profile.hat,ink,2.5);
      for(let i=0;i<8;i++) line(ctx,[[-48+i*13,-42],[-46+i*13,-31]],'#27333066',1.4);
    }

    const worry = expression === 'alarm' || expression === 'doubt';
    const smile = expression === 'smile';
    const blink = (clock + seed*.81) % (3.3 + noise(seed)*1.5);
    const closed = blink > 3.12 && blink < 3.23;
    const eyeSize = closed ? 1.3 : worry ? 9.8 : 7.2;
    const left = front ? -19 : -10;
    const right = front ? 17 : 26;
    for (const [x, narrow] of [[left,false],[right,!front]]) {
      const pupil = gaze * 3.5;
      ellipse(ctx,x,-9,narrow?7.6:10.2,eyeSize,closed?ink:'#f5dfbb',ink,1.45);
      if (!closed) {
        ellipse(ctx,x+pupil,-8.5,narrow?3.1:4.0,worry?5.3:4.8,'#30232a');
        ellipse(ctx,x+pupil+1,-10.8,1.5,1.2,'#ffeed5');
      }
    }
    path(ctx,[['M',left-10,worry?-22:-21],['Q',left-3,worry?-28:-24,left+10,worry?-25:-20]],null,profile.hair,3.5);
    path(ctx,[['M',right-7,worry?-24:-20],['Q',right+1,worry?-29:-23,right+9,worry?-22:-20]],null,profile.hair,3.2);
    if (profile.glasses) {
      const lens='#5b8e9430';
      rect(ctx,left-16,-22,30,27,7,lens,ink,2.65);
      rect(ctx,right-12,-22,25,26,7,lens,ink,2.55);
      line(ctx,[[left+14,-13],[right-12,-13]],ink,2.4);
      line(ctx,[[left-16,-14],[-41,-18]],ink,2.2);
      line(ctx,[[left-11,-17],[left-2,-17]],'#ffe1b49f',2);
      line(ctx,[[right-7,-17],[right-1,-17]],'#ffe1b48f',1.6);
    }
    const mx = front ? 4 : 20;
    const speaking = talk && Math.sin(clock*22)+Math.sin(clock*37) > -.16;
    if (speaking || expression === 'alarm') {
      ellipse(ctx,mx,24,speaking?9:7,speaking?4.8+Math.sin(clock*16)*2.4:7.3,'#4a2930',ink,1.5);
      if (speaking) line(ctx,[[mx-4,22],[mx+4,22]],'#f8e0bf',1.5);
    } else {
      path(ctx,[['M',mx-9,24],['Q',mx+1,24+(smile?10:worry?-7:1),mx+10,22]],null,'#5d3433',2.6);
    }
    if (worry) path(ctx,[['M',mx-4,34],['Q',mx+3,36,mx+7,32]],null,profile.shade,1.4);
  });
}

// The foot point, hand targets, and prop contacts all use the same stage coordinates.
export function actor(ctx, profile, {
  x, y, scale=1, facing=1, clock=0, seed=1, action='stand', expression='neutral',
  left, right, gaze=.1, tilt=0, talk=false, lean=0, front=false, back=false, opacity=1, shadow=true,
}) {
  const running = action === 'run';
  const moving = action === 'walk' || running;
  const phase = clock * (running ? 18.2 : 11.5) + seed*.7;
  const bob = moving ? -Math.abs(Math.sin(phase)) * (running ? 14 : 5) : Math.sin(clock*2.9 + seed)*1.8;
  const local = target => [(target[0]-x)/scale*facing, (target[1]-y)/scale-bob];
  const swing = moving ? Math.sin(phase) * (running ? 55 : 31) : 2;
  const lift = moving ? (running ? 37 : 15) : 0;
  layer(ctx, () => {
    ctx.globalAlpha *= opacity;
    if (shadow) ellipse(ctx,x+5,y-1,47*scale,10*scale,'#21182965');
    ctx.translate(x,y);
    ctx.scale(scale*facing,scale);
    ctx.translate(0,bob);
    const shoulderBack = [-24 + lean,-136];
    const shoulderNear = [26 + lean,-137];
    const handBack = left ? local(left) : [-33 + lean + swing*.72,-88 - Math.max(0,-swing*.23)];
    const handNear = right ? local(right) : [32 + lean - swing*.72,-89 - Math.max(0,swing*.26)];
    for (const [side,color] of [[-1,profile.pants],[1,profile.pants]]) {
      const stride = side*swing;
      const height = -Math.max(0,Math.sin(phase)*side) * lift;
      const hip = [side*15,-82];
      const knee = [side*16+stride*.46,-44+height*.23];
      const foot = [side*18+stride,-7+height];
      strokeLimb(ctx,hip,knee,foot,18,color,side<0?'#494052':'#5b5363');
      ellipse(ctx,foot[0]+7,foot[1]+1,17,7,'#332d36',ink,2.8,.04);
      line(ctx,[[foot[0]-4,foot[1]+4],[foot[0]+19,foot[1]+4]],'#786571',1.6);
    }
    arm(ctx,profile,shoulderBack,handBack,-1,true);
    const cloth = linear(ctx,-45,-165,52,-73,[[0,profile.lit],[.47,profile.cloth],[1,profile.shadow]]);
    path(ctx,[
      ['M',-14+lean,-161],['Q',-35+lean,-158,-41+lean,-137],
      ['L',-35,-88],['Q',-3,-74,39,-86],['L',41+lean,-134],
      ['Q',34+lean,-153,15+lean,-161],['Z'],
    ],cloth,ink,3.2);
    if (!back) path(ctx,[['M',-15+lean,-159],['Q',3+lean,-146,17+lean,-159],['L',18+lean,-150],['Q',2+lean,-136,-19+lean,-153],['Z']],profile.shadow,ink,1.8);
    path(ctx,[['M',-32,-97],['Q',2,-88,34,-96]],null,profile.shadow,1.9);
    path(ctx,[['M',-22,-127],['Q',-12,-123,-5,-113]],null,profile.lit,2.3);
    arm(ctx,profile,shoulderNear,handNear,1,false);
    layer(ctx, () => {
      ctx.translate(lean,0);
      head(ctx,profile,{tilt,gaze,expression,clock,seed,talk,front,back});
    });
  });
}

export function reachingHand(ctx, x, y, rotation, {scale=1, sleeve='#a86c2e', skin='#dfa475', length=97}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(rotation);
    ctx.scale(scale,scale);
    const flare=Math.min(35,Math.max(0,length-97)*.14);
    const fabric=linear(ctx,0,-23-flare,0,24+flare,[[0,sleeve],[.53,sleeve],[1,'#4f3344']]);
    path(ctx,[
      ['M',-length,-24-flare],['Q',-length*.49,-30-flare*.21,-12,-17],
      ['L',-8,18],['Q',-length*.51,21+flare*.28,-length,26+flare],['Z'],
    ],fabric,ink,3);
    path(ctx,[['M',-length,-17-flare],['Q',-length*.55,-19-flare*.27,-35,-11]],null,'#f0bc7d3a',2.5);
    path(ctx,[['M',-49,12],['Q',-34,10,-22,13]],null,'#51374587',1.7);
    rect(ctx,-19,-18,15,38,3,'#754e36',ink,2.3);
    path(ctx,[
      ['M',-5,-14],['Q',11,-19,21,-13],['L',49,-5],['Q',57,0,53,6],
      ['Q',51,10,42,7],['L',26,4],['Q',47,13,42,20],['Q',39,24,30,18],
      ['Q',41,24,34,27],['Q',29,31,15,21],['Q',1,22,-6,14],['Z'],
    ],skin,ink,2.6);
    path(ctx,[['M',8,-8],['Q',20,-13,32,-6]],null,'#f2bb87',2.1);
  });
}
