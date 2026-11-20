import {actor, broker, extras, reachingHand, trader} from './cast.mjs';
import {camera, clamp, cover, easeOut, ellipse, ink, layer, lettering, line, linear, mix, noise, path, poly, pulse, radial, rect, smooth, step} from './paint.mjs';
import {actionLines, deskShadow, gavel, gear, paddle, quoteBoard, rain, splashes, ticket, worktop} from './props.mjs';

const mono='"DejaVu Sans Mono", monospace';

function umbrella(ctx,x,y,scale,shade,clock) {
  layer(ctx,()=>{
    ctx.translate(x,y);
    ctx.rotate(-.14+Math.sin(clock*3)*.035);
    ctx.scale(scale,scale);
    line(ctx,[[0,-15],[0,60]],'#32283a',3);
    path(ctx,[['M',-65,5],['Q',-59,-37,0,-42],['Q',52,-38,64,5],['Q',50,-8,36,5],
      ['Q',18,-6,0,5],['Q',-17,-6,-34,5],['Q',-48,-7,-65,5],['Z']],shade,ink,3);
    path(ctx,[['M',-34,4],['Q',-27,-31,0,-41],['Q',22,-32,35,3]],null,'#e6a99b54',1.7);
    line(ctx,[[0,-40],[0,4]],'#e0a6994e',1.5);
    ellipse(ctx,0,-43,3,3,'#ca9785',ink,1.2);
  });
}

function streetShot(ctx,view,assets,p,running) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const subject=[c+mix(portrait?-27:-65,portrait?2:33,p),h/2+mix(3,48,p)];
  const push=running ? 1.05+p*.21 : 1.01+p*.07;
  camera(ctx,view,push,subject,() => {
    const plate=cover(ctx,assets.street,w,h,{focusX:.487,anchor:.712,y:482});
    const doorX=plate.x+plate.w*.487;
    const pavement=plate.y+plate.h*.792;
    const signX=plate.x+plate.w*.505;
    const signY=plate.y+plate.h*.174;
    const count=portrait?6:10;
    layer(ctx,()=>{
      ctx.translate(signX,signY);
      ctx.rotate(.185);
      lettering(ctx,'EXCHANGE',0,0,{size:portrait?17:21,weight:900,color:'#4d332b',family:'"DejaVu Serif", serif'});
    });
    const glow=running?pulse(p,.56,.87,1):.18+smooth(p,.04,.9)*.25;
    rect(ctx,0,0,w,h,0,radial(ctx,doorX,pavement-101,portrait?150:235,[[0,'rgba(255,166,61,'+glow+')'],[1,'#ffa63d00']]));
    for(let i=count-1;i>=0;i--) {
      const spacing=portrait?19:37;
      const time=clock*.9+i*.64;
      const jitter=(noise(i+12)-.5)*19;
      const curve=.16+i/count*.84;
      const x=doorX+(i+1)*spacing-28*Math.sin(curve*2)-22*(time%1)+jitter;
      const y=pavement-19+i*4.9;
      const size=(portrait?.42:.49)+i*.018;
      const profile=extras[i%extras.length];
      actor(ctx,profile,{x,y,scale:size,clock:time,seed:i,facing:-1,action:'walk',opacity:.62+curve*.26});
      if(i%3===1) umbrella(ctx,x,y-size*237,size*.95,i%2?'#503e53':'#715349',time);
      if(i%3===0) splashes(ctx,x,y,clock,i,size);
    }
    const walking=running?step(p,.01,.81):step(p,.02,.98);
    const x=running?mix(c-(portrait?243:504),doorX-13,easeOut(walking,0,1)):mix(-95,w+81,walking);
    const y=running?mix(pavement+103,pavement-26,smooth(p,.12,.88)):pavement+50;
    const s=running?mix(portrait?1.24:1.64,.52,smooth(p,.12,.88)):portrait?.75:.94;
    const opacity=running?1-smooth(p,.83,.995):.96;
    if (running) {
      splashes(ctx,x-13,y,clock,2,s);
      splashes(ctx,x-44,y+1,clock,2.61,s*.78);
      actor(ctx,trader,{x,y,scale:s,clock,seed:6,action:'run',facing:1,expression:'alarm',
        tilt:.13,lean:16,gaze:1,opacity});
      if (p>.05 && p<.58) {
        layer(ctx,()=>{
          ctx.globalAlpha=pulse(p,.05,.24,.62)*.35;
          actionLines(ctx,x-22,y-113,clock%1,.6,60);
        });
      }
    } else {
      actor(ctx,extras[3],{x,y,scale:s,clock,action:'walk',seed:6});
      umbrella(ctx,x+13,y-s*239,s*1.04,'#726c79',clock);
      splashes(ctx,x,y,clock,4,s);
    }
    rain(ctx,w,h,clock,{count:portrait?63:139,seed:13,strength:running?1.2:.8});
    layer(ctx,()=>{
      ctx.globalAlpha=.24;
      for(let i=0;i<8;i++) {
        const xx=plate.x+plate.w*(.21+.086*i)+Math.sin(clock*5+i)*4;
        const length=5+19*noise(i+17);
        ellipse(ctx,xx,pavement+14+(i%3)*17,2,length,'#f4b873',null,0,-.12);
      }
    });
  });
}

