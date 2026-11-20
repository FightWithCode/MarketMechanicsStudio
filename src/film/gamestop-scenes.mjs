import {broker,buyer,extras,trader} from './cast.mjs';
import {camera,cover,ellipse,ink,layer,lettering,line,mix,move,poly,pulse,rect,smooth,step} from './paint.mjs';
import {attachment,gait,gripThumb,mood,performer} from './performer.mjs';
import {share,ticket,worktop} from './props.mjs';
import {mono,serif,slate} from './gamestop-exhibits.mjs';

const sand='#f2dfb9';
const teal='#9cdeba';
const gill={...trader,glasses:false,hat:'#9e4749',cloth:'#3a616d',lit:'#74939c',shadow:'#253d51'};

function caseBox(ctx,x,y,scale,angle,color) {
  layer(ctx,()=>{
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    rect(ctx,-51,-65,102,130,6,'#262738',ink,3);
    rect(ctx,-45,-58,91,115,2,color,'#ddb594',1);
    rect(ctx,-38,-49,77,16,3,'#202633');
    lettering(ctx,'GAME',0,-41,{size:11,family:mono,color:sand});
    poly(ctx,[[-37,33],[-14,-15],[2,7],[19,-19],[37,33]],'#312d48');
    ellipse(ctx,17,-10,13,13,'#f5bd72');
    line(ctx,[[-31,42],[31,42]],'#ead29c',2);
  });
}

export function storefront(ctx,view,assets,p,{closed=false,end=false}={}) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  camera(ctx,view,1.014+p*.072,[c,h*.48],()=>{
    const plate=cover(ctx,assets.mall,w,h);
    const signX=plate.x+plate.w*.506;
    const signY=plate.y+plate.h*.207;
    lettering(ctx,'GameStop',signX,signY,{size:portrait?37:56,family:serif,color:'#fff0db',outline:'#542832'});
    const doorX=plate.x+plate.w*.505;
    if(closed) {
      const down=smooth(p,.12,.73);
      const x=plate.x+plate.w*.408;
      const top=plate.y+plate.h*.309;
      const gateW=plate.w*.225;
      const gateH=plate.h*.405*down;
      rect(ctx,x,top,gateW,gateH,2,'#5d6062','#373c48',2);
      for(let i=1;i*11<gateH;i++) line(ctx,[[x,top+i*11],[x+gateW,top+i*11]],'#afb0a08f',1);
      if(down>.61) {
        rect(ctx,doorX-63,top+gateH*.68,126,35,4,'#eee0b7',ink,2);
        lettering(ctx,'CLOSED',doorX,top+gateH*.68+17,{size:19,family:mono,color:'#754456'});
      }
      rect(ctx,0,0,w,h,0,'rgba(27,31,55,'+(.32*down)+')');
    } else if(!end) {
      for(let i=0;i<(portrait?2:4);i++){
        const from=c+(i%2?-1:1)*(w*.43+i*30);
        const pace=t=>smooth(t,i*.34,Math.max(2.6,clock/Math.max(.1,p))*.88+i*.24);
        const sample=t=>({x:mix(from,doorX+(i-1)*28,pace(t)),y:mix(617-i*16,505+i*7,pace(t)),scale:mix(.79-i*.03,.41,pace(t))});
        const motion=gait(sample,clock,{phaseOffset:i*.14});
        performer(ctx,extras[i],{...motion,clock,seed:i+3,facing:i%2?1:-1,back:pace(clock)>.57,opacity:1-smooth(p,.83+i*.03,.98+i*.03)});
      }
    }
  });
  if(end) {
    const amount=smooth(p,.59,.79);
    if(amount) layer(ctx,()=>{
      ctx.globalAlpha=amount;
      rect(ctx,0,0,w,h,0,'#171928b5');
      lettering(ctx,'THE GAMESTOP SHORT SQUEEZE',c,332,{size:portrait?24:52,family:serif,color:sand,maxWidth:w*.89});
      lettering(ctx,'MARKET MECHANICS',c,392,{size:portrait?13:21,family:mono,color:'#e3af7b'});
    });
    if(p>.93) rect(ctx,0,0,w,h,0,'rgba(12,15,23,'+smooth(p,.93,1)+')');
  }
}

