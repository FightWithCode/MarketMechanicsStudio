import {broker,extras,trader} from './cast.mjs';
import {camera,cover,easeOut,ellipse,ink,layer,lettering,line,mix,noise,path,pulse,radial,rect,smooth,step} from './paint.mjs';
import {gait,gripThumb,mood,performer} from './performer.mjs';
import {paddle,quoteBoard,rain,splashes,ticket} from './props.mjs';

function umbrella(ctx,x,y,size) {
  layer(ctx,()=>{
    ctx.translate(x,y);
    ctx.rotate(-.12);
    ctx.scale(size,size);
    line(ctx,[[0,0],[0,61]],'#302837',3);
    path(ctx,[['M',-65,6],['Q',-55,-35,0,-43],['Q',52,-38,64,6],['Q',50,-5,35,5],
      ['Q',17,-5,0,5],['Q',-16,-4,-32,5],['Q',-47,-7,-65,6],['Z']],'#6b4b65',ink,2.7);
    path(ctx,[['M',-33,4],['Q',-26,-27,0,-41],['Q',24,-30,33,3]],null,'#d7a89f65',1.7);
  });
}

function street(ctx,view,assets,p,hurrying) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const focus=hurrying?smooth(p,0,.78):p*.65;
  camera(ctx,view,1.02+focus*.17,[c+(portrait?-12:-58)*(1-focus),h/2+22],()=>{
    const plate=cover(ctx,assets.street,w,h,{focusX:.488,anchor:.711,y:481});
    const door=plate.x+plate.w*.488;
    const pavement=plate.y+plate.h*.793;
    layer(ctx,()=>{
      ctx.translate(plate.x+plate.w*.505,plate.y+plate.h*.174);
      ctx.rotate(.185);
      lettering(ctx,'EXCHANGE',0,0,{size:portrait?17:21,color:'#523630',family:'"DejaVu Serif", serif'});
    });
    rect(ctx,0,0,w,h,0,radial(ctx,door,pavement-108,portrait?145:242,[[0,'#fcb3623e'],[1,'#fcb36200']]));
    const extrasCount=portrait?5:8;
    const walkSpace=portrait?20:37;
    for(let i=extrasCount-1;i>=0;i--) {
      const person=extras[i%extras.length];
      const size=(portrait?.43:.5)+i*.013;
      const pace=t=>smooth(t,i*.13,2.75+i*.14);
      const sample=t=>({
        x:door+37+i*walkSpace+(noise(i+44)-.5)*11-30*pace(t),
        y:pavement-15+i*5-8*pace(t),
        scale:size,
      });
      const motion=gait(sample,clock,{phaseOffset:i*.16});
      const carry=i%3===1;
      const grip=[motion.x+size*39,motion.y-size*126];
      performer(ctx,person,{
        ...motion,clock,facing:-1,seed:i,back:i%3===0,gaze:[.7,-.06],
        near:carry?{point:grip,elbow:[motion.x+size*48,motion.y-size*95],grip:'fist'}:undefined,
      });
      if(carry) umbrella(ctx,grip[0],grip[1]-60*size,size);
    }
    if(hurrying) {
      const sample=t=>{
        const phase=step(t,.14,4.7);
        const depth=smooth(phase,.05,.98);
        // A nearly constant forward speed with a shorter stride on the approach.
        const forward=.6*phase+.4*smooth(phase,0,1);
        return {
          x:mix(c-(portrait?167:462),door-14,forward),
          y:mix(pavement+73,pavement-43,depth),
          scale:mix(portrait?1.08:1.46,.48,depth),
        };
      };
      const cycle=.78;
      const motion=gait(sample,clock,{cycle,support:.52,lift:26,phaseOffset:-.14});
      const entry=smooth(clock,4.35,5.16);
      const lean=motion.verticalDrive*11;
      const fade=1-entry;
      performer(ctx,trader,{
        ...motion,clock,seed:6,gaze:[.77,-.13],lean,tilt:.08,
        emotion:mood('concerned','focused',smooth(clock,0,1.2)),opacity:fade,back:entry>.68,
      });
      if(entry<.45 && clock>.14) {
        const cyclePosition=((clock-.14)/cycle)%1;
        const frontFoot=motion.feet[cyclePosition<.5?1:0].point;
        splashes(ctx,frontFoot[0],frontFoot[1]+3,clock,4,motion.scale*.74);
      }
    }
    rain(ctx,w,h,clock,{count:portrait?74:124,seed:13,strength:hurrying?1.0:.77});
  });
}

export function hurry(ctx,view,assets,p) { street(ctx,view,assets,p,true); }

export function risingQuote(ctx,view,assets,p) {
  if(p<.31) {
    street(ctx,view,assets,step(p,0,.31),false);
    return;
  }
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const t=step(p,.31,1);
  const second=t>.43;
  const third=t>.64;
  const value=third?'$50':second?'$35':'$20';
  const flip=third?.64:second?.43:0;
  camera(ctx,view,1.035+t*.12,[c,h/2-4],()=>{
    cover(ctx,assets.pit,w,h,{anchor:.182,y:239});
    rect(ctx,0,0,w,h,0,'#211b3062');
    quoteBoard(ctx,c,289,value,{
      scale:portrait?1.22:1.80,phase:flip?smooth(t,flip,flip+.066):1,
      caption:'ILLUSTRATIVE QUOTE',red:third,
    });
    const count=portrait?4:6;
    for(let i=0;i<count;i++) {
      const x=c+(i-(count-1)/2)*(portrait?102:154);
      const y=707+i%2*15;
      const s=portrait?.81:1.06;
      performer(ctx,extras[i%5],{x,y,scale:s,clock,seed:i,back:i%3===1,
        facing:i%2?1:-1,tilt:mix(.02,-.14,smooth(t,.37+i*.04,.71)),
        gaze:[.21,-.85],emotion:mood('neutral','notice',pulse(t,.40+i*.045,.63+i*.031,.92)),
      });
    }
  });
}