function boardInsert(ctx,view,assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const price=p<.24?'$20':p<.51?'$35':'$50';
  const change=p<.24?0:p<.51?.24:.51;
  const phase=.25+.75*smooth(p,change,change+.14);
  camera(ctx,view,1.07+p*.105,[c,h/2-8],()=>{
    cover(ctx,assets.pit,w,h,{anchor:.182,y:245});
    rect(ctx,0,0,w,h,0,'#24203157');
    rect(ctx,0,0,w,h,0,radial(ctx,c,318,330,[[0,'#f49a5b42'],[1,'#d8694300']]));
    for (let i=0;i<6;i++) {
      const xx=c+(i-2.5)*(portrait?71:149);
      actor(ctx,extras[i%5],{x:xx,y:685+(i%2)*15,scale:portrait?.85:1.02,clock,seed:i,
        gaze:.8,tilt:-.13,expression:'doubt',opacity:.61});
    }
    quoteBoard(ctx,c,320,price,{scale:portrait?1.18:1.81,phase,caption:'ILLUSTRATIVE QUOTE',red:p>.51});
    const pop=pulse(p,.50,.57,.78);
    if(pop) actionLines(ctx,c,320,clock%1,pop*.85,portrait?125:187);
  });
}

export function priceRises(ctx,view,assets,p) {
  if(p<.48) streetShot(ctx,view,assets,step(p,0,.48),false);
  else boardInsert(ctx,view,assets,step(p,.48,1));
}

export function race(ctx,view,assets,p) {
  streetShot(ctx,view,assets,p,true);
}

function raisedHand(x,y,scale,p,side) {
  return [x+side*52*scale, y - (144+134*p)*scale];
}