export function gameShop(ctx,view,assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  camera(ctx,view,1.027+p*.12,[c+(portrait?0:mix(-70,49,p)),354],()=>{
    const plate=cover(ctx,assets.shop,w,h);
    const counter=plate.y+plate.h*.713;
    const separation=portrait?92:153;
    const s=portrait?1:1.46;
    const trade=smooth(p,.29,.69);
    const item={
      x:c+mix(-56,52,trade),y:counter-44-30*Math.sin(trade*Math.PI),
      scale:portrait?.53:.71,angle:mix(-.15,.17,trade),
    };
    const sellerGrip=attachment(item,-48,29);
    const buyerGrip=attachment(item,48,29);
    const letGo=smooth(p,.48,.61);
    const take=smooth(p,.33,.49);
    const sellerHand=move(sellerGrip,[c-separation+15,counter-15],letGo);
    const buyerHand=move([c+separation-24,counter-17],buyerGrip,take);
    performer(ctx,broker,{x:c-separation,y:counter+85*s,scale:s,clock,counter,gaze:[.65,.42],
      emotion:mood('neutral','confident',trade),near:{point:sellerHand,angle:-.12,bend:1,grip:'pinch'}});
    performer(ctx,buyer,{x:c+separation,y:counter+85*s,scale:s,clock,counter,facing:-1,gaze:[.6,.28],
      emotion:mood('neutral','confident',smooth(p,.37,.79)),
      near:{point:buyerHand,angle:Math.PI+.12,bend:1,grip:'pinch'}});
    caseBox(ctx,item.x,item.y,item.scale,item.angle,'#887287');
    if(letGo<.045) gripThumb(ctx,broker,sellerGrip,-.12,s*.62);
    if(take>.955) gripThumb(ctx,buyer,buyerGrip,Math.PI+.12,s*.62);
    if(!portrait) caseBox(ctx,c+299,counter-4,.58,.07,'#637989');
  });
}

export function digital(ctx,view,assets,p) {
  const {w,h,portrait}=view;
  const c=w/2;
  if(p<.26) {
    gameShop(ctx,view,assets,.7+p*.8);
    return;
  }
  const q=step(p,.26,1);
  cover(ctx,assets.desk,w,h,{overscan:1.025+.04*q});
  rect(ctx,0,0,w,h,0,'#192036aa');
  const sw=Math.min(w*.87,620);
  rect(ctx,c-sw/2,132,sw,365,16,'#473d49',ink,4);
  rect(ctx,c-sw/2+10,143,sw-20,340,10,'#1d2e3a','#937a74',2);
  lettering(ctx,'GAME LIBRARY',c,178,{size:portrait?21:26,color:sand,family:mono});
  caseBox(ctx,c,268,.78,-.08,'#887287');
  rect(ctx,c-sw*.29,384,sw*.58,18,6,'#2c4147','#7e8582',1.25);
  const progress=smooth(q,.10,.79);
  if(progress) rect(ctx,c-sw*.29,384,sw*.58*progress,18,6,'#82b49e');
  lettering(ctx,progress>.98?'READY TO PLAY':'DOWNLOADING  '+Math.floor(progress*100)+'%',c,433,{size:portrait?16:22,color:sand,family:mono});
}