function bid(ctx, person, {x,y,scale,facing=1,clock,seed,up=0,back=false,emotion}) {
  const lift=[x-facing*mix(34,62,up)*scale,y-mix(91,207,up)*scale];
  const elbow=[x-facing*mix(37,57,up)*scale,y-mix(117,141,up)*scale];
  const angle=facing*mix(-.16,.07,up);
  performer(ctx,person,{
    x,y,scale,facing,clock,seed,back,emotion,gaze:[.7,-.47],lean:up*4,
    tilt:-up*.10,near:{point:lift,elbow,angle:-Math.PI/2,grip:'fist'},
  });
  paddle(ctx,lift[0],lift[1],seed,{scale:scale*.85,angle,color:person===trader?'#e4b768':'#cfac81'});
  gripThumb(ctx,person,[lift[0],lift[1]+1],-Math.PI/2,scale*.78);
  return lift;
}

function hall(ctx,view,assets,p,cascade) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const fill=.31;
  const chapter=cascade ? 'LAST TRADE' : p>fill?'FILLED · 1 SHARE':'LAST TRADE';
  const strikes=[.22,.48,.73];
  const priceIndex=cascade?strikes.filter(t=>p>=t).length:0;
  const prices=['$50','$55','$62','$70'];
  const turn=priceIndex?strikes[priceIndex-1]:0;
  const angleScale=cascade?1.035+p*.095:1.05+p*.17;
  camera(ctx,view,angleScale,[c+(portrait?0:mix(-35,25,p)),h/2+17],()=>{
    const plate=cover(ctx,assets.pit,w,h,{anchor:.48,y:341});
    const desk=plate.y+plate.h*.478;
    const ground=plate.y+plate.h*.786;
    const clap=pulse(p,.24,fill,.49);
    performer(ctx,broker,{
      x:c,y:desk+56,scale:portrait?.63:.70,counter:desk,clock,seed:4,gaze:[.35,.64],
      emotion:mood('focused','relieved',clap),near:{point:[c+30,desk-17-18*clap],angle:.06,bend:1},
    });
    quoteBoard(ctx,c,portrait?157:136,prices[priceIndex],{
      scale:portrait?.88:1.08,caption:chapter,phase:priceIndex?smooth(p,turn,turn+.051):1,red:priceIndex>1,
    });
    const seats=portrait?4:7;
    const activeHands=[];
    for(let row=0;row<2;row++) {
      for(let i=0;i<seats;i++) {
        const n=row*seats+i;
        const x=c+(i-(seats-1)/2)*(portrait?84:142)+(row===0?22:-24)+(noise(n+6)-.5)*17;
        const y=ground+row*(portrait?75:81)+(noise(n)-.5)*40;
        const scale=(row===0?.45:.65)*(portrait?.86:1)*(.92+noise(n+18)*.19);
        const order=(n*7+i)%3;
        const when=cascade?strikes[order]-.13:.53+order*.10;
        const up=pulse(p,when,when+.105,when+.31);
        const person=extras[n%extras.length];
        const hand=bid(ctx,person,{
          x,y,scale,clock,seed:n+11,up,back:i%3!==1,facing:i%2?1:-1,
          emotion:mood('concerned','focused',smooth(p,when,when+.12)),
        });
        if(up>.55 && row===0) activeHands.push({hand,when,n});
      }
    }
    const heroUp=cascade?1-smooth(p,0,.18):pulse(p,.055,.24,.64);
    const hero=bid(ctx,trader,{
      x:c-(portrait?43:132),y:portrait?666:682,scale:portrait?1.07:1.29,
      clock,seed:37,up:heroUp,
      emotion:mood('focused','relieved',smooth(p,.37,.68)),
    });
    if(!cascade && p>fill) {
      const rise=easeOut(p,fill,fill+.10);
      const x=c+(portrait?109:173);
      ticket(ctx,x,407+(1-rise)*40,'$50',{
        scale:(portrait?.92:1.08)*rise+.05,angle:-.13,label:'BOUGHT 1 SHARE',shade:'#ecd89b',
      });
    }
    if(cascade) {
      for(const {hand,when,n} of activeHands) {
        const t=step(p,when+.052,when+.143);
        if(t>0 && t<1) {
          ticket(ctx,mix(hand[0],c+(n%2?37:-34),t),mix(hand[1]-25,desk-7,t)-40*Math.sin(t*Math.PI),
            'BUY',{scale:.35,angle:mix(-.24,.35,t),label:'TO COVER'});
        }
      }
    } else if(heroUp>.73) {
      ellipse(ctx,hero[0]-15,hero[1]-48,2,2,'#ffcf86a5');
    }
  });
}

export function buyOne(ctx,view,assets,p) { hall(ctx,view,assets,p,false); }
export function feedback(ctx,view,assets,p) { hall(ctx,view,assets,p,true); }