function auctionCrowd(ctx,view,assets,p,cascade=false) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const impact= cascade?pulse(p,.43,.5,.72):pulse(p,.5,.58,.74);
  const cameraOffset=impact*Math.sin(clock*45)*3.2;
  const lift=(!cascade?smooth(p,.19,.48):smooth(p,.29,.75));
  const scale=cascade ? 1.02+p*.055 : 1.02+p*.14;
  camera(ctx,view,scale,[c+cameraOffset,h/2+(cascade?-8:18)],()=>{
    const plate=cover(ctx,assets.pit,w,h,{anchor:.48,y:341});
    const desk=plate.y+plate.h*.478;
    const floor=plate.y+plate.h*.781;
    const auctioneer=[c,desk+61];
    layer(ctx,()=>{
      ctx.beginPath();
      ctx.rect(0,0,w,desk+3);
      ctx.clip();
      const s=portrait?.62:.73;
      actor(ctx,broker,{
        x:auctioneer[0],y:auctioneer[1],scale:s,clock,front:true,talk:true,gaze:.55,
        tilt:-.08,
        right:[auctioneer[0]+32,desk-(25+lift*55)],
        left:[auctioneer[0]-19,desk-7],
        shadow:false,
      });
    });
    const values=['$50','$60','$72','$91'];
    const phase=clamp(p*4.1+.29,0,3.9);
    const ix=cascade?Math.floor(phase):0;
    const boardY=portrait?154:136;
    quoteBoard(ctx,c,boardY,values[ix],{scale:portrait?.85:1.07,phase:cascade?smooth(phase%1,0,.37):1,red:ix>1});
    const seats=portrait?4:7;
    for(let row=0;row<2;row++) {
      for(let i=0;i<seats;i++) {
        const seed=i+row*8;
        const x=c+(i-(seats-1)/2)*(portrait?84:131)+(row===0?25:-15)+(noise(seed+6)-.5)*24;
        const y=floor+row*(portrait?83:77)+(noise(seed)-.5)*48;
        const s=(row===0?.46:.7)*(portrait?.84:1)*(.89+noise(seed+18)*.29);
        const up=cascade ? smooth(p,.14+(seed%4)*.13,.39+(seed%4)*.13) : pulse(p,.30+(seed%5)*.06,.69+(seed%4)*.05,.99);
        const side=i%2?1:-1;
        const hand=raisedHand(x,y,s,up,side);
        actor(ctx,extras[seed%5],{x,y,scale:s,clock,seed,lean:(up*12),facing:side,
          tilt:-.12, gaze:.8,expression:up>.7?'alarm':'doubt',right:hand,talk:up>.9,back:seed%3!==0});
        if (seed%3!==0 || cascade) paddle(ctx,hand[0],hand[1],19+seed*7,{scale:s*.88,angle:side*(.28-up*.37),color:seed%2?'#d8a57c':'#d5bc82'});
      }
    }
    const arrive=easeOut(p,0,.25);
    const bx=c+(portrait?-24:-133)+(1-arrive)*(portrait?-245:-280);
    const by=portrait?661:680;
    const size=portrait?1.08:1.32;
    const bid=cascade?1-pulse(p,.11,.44,.7)*.54:smooth(p,.26,.52);
    const hand=raisedHand(bx,by,size,bid,1);
    actor(ctx,trader,{x:bx,y:by,scale:size,clock,seed:11,action:arrive<.85?'run':'stand',
      gaze:.95, tilt:-bid*.18,lean:bid*7,expression:'alarm',right:hand,front:portrait});
    paddle(ctx,hand[0],hand[1],37,{scale:size*.93,angle:-bid*.29,color:'#dfad67'});
    if(impact>.04) actionLines(ctx,hand[0],hand[1]-45,clock%1,impact*.43,47);
    if(cascade) {
      for(let i=0;i<8;i++) {
        const t=(clock*.6+noise(i+12))%1;
        const xx=c+(noise(i+6)-.5)*w*.78+Math.sin(t*8+i)*22;
        const y=365+t*254;
        layer(ctx,()=>{
          ctx.globalAlpha=(1-t)*.52;
          ticket(ctx,xx,y,'BUY',{scale:.19+noise(i+2)*.16,angle:Math.sin(t*6+i)*1.7});
        });
      }
    }
  });
}

function hammerStrike(ctx,view,_assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  worktop(ctx,w,h,clock);
  const hit=smooth(p,.12,.53);
  const recoil=pulse(p,.53,.64,.91);
  const scale=portrait?1.56:2.05;
  const y=368;
  const x=c-(portrait?29:38);
  deskShadow(ctx,c+8,y+78,portrait?137:250,38);
  ellipse(ctx,c,y+66,portrait?115:168,45,'#8b5d4d',ink,4);
  ellipse(ctx,c,y+53,portrait?115:168,36,'#b17753',ink,3.8);
  ellipse(ctx,c,y+52,portrait?92:143,26,null,'#e3a979',2.1);
  const hammerY=y-124*(1-hit)-29*recoil;
  const angle=-.56+.6*hit-.24*recoil;
  gavel(ctx,x,hammerY,angle,scale);
  reachingHand(ctx,x+Math.cos(angle)*121*scale,hammerY+Math.sin(angle)*121*scale,3.2+angle,{scale:scale*.82,length:portrait?190:460,sleeve:broker.cloth,skin:broker.skin});
  if(p>.51) actionLines(ctx,x,y+23,p,.9*pulse(p,.51,.57,.84),portrait?106:150);
  if(p>.7) ticket(ctx,c+(portrait?91:184),y+135,'$50',{scale:portrait?1.27:1.55,angle:.23,label:'TRADE FILLED'});
}

export function coverTrade(ctx,view,assets,p) {
  if(p<.7) auctionCrowd(ctx,view,assets,step(p,0,.7),false);
  else hammerStrike(ctx,view,assets,step(p,.7,1));
}