function desktop(ctx,view,assets,p,{person=trader,title,subtitle,alert=false}={}) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  camera(ctx,view,1.014+.09*p,[c,h*.43],()=>{
    const plate=cover(ctx,assets.desk,w,h);
    const counter=plate.y+plate.h*.777;
    const size=portrait?1.47:1.79;
    const seat=c-(portrait?9:79);
    const grip=[seat-size*42,counter-58-43*smooth(p,.16,.45)];
    const notify=alert?smooth(p,.15,.46):.35;
    performer(ctx,person,{
      x:seat,y:counter+85*size,scale:size,clock,seed:13,counter,
      gaze:[-.56,.44],tilt:.045+notify*.075,blink:pulse(p,.51,.527,.55),
      emotion:mood('neutral',alert?'concerned':'confident',notify),
      near:{point:grip,elbow:[seat-size*47,counter-size*34],grip:'fist'},
    });
    rect(ctx,grip[0]-24,grip[1]-34,26,47,5,'#55404d',ink,2);
    rect(ctx,grip[0]-20,grip[1]-30,18,35,3,alert?'#9d5d63':'#8ab59f');
    gripThumb(ctx,person,grip,-2.2,size*.55);
    if(title) {
      const labelX=portrait?c:c+275;
      const labelY=portrait?151:295;
      const width=portrait?290:360;
      rect(ctx,labelX-width/2,labelY-32,width,68,7,'#212333e8','#b78c77',1.8);
      lettering(ctx,title,labelX,labelY-8,{size:portrait?19:25,family:serif,color:sand,maxWidth:width-18});
      lettering(ctx,subtitle,labelX,labelY+16,{size:portrait?10.5:13,family:mono,color:'#deb185',maxWidth:width-17});
    }
  });
}

function fundDesk(ctx,view,assets,p,{bull=false,lose=false}={}) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  camera(ctx,view,1.018+.066*p,[c,h*.45],()=>{
    const plate=cover(ctx,assets.clearing,w,h);
    const counter=plate.y+plate.h*.739;
    const size=portrait?1.33:1.66;
    const actorX=c-(portrait?25:146);
    performer(ctx,extras[1],{x:actorX,y:counter+85*size,scale:size,clock,counter,
      gaze:[.63,.41],tilt:lose?.11:.035,emotion:mood('neutral',lose?'concerned':'focused',smooth(p,.2,.64)),
      near:{point:[actorX-41,counter+5],elbow:[actorX-64,counter-65]}});
    const px=portrait?c+98:c+218;
    const py=portrait?442:counter-15;
    ticket(ctx,px,py,bull?'UP':'DOWN',{scale:portrait?.83:1.37,angle:.11,
      label:bull?'TURNAROUND':'SHORT THESIS',shade:bull?'#ddd39e':'#daa08e'});
    if(!portrait) lettering(ctx,lose?'BUYBACK COST RISES':'GME THESIS',px,counter-126,{size:18,color:sand,family:mono});
  });
}

export function twoSides(ctx,view,assets,p) {
  const {w,h,portrait}=view;
  if(portrait) {
    if(p<.45) desktop(ctx,view,assets,step(p,0,.45));
    else fundDesk(ctx,view,assets,step(p,.45,1),{lose:true});
    return;
  }
  for(const i of [0,1]) layer(ctx,()=>{
    ctx.beginPath();
    ctx.rect(i*w/2,0,w/2,h);
    ctx.clip();
    ctx.translate(i===0?-w*.18:w*.22,0);
    if(i===0) desktop(ctx,view,assets,p);
    else fundDesk(ctx,view,assets,p,{lose:true});
  });
  line(ctx,[[w/2+15,0],[w/2-15,h]],'#cd9979',2.3);
}

export function opposingTheses(ctx,view,assets,p) {
  if(p<.43) fundDesk(ctx,view,assets,step(p,0,.43),{bull:true});
  else if(p<.84) fundDesk(ctx,view,assets,step(p,.43,.84));
  else buybackNote(ctx,view,step(p,.84,1));
}

export function buybackNote(ctx,view,p) {
  const c=view.w/2;
  worktop(ctx,view.w,view.h,view.clock,{blue:true});
  share(ctx,c-62,325,{scale:1.2,angle:-.18});
  ticket(ctx,c+69,355,'1',{scale:1.08,angle:.12,label:'SHARE OWED'});
  lettering(ctx,'BORROWED SHARE',c,242,{size:23,color:sand,family:mono});
  if(p>.55) lettering(ctx,'BUY TO CLOSE',c,459,{size:20,color:sand,family:mono});
}

