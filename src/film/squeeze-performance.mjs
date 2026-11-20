import {broker,buyer,trader} from './cast.mjs';
import {camera,cover,ellipse,ink,layer,lettering,mix,move,noise,path,pulse,radial,rect,smooth} from './paint.mjs';
import {attachment,gripThumb,mood,performer} from './performer.mjs';
import {cash,deskShadow,phone,rain,share} from './props.mjs';

const mono='"DejaVu Sans Mono", monospace';
const counter=519;

function paintPhone(ctx, prop, screen, clock, request) {
  layer(ctx,()=>{
    ctx.translate(prop.x,prop.y);
    ctx.rotate(prop.angle);
    ctx.scale(prop.widthScale,prop.heightScale);
    phone(ctx,0,0,{scale:prop.scale,screen,alert:true,request,clock});
  });
}

export function telephone(ctx, view, assets, p, {closer=false,request}={}) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const size=portrait?1.64:2;
  const x=c+(portrait?29:40);
  const y=counter+size*85;
  const reach=smooth(p,.16,.38);
  const pickup=smooth(p,.42,.70);
  const notice=pulse(p,.09,.17,.44);
  const concern=smooth(p,.43,.83);
  const phoneOn=smooth(p,.035,.1);
  const buzz=pulse(p,.05,.11,.21)+pulse(p,.22,.27,.34)*.65;
  const desktop=[x-size*66,counter+25];
  const ear=[x-size*44,counter-size*109];
  const phonePosition=move(desktop,ear,pickup);
  phonePosition[0]-=Math.sin(Math.PI*pickup)*size*23;
  phonePosition[1]-=Math.sin(Math.PI*pickup)*size*13;
  const prop={
    x:phonePosition[0]+Math.sin(clock*70)*buzz*1.3,
    y:phonePosition[1],scale:mix(.54,.59,pickup)*(portrait?.91:1),
    angle:mix(-.18,.07,pickup),widthScale:mix(1,.51,pickup),heightScale:mix(.58,1,pickup),
  };
  const grip=attachment(prop,42,35);
  const handPoint=move([x-size*39,counter+2],grip,reach);
  const elbow=[x-size*mix(38+reach*6,54,pickup),counter-size*mix(22,38,pickup)];
  const lean=-reach*8*(1-pickup)+concern*2;
  const emotion=concern>.001?mood('neutral','concerned',concern):mood('neutral','notice',notice);
  const insert=!closer && p<.17;
  const subject=closer?[x-size*16,counter-127]:insert?[desktop[0]+25,counter-28]:[c-(portrait?8:28),h/2+12];
  const zoom=closer?(portrait?1.30:1.48):insert?(portrait?1.55:1.70):1.02+concern*.14;
  camera(ctx,view,zoom,subject,()=>{
    const plate=cover(ctx,assets.apartment,w,h,{anchor:.743,y:counter});
    layer(ctx,()=>{
      ctx.beginPath();
      ctx.rect(plate.x+plate.w*.078,plate.y+plate.h*.008,plate.w*.24,plate.h*.52);
      ctx.clip();
      rain(ctx,w,h,clock*.63,{strength:.56,count:78,seed:7});
    });
    rect(ctx,0,0,w,h,0,radial(ctx,prop.x,prop.y,250,[[0,'rgba(226,76,88,'+(phoneOn*.16*(1-pickup*.75))+')'],[1,'#df4b5500']]));
    deskShadow(ctx,desktop[0],desktop[1]+12,32,7,.31*(1-pickup));
    if(p<.39) paintPhone(ctx,prop,phoneOn,clock,request);
    performer(ctx,trader,{
      x,y,scale:size,clock,counter,emotion,lean,
      tilt:mix(.12,-.13,pickup)*reach-notice*.06+concern*.05,
      gaze:[mix(-.72,-.12,pickup)+notice*.16,mix(.70,-.16,pickup)*reach],
      blink:pulse(p,.76,.78,.802),
      near:{point:handPoint,elbow,grip:reach>.91?'fist':'loose'},
      far:{point:[x+size*34,counter-7],elbow:[x+size*39,counter-size*26]},
    });
    if(p>=.39) {
      paintPhone(ctx,prop,phoneOn,clock,request);
      gripThumb(ctx,trader,grip,Math.PI+prop.angle,size*.53);
    }
    const mugX=c+(portrait?140:238);
    deskShadow(ctx,mugX,counter+56,27,7,.25);
    rect(ctx,mugX-15,counter+16,30,36,7,'#79758a',ink,2.5);
    ellipse(ctx,mugX,counter+17,15,5,'#382c37',ink,2);
    path(ctx,[['M',mugX+15,counter+23],['Q',mugX+32,counter+20,mugX+26,counter+37],
      ['Q',mugX+24,counter+43,mugX+15,counter+40]],null,'#89849a',4);
  });
}

function loanSlip(ctx,c,y,scale,p) {
  if(p<.66) return;
  layer(ctx,()=>{
    ctx.globalAlpha=smooth(p,.66,.82);
    ctx.translate(c,y);
    ctx.rotate(.1);
    ctx.scale(scale,scale);
    rect(ctx,-72,-19,144,39,2,'#e8cca0','#573d3e',1.7);
    lettering(ctx,'STILL OWES 1 SHARE',0,1,{family:mono,size:11,color:'#69454a'});
  });
}