function mechanism(ctx,view,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const advance=smooth(p,0,.97);
  const stepY=portrait?112:103;
  const stepX=portrait?65:155;
  const baseY=portrait?538:550;
  const spin=advance*2.9;
  const rows=[
    {x:c-stepX,y:baseY,price:'$50'},
    {x:c,y:baseY-stepY,price:'$60'},
    {x:c+stepX,y:baseY-stepY*2,price:'$72'},
  ];
  rect(ctx,0,0,w,h,0,linear(ctx,0,0,w,h,[[0,'#333046'],[.53,'#273844'],[1,'#171b2b']]));
  rect(ctx,0,0,w,h,0,radial(ctx,c,350,portrait?345:550,[[0,'#e4ab703f'],[1,'#e8a66100']]));
  for(let i=0;i<18;i++) {
    const x=noise(i+44)*w;
    const y=(noise(i+86)*h+clock*12)%h;
    ellipse(ctx,x,y,1.6,1.2,'#d9af8566');
  }
  camera(ctx,view,(portrait?.93:1.07)+advance*.12,[c+advance*stepX*.1,366-advance*41],()=>{
    for(let i=0;i<3;i++){
      const row=rows[i];
      const start=.08+i*.26;
      const active=smooth(p,start,start+.17);
      const bodyY=row.y-active*46;
      const depth=portrait?29:46;
      const width=portrait?117:196;
      const corner=depth*.7;
      poly(ctx,[[row.x-width/2,row.y+18],[row.x+width/2,row.y+18],
        [row.x+width/2,row.y+89],[row.x-width/2,row.y+89]],'#534b54',ink,3);
      poly(ctx,[[row.x+width/2,row.y+18],[row.x+width/2+corner,row.y+2],
        [row.x+width/2+corner,row.y+72],[row.x+width/2,row.y+89]],'#373845',ink,3);
      rect(ctx,row.x-25,bodyY+5,50,row.y+62-bodyY,4,'#9a6d5d',ink,3);
      line(ctx,[[row.x-13,bodyY+10],[row.x-13,row.y+53]],'#d39e75',3);
      const radius=portrait?20:25;
      gear(ctx,row.x+width/2-22,row.y+57,radius,spin*(i%2?1:-1),'#b38665');
      gear(ctx,row.x+width/2-48,row.y+65,radius*.72,spin*(i%2?-1:1),'#716772');
      poly(ctx,[[row.x-width/2,bodyY],[row.x+width/2,bodyY],
        [row.x+width/2+corner,bodyY-18],[row.x-width/2+corner,bodyY-18]],'#c48c62',ink,3);
      poly(ctx,[[row.x-width/2,bodyY],[row.x+width/2,bodyY],
        [row.x+width/2,bodyY+13],[row.x-width/2,bodyY+13]],'#7d534e',ink,2);
      const s=portrait?.46:.54;
      const hand=raisedHand(row.x-8,bodyY-6,s,active,1);
      actor(ctx,extras[i+1],{x:row.x-8,y:bodyY-6,scale:s,clock,seed:i,gaze:.8,
        expression:active>.6?'alarm':'doubt',right:hand,tilt:-active*.12});
      if(active>.02) paddle(ctx,hand[0],hand[1],51+i*13,{scale:s,angle:active*-.18});
      lettering(ctx,row.price,row.x-width/2+5,row.y+55,{size:portrait?17:24,
        color:active>.42?'#f4c783':'#ba887a',family:mono,align:'left'});
      if (i<2) {
        const send=step(p,start+.14,start+.35);
        if(send>0 && send<1) {
          const dest=rows[i+1];
          const tx=mix(row.x+34,dest.x-24,send);
          const ty=mix(bodyY-73,dest.y-65,send)-Math.sin(send*Math.PI)*50;
          ticket(ctx,tx,ty,'BUY',{scale:portrait?.49:.7,angle:send*.76-.39});
          line(ctx,[[tx-14,ty+19],[tx-54,ty+39]],'#f5d29655',2.1);
        }
      }
    }
  });
}

export function buyCascade(ctx,view,assets,p) {
  if(p<.52) auctionCrowd(ctx,view,assets,step(p,0,.52),true);
  else mechanism(ctx,view,step(p,.52,1));
}