export function tradeApp(ctx,view,assets,p,{locked=true,first=false,limited=false}={}) {
  const {w,h,portrait}=view;
  const c=w/2;
  if(first && p<.23) {
    desktop(ctx,view,assets,step(p,0,.23),{alert:true});
    return;
  }
  cover(ctx,assets.desk,w,h,{overscan:1.05+.08*p});
  rect(ctx,0,0,w,h,0,'#121727d5');
  const disabled=locked && (!first || p>.36);
  const boxW=portrait?285:322;
  const x=c-boxW/2;
  const y=52;
  const screenX=x+14;
  const screenW=boxW-28;
  rect(ctx,x+9,y+10,boxW,548,30,'#101323bb');
  rect(ctx,x,y,boxW,550,29,'#776471','#231b2b',4);
  rect(ctx,screenX,y+15,screenW,519,22,'#19232e','#16202b',2.8);
  rect(ctx,c-26,y+24,52,6,3,'#7d8488');
  lettering(ctx,'JAN 28 2021',screenX+20,y+62,{size:14,align:'left',family:mono,color:'#d5c4a8'});
  lettering(ctx,'GME',screenX+20,y+103,{size:39,align:'left',family:serif,color:sand});
  lettering(ctx,'GameStop',screenX+20,y+137,{size:16,align:'left',family:mono,color:'#c0bfad'});
  const series=[.78,.72,.73,.61,.68,.51,.44,.48,.32,.40,.16];
  const chart=series.map((v,i)=>[screenX+18+i*(screenW-36)/10,y+173+v*133]);
  for(let i=0;i<3;i++) line(ctx,[[screenX+18,y+196+i*42],[screenX+screenW-18,y+196+i*42]],'#53776a4d',1);
  line(ctx,chart,teal,3.2);
  const banner=limited?'PURCHASE LIMIT IN EFFECT':disabled?'PURCHASING RESTRICTED':'ORDER AVAILABLE';
  rect(ctx,screenX+18,y+322,screenW-36,58,7,disabled?'#603d4d':'#294942','#a57979',1.4);
  lettering(ctx,banner,c,y+350,{size:portrait?12:14,color:disabled?'#ffd0b3':sand,family:mono,maxWidth:screenW-47});
  const half=(screenW-46)/2;
  const by=y+405;
  rect(ctx,screenX+18,by,half,50,8,disabled&&!limited?'#565763':'#2a6a57','#9d9995',1.2);
  rect(ctx,screenX+28+half,by,half,50,8,'#2c6155','#a2bea5',1.2);
  lettering(ctx,disabled&&!limited?'BUY LOCKED':'BUY',screenX+18+half/2,by+25,{size:14,family:mono,color:'#eee6cf'});
  lettering(ctx,'SELL',screenX+28+half*1.5,by+25,{size:16,family:mono,color:sand});
  lettering(ctx,'ILLUSTRATED APP VIEW',c,y+492,{size:10,family:mono,color:'#9a9a98'});
}

export function rewind(ctx,view,assets,p) {
  if(p<.36) desktop(ctx,view,assets,step(p,0,.36),{alert:true});
  else if(p<.70) tradeApp(ctx,view,assets,step(p,.36,.70),{locked:true});
  else storefront(ctx,view,assets,step(p,.70,1));
  const flash=pulse(p,.69,.70,.729);
  if(flash) rect(ctx,0,0,view.w,view.h,0,'rgba(239,187,137,'+flash*.38+')');
}

export function gillDesk(ctx,view,assets,p,thesis=false) {
  if(thesis && p>.52) {
    forum(ctx,view,assets,step(p,.52,1),{thesis:true});
    return;
  }
  desktop(ctx,view,assets,p,{
    person:gill,title:'Keith Gill',
    subtitle:thesis?'PUBLIC GAMESTOP THESIS':'ROARING KITTY · DEEPFUCKINGVALUE',
  });
}