function exchange(ctx,view,assets,p,mode) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const sell=mode==='sale';
  const returning=mode==='return';
  const lender=sell?trader:broker;
  const recipient=sell?buyer:trader;
  const distance=portrait?105:147;
  const size=portrait?1.02:1.51;
  const origin=counter+size*85;
  const leftX=c-distance;
  const rightX=c+distance;
  const quick=sell || returning;
  const handoff=quick?.29:.49;
  const shared=smooth(p,quick?.05:.16,quick?.25:.44);
  const carried=smooth(p,quick?.34:.53,quick?.51:.74);
  const transit=(shared+carried)*.5;
  const carry=returning?1-transit:transit;
  const cert={
    x:c+mix(-58,58,carry)*(portrait?.85:1),
    y:counter-size*36-Math.sin(Math.PI*carry)*size*13,
    scale:size*.67,angle:mix(-.15,.12,carry),
  };
  const certLeft=attachment(cert,-54,10);
  const certRight=attachment(cert,55,8);
  const cashMotion=smooth(p,.21,.52);
  const paid={
    x:c+mix(64,-64,cashMotion)*(portrait?.8:1),y:counter-13-Math.sin(Math.PI*cashMotion)*22,
    angle:mix(.20,-.12,cashMotion),scale:size*.61,
  };
  const payLeft=attachment(paid,-45,8);
  const payRight=attachment(paid,44,8);
  const receiveShare=smooth(p,handoff-.18,handoff);
  const releaseShare=1-smooth(p,handoff+.024,handoff+.14);
  const leftHold=returning?receiveShare:releaseShare;
  const rightHold=returning?releaseShare:receiveShare;
  const shift=pulse(p,handoff-.19,handoff-.028,handoff+.30);
  const leftRest=[leftX+size*18,counter-12];
  const rightRest=[rightX-size*18,counter-13];
  const left=move(leftRest,certLeft,leftHold);
  const right=move(rightRest,certRight,rightHold);
  const receiveCash=smooth(p,.25,.38);
  const sendCash=1-smooth(p,.40,.54);
  const payee=move([leftX-size*15,counter-8],payLeft,receiveCash);
  const payer=move([rightX+size*24,counter-14],payRight,sendCash);
  const leftConfidence=returning?'neutral':'confident';
  const rightMood=returning?mood('focused','relieved',smooth(p,.54,.88)):mood('neutral','confident',smooth(p,.4,.76));
  const closer=mode==='loan' && p>.56;
  const zoom=closer?(portrait?1.36:1.51):portrait?1.05+.075*p:1.04+.23*p;
  const subject=closer?[c+(portrait?36:66),counter-81]:[c+(portrait?0:mix(-22,22,transit)),h/2+mix(38,61,p)];

  camera(ctx,view,zoom,subject,()=>{
    cover(ctx,assets.exchange,w,h,{anchor:.75,y:counter});
    if(returning) rect(ctx,0,0,w,h,0,'#463e6e20');
    performer(ctx,lender,{
      x:leftX,y:origin,scale:size,clock,seed:3,counter,lean:shift*9,tilt:.06*shift,
      emotion:mood('neutral',leftConfidence,.45+shift*.55),
      gaze:[.63,.35+shift*.25],near:{point:left,angle:-.25,bend:1,grip:'pinch'},
      far:sell?{point:payee,angle:.12,bend:1,grip:'pinch'}:{point:[leftX-size*15,counter-8],angle:.8},
    });
    performer(ctx,recipient,{
      x:rightX,y:origin,scale:size,facing:-1,clock,seed:7,counter,lean:shift*8,tilt:.08*shift,
      emotion:rightMood,gaze:[.66,.26+shift*.26],
      near:{point:right,angle:Math.PI+.18,bend:1,grip:'pinch'},
      far:sell?{point:payer,angle:Math.PI-.16,bend:1,grip:'pinch'}:undefined,
    });
    deskShadow(ctx,cert.x,counter+9,size*45,5,.2);
    share(ctx,cert.x,cert.y,{scale:cert.scale,angle:cert.angle,fold:shift*.18});
    if(leftHold>.94) gripThumb(ctx,lender,certLeft,-.18,size*.82);
    if(rightHold>.94) gripThumb(ctx,recipient,certRight,Math.PI+.18,size*.82);
    if(sell) {
      cash(ctx,paid.x,paid.y,{scale:paid.scale,angle:paid.angle,amount:'$20'});
      if(sendCash>.92) gripThumb(ctx,recipient,payRight,Math.PI-.16,size*.8);
      if(receiveCash>.92) gripThumb(ctx,lender,payLeft,.12,size*.8);
    }
    if(mode==='loan') loanSlip(ctx,c,counter+34,portrait?.85:1,p);
    for(let i=0;i<7;i++) {
      const dx=(noise(i+23)-.5)*(portrait?272:340);
      const yy=175+(noise(i+43)*252-clock*8)%252;
      ellipse(ctx,c+dx+Math.sin(clock+i)*9,yy,1.15,1.15,'#ffe2a643');
    }
  });
}

export function loan(ctx,view,assets,p) { exchange(ctx,view,assets,p,'loan'); }
export function sale(ctx,view,assets,p) { exchange(ctx,view,assets,p,'sale'); }
export function giveBack(ctx,view,assets,p) {
  exchange(ctx,view,assets,p,'return');
  const fade=smooth(p,.88,1);
  if(fade) rect(ctx,0,0,view.w,view.h,0,'rgba(24,18,28,'+fade*.94+')');
}