export function forum(ctx,view,assets,p,{thesis=false,spark=false}={}) {
  const {w,h,portrait}=view;
  const c=w/2;
  cover(ctx,assets.desk,w,h,{overscan:1.012+p*.12});
  rect(ctx,0,0,w,h,0,'#171e32bf');
  const width=Math.min(w*.88,702);
  const x=c-width/2;
  rect(ctx,x,104,width,454,11,'#242f3c','#a68070',2.4);
  rect(ctx,x+2,106,width-4,66,8,'#3a3a49');
  ellipse(ctx,x+25,137,8,8,'#e7866f');
  lettering(ctx,thesis?'PUBLIC INVESTMENT THESIS':'r/WallStreetBets',x+44,137,{size:portrait?17:24,color:sand,family:mono,align:'left'});
  const threads=thesis?[
    ['Retail footprint','Could the stores still have value?'],['Online business','What could a turnaround look like?'],['Position','Publicly disclosed interest in GME']
  ]:[
    ['VALUATION','Is the business worth more than the quote?'],['SHORT INTEREST','How crowded is the trade?'],['TURNAROUND','What changes with Cohen on the board?'],['MOMENTUM','More eyes on GME']
  ];
  threads.forEach(([topic,body],i)=>{
    const q=smooth(p,.04+i*.15,.15+i*.15);
    if(!q) return;
    const yy=198+i*76+18*(1-q);
    layer(ctx,()=>{
      ctx.globalAlpha=q;
      rect(ctx,x+17,yy,width-34,61,6,i%2?'#354957':'#31404d');
      lettering(ctx,topic,x+32,yy+17,{size:portrait?10.4:13,align:'left',family:mono,color:'#efb180'});
      lettering(ctx,body,x+32,yy+41,{size:portrait?12.7:17,align:'left',color:sand,maxWidth:width-65});
    });
  });
  lettering(ctx,spark?'ILLUSTRATED THEMES · EARLY GAMESTOP DISCUSSION':'ILLUSTRATED THEMES · PARAPHRASED',c,538,{size:portrait?9:12,color:'#afab9e',family:mono});
}

export function hearing(ctx,view,p) {
  const {w,h,portrait,clock}=view;
  slate(ctx,view);
  const c=w/2;
  lettering(ctx,'HOUSE FINANCIAL SERVICES HEARING',c,102,{size:portrait?19:31,color:sand,family:serif,maxWidth:w*.92});
  lettering(ctx,'FEBRUARY 18, 2021 · ILLUSTRATED RECONSTRUCTION',c,142,{size:portrait?8.8:13,color:'#c6aa91',family:mono});
  const people=[[gill,'KEITH GILL'],[extras[1],'ROBINHOOD'],[extras[4],'REDDIT']];
  people.forEach(([person,tag],i)=>{
    const ww=portrait?112:262;
    const height=portrait?205:286;
    const x=c+(i-1)*(ww+(portrait?9:21))-ww/2;
    const y=220+(1-smooth(p,i*.07,i*.07+.17))*37;
    layer(ctx,()=>{
      ctx.globalAlpha=smooth(p,i*.07,i*.07+.17);
      rect(ctx,x,y,ww,height,6,'#334557','#b99981',1.8);
      ctx.beginPath();
      ctx.rect(x+2,y+2,ww-4,height-35);
      ctx.clip();
      performer(ctx,person,{x:x+ww/2,y:y+height+(portrait?41:54),scale:portrait?.69:1.16,clock,seed:17+i,counter:y+height,
        facing:i===2?-1:1,gaze:[i===1?.4:.05,.08],emotion:mood('neutral','focused',.62)});
    });
    if(p>i*.07) lettering(ctx,tag,x+ww/2,y+height+20,{size:portrait?10:15,color:sand,family:mono});
  });
}
