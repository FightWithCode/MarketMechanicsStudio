import {actor, broker, buyer, reachingHand, trader} from './cast.mjs';
import {camera, clamp, cover, easeOut, ellipse, ink, layer, lettering, line, mix, move, noise, path, pulse, radial, rect, smooth, step, tau} from './paint.mjs';
import {actionLines, cash, deskShadow, document, phone, rain, share, stamp, ticket, wallet, worktop} from './props.mjs';

const mono = '"DejaVu Sans Mono", monospace';
const serif = '"DejaVu Serif", serif';
const titleInk = '#432c37';

function behindCounter(ctx, w, y, draw) {
  layer(ctx, () => {
    ctx.beginPath();
    ctx.rect(-w, -1000, w*3, y+1000);
    ctx.clip();
    draw();
  });
}

function deskRoom(ctx, view, assets, p, {pickup=false, close=false}={}) {
  const {w,h,portrait,clock}=view;
  const center=w/2;
  const desk=520;
  const hold=pickup?smooth(p,.27,.55):0;
  const buzz=pulse(p,.06,.20,.86);
  const shake=buzz * Math.sin(clock*76) * (hold<.7?2.5:0);
  const alarm=pickup?smooth(p,.14,.52):smooth(p,.18,.48);
  const bodyScale=portrait?1.62:2.02;
  const traderX=center+(portrait?-28:-63);
  const phoneStart=[center+(portrait?92:139),566];
  const receiver=[traderX+bodyScale*48,desk-bodyScale*127];
  const call=move(phoneStart,receiver,hold);
  const hand=hold>.03 ? [call[0]+8,call[1]+10] : move([traderX+69,desk-12],[phoneStart[0],desk-5],smooth(p,.14,.31)*.81);
  const subject=close?[traderX+22,desk-145]:[center,h/2+9];
  const scale=close ? (portrait?1.33:1.49)+p*.11 : 1+p*.047;
  camera(ctx,view,scale,subject,() => {
    const plate=cover(ctx,assets.apartment,w,h,{anchor:.743,y:desk});
    layer(ctx,() => {
      ctx.beginPath();
      ctx.rect(plate.x+plate.w*.078,plate.y+plate.h*.008,plate.w*.241,plate.h*.53);
      ctx.clip();
      rain(ctx,w,h,clock*.55,{strength:.63,count:88,seed:7});
    });
    rect(ctx,0,0,w,h,0,'#21182a19');
    if (alarm>.01) {
      rect(ctx,0,0,w,h,0,radial(ctx,call[0],call[1],portrait?260:345,[[0,'rgba(229,66,76,'+(alarm*.22)+')'],[1,'#e9424c00']]));
    }
    const actorPose=()=>actor(ctx,trader,{
      x:traderX,y:desk+bodyScale*86,scale:bodyScale,clock,
      expression:alarm>.43?'alarm':'neutral', gaze:hold>.65?-.8:1,
      tilt:.08-buzz*.075-hold*.14, lean:10*alarm-11*hold, front:close,
      left:[traderX-36,desk-6], right:hand, shadow:false,
    });
    behindCounter(ctx,w,desk,actorPose);
    if (hold>.03 && hold<.63) {
      path(ctx,[['M',hand[0]-9,desk-11],['Q',hand[0]-5,call[1]+26,call[0]+9,call[1]+15]],null,trader.shadow,17);
      ellipse(ctx,call[0]+13,call[1]+8,13,9,trader.skin,ink,2,-.5);
    }
    deskShadow(ctx,phoneStart[0]+1,phoneStart[1]+14,33*(1-hold*.81),9,.3);
    if (hold<.13 && buzz>.23) actionLines(ctx,call[0],call[1],clock%1,buzz*.58,42);
    phone(ctx,call[0]+shake,call[1],{scale:mix(.54,.62,hold),angle:mix(.16,-.24,hold),screen:clamp(.23+buzz),alert:true,clock});
    if (hold>.63) ellipse(ctx,call[0]+12,call[1]+12,8,12,trader.skin,ink,2,-.48);
    const mugX=center-(portrait?146:258);
    deskShadow(ctx,mugX,desk+59,31,8);
    rect(ctx,mugX-17,desk+10,34,44,8,'#777489',ink,3);
    ellipse(ctx,mugX,desk+13,17,6,'#352630',ink,2);
    path(ctx,[['M',mugX-17,desk+21],['Q',mugX-34,desk+19,mugX-30,desk+34],['Q',mugX-29,desk+44,mugX-17,desk+39]],null,'#857f91',5);
    if (p<.7) {
      layer(ctx,() => {
        ctx.globalAlpha=.35*(1-p*.42);
        for(let i=0;i<3;i++) {
          const dy=(clock*22+i*19)%59;
          path(ctx,[['M',mugX+Math.sin(clock*2+i)*4,desk+5-dy],['Q',mugX+12,desk-7-dy,mugX-6,desk-12-dy]],null,'#e3d3ce',1.4);
        }
      });
    }
  });
}

function phoneInsert(ctx, view, p, opening) {
  const {w,h,portrait,clock}=view;
  const center=w/2;
  worktop(ctx,w,h,clock);
  const y=portrait?326:352;
  const ripple=.5+.5*Math.sin(clock*21);
  const strike=opening?1:smooth(p,0,.21);
  const size=portrait?2.58:2.95;
  const lift=smooth(p,.63,.97)*45;
  rect(ctx,0,0,w,h,0,radial(ctx,center,y,340,[[0,'#fd735a47'],[.72,'#d2516230'],[1,'#e9424c00']]));
  ellipse(ctx,center+11,y+28,93*size/2,69*size/2,'#2c172d4c');
  const x=center+Math.sin(clock*68)*ripple*3;
  phone(ctx,x,y-lift,{scale:size,angle:-.16+.09*p,screen:strike,alert:true,clock});
  if (p<.76) actionLines(ctx,x,y,clock%1,.38+ripple*.38,portrait?146:180);
  const reach=easeOut(p,.18,.86);
  const handX=mix(w+130,center+151,reach);
  const handY=mix(h+25,y+117,reach);
  reachingHand(ctx,handX,handY,-2.53,{scale:portrait?1.25:1.8,length:portrait?140:375});
}

export function opening(ctx, view, assets, p) {
  if (p<.28) {
    deskRoom(ctx,view,assets,p/.28,{});
  } else if (p<.66) {
    phoneInsert(ctx,view,step(p,.28,.66),true);
  } else {
    deskRoom(ctx,view,assets,step(p,.66,1)*.6+.4,{close:true});
  }
}

export function marginCall(ctx, view, assets, p) {
  if (p<.25) phoneInsert(ctx,view,step(p,0,.25),false);
  else deskRoom(ctx,view,assets,step(p,.25,1),{pickup:true,close:!view.portrait});
}

function deskDeal(ctx, view, assets, p, mode, close=false) {
  const {w,h,clock,portrait}=view;
  const c=w/2;
  const borrowing=mode==='borrow';
  const returning=mode==='return';
  const a=portrait?102:170;
  const s=portrait?1.02:1.58;
  const desk=521;
  const pa=[c-a,desk+s*85];
  const pb=[c+a,desk+s*85];
  const subject=close?[pb[0]-(portrait?52:70),desk-98]:[c+(portrait?0:mix(-44,47,p)),mix(h/2,h/2+48,p)];
  const scale=close?(portrait?1.49:1.64):1.02+(portrait?.12:.24)*smooth(p,.1,1);
  const transfer=smooth(p,.16,.74);
  const reach=pulse(p,.05,.4,.93);
  const ret=returning?1-transfer:transfer;
  const paperStart=[pa[0]+s*51,desk-s*45];
  const paperEnd=[pb[0]-s*52,desk-s*45];
  const cert=move(paperStart,paperEnd,ret);
  cert[1]-=Math.sin(transfer*Math.PI)*(portrait?29:45);
  const from=borrowing||returning?broker:trader;
  const to=borrowing||returning?trader:buyer;
  const leftHand=move([pa[0]+s*34,desk-12],[cert[0]-s*34,cert[1]+10],returning?smooth(p,.22,.66):1-smooth(p,.45,.87));
  const rightHand=move([pb[0]-s*32,desk-17],[cert[0]+s*34,cert[1]+9],returning?1-smooth(p,.52,.92):smooth(p,.21,.63));
  const cashP=1-smooth(p,.43,.9);
  const cashPos=move([pa[0]+s*65,desk-20],[pb[0]-s*55,desk-20],cashP);
  cashPos[1]-=20*Math.sin(cashP*Math.PI);
  camera(ctx,view,scale,subject,() => {
    cover(ctx,assets.exchange,w,h,{anchor:.75,y:desk});
    if (!borrowing) rect(ctx,0,0,w,h,0,returning?'#78627a18':'#534b7718');
    behindCounter(ctx,w,desk,() => {
      actor(ctx,from,{x:pa[0],y:pa[1],scale:s,clock,seed:3,gaze:.85,
        tilt:reach*.12, lean:13*reach, expression:returning?'neutral':'smile',right:leftHand,
        left:borrowing||returning?undefined:[cashPos[0]-19,cashPos[1]+5],shadow:false});
      actor(ctx,to,{x:pb[0],y:pb[1],scale:s,clock,seed:7,facing:-1,gaze:.7,
        tilt:reach*.11,lean:10*reach,expression:returning?'doubt':borrowing?'neutral':'smile',
        right:rightHand,left:borrowing||returning?undefined:[cashPos[0]+19,cashPos[1]+5],shadow:false});
    });
    deskShadow(ctx,cert[0]+10,desk+10,49*s,5,.2);
    share(ctx,cert[0],cert[1],{scale:s*.79,angle:mix(-.22,.18,ret),fold:reach*.55});
    if (Math.abs(leftHand[1]-cert[1])<17) ellipse(ctx,cert[0]-s*37,cert[1]+s*7,5*s,4*s,from.skin,ink,1.2,.3);
    if (Math.abs(rightHand[1]-cert[1])<17) ellipse(ctx,cert[0]+s*38,cert[1]+s*7,5*s,4*s,to.skin,ink,1.2,-.3);
    if (!borrowing&&!returning) cash(ctx,cashPos[0],cashPos[1],{scale:s*.67,angle:-.12+cashP*.46});
    if(returning) {
      const walletX=c+(portrait?82:205);
      wallet(ctx,walletX,desk+31,{scale:s*.62,angle:-.2,openness:1-smooth(p,.45,.83)});
    }
    for (let i=0;i<8;i++) {
      const x=c+(noise(i+3)-.5)*270;
      const yy=160+(noise(i+41)*240-clock*6)%245;
      ellipse(ctx,x+Math.sin(clock+i)*10,yy,1.2,1.2,'#ffd7a149');
    }
  });
}

function transferInsert(ctx, view, p, returning=false) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const handScale=portrait?1.24:2;
  const ease=smooth(p,.12,.73);
  const amount=returning?1-ease:ease;
  const paperX=mix(c-(portrait?77:184),c+(portrait?73:166),amount);
  const paperY=(portrait?327:307)-Math.sin(amount*Math.PI)*53;
  const cashX=mix(c+(portrait?98:223),c-(portrait?76:157),ease);
  const cashY=(portrait?444:415)+Math.sin(ease*Math.PI)*30;
  const firstX=mix(-25,paperX-30,1-smooth(p,.49,.98));
  const secondX=mix(w+48,paperX+36,smooth(p,.17,.68));
  camera(ctx,view,portrait?1:1.23+p*.08,[c,h/2-10],()=>{
    worktop(ctx,w,h,clock);
    deskShadow(ctx,paperX+6,paperY+22,portrait?66:109,20,.44);
    deskShadow(ctx,cashX+9,cashY+19,portrait?70:115,13,.34);
    if (!returning) cash(ctx,cashX,cashY,{scale:portrait?1.41:2.08,count:2,angle:mix(.18,-.31,ease)});
    else wallet(ctx,c+53,cashY,{scale:portrait?1.4:1.8,angle:.18,openness:1-smooth(p,.32,.77)});
    share(ctx,paperX,paperY,{scale:portrait?1.43:2.12,angle:mix(-.27,.18,amount),fold:pulse(p,.06,.47,.98)});
    reachingHand(ctx,returning?paperX-45:firstX,paperY+18,-.18,{scale:handScale,length:portrait?220:500,sleeve:returning?broker.cloth:trader.cloth,skin:returning?broker.skin:trader.skin});
    reachingHand(ctx,secondX,paperY-6,3.07,{scale:handScale,length:portrait?220:470,sleeve:returning?trader.cloth:buyer.cloth,skin:returning?trader.skin:buyer.skin});
    if(!returning) reachingHand(ctx,cashX+55,cashY+36,3.55,{scale:handScale*.78,length:portrait?260:440,sleeve:buyer.cloth,skin:buyer.skin});
  });
}

export function borrow(ctx,view,assets,p) { deskDeal(ctx,view,assets,p,'borrow',p>.59); }

export function sell(ctx,view,assets,p) {
  if (p<.46) deskDeal(ctx,view,assets,step(p,0,.64),'sell');
  else transferInsert(ctx,view,step(p,.46,1));
}

export function returnShare(ctx,view,assets,p) {
  if(p<.39) transferInsert(ctx,view,step(p,0,.39),true);
  else if(p<.75) deskDeal(ctx,view,assets,.64+step(p,.39,.75)*.36,'return');
  else returnStamp(ctx,view,step(p,.75,1));
  const fade=smooth(p,.93,1);
  if (fade>0) rect(ctx,0,0,view.w,view.h,0,'rgba(21,15,26,'+fade*.88+')');
}

function returnStamp(ctx, {w,h,portrait,clock}, p) {
  const x=w/2;
  const y=h*.49;
  const scale=portrait?1.95:2.84;
  worktop(ctx,w,h,clock);
  deskShadow(ctx,x+12,y+30,scale*62,scale*27,.25);
  share(ctx,x,y,{scale,angle:-.08});
  if(p>.29) layer(ctx,()=>{
    ctx.translate(x+9,y+1);
    ctx.rotate(-.17);
    rect(ctx,-57*scale,-13*scale,114*scale,26*scale,2,null,'#994249be',2.5);
    lettering(ctx,'RETURNED',0,0,{size:15.5*scale,family:mono,weight:900,color:'#994249d9'});
  });
  const fall=easeOut(p,0,.29);
  const pull=easeOut(p,.36,.96);
  const stampX=x+pull*w*.48;
  const stampY=y-(1-fall)*149-pull*176;
  stamp(ctx,stampX,stampY,-.13-pull*.35);
  reachingHand(ctx,stampX+27,stampY-41,-2.84,{scale:portrait?1.17:1.6,length:portrait?183:370,sleeve:broker.cloth,skin:broker.skin});
}

export function cashGap(ctx,view,_assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  worktop(ctx,w,h,clock,{blue:true});
  const edge = portrait?173:262;
  const y = portrait?355:356;
  const layoutW = portrait?266:452;
  const billH=portrait?321:363;
  const sheetX=c+(portrait?16:66);
  const receipt=smooth(p,0,.23);
  const reveal=smooth(p,.56,.73);
  const paperY=y-(1-receipt)*126;
  document(ctx,sheetX,paperY,layoutW,billH,portrait?.066:.043,() => {
    const left=-layoutW/2+20;
    const right=layoutW/2-20;
    const f=portrait?17:25;
    lettering(ctx,'TRADE LEDGER',left,-billH/2+42,{size:f,weight:900,align:'left',color:titleInk,family:serif});
    lettering(ctx,'EXAMPLE TRADE',right,-billH/2+72,{size:portrait?8:11,align:'right',color:'#886452',family:mono});
    line(ctx,[[left,-billH/2+62],[right,-billH/2+62]],'#976850',2.2);
    for(let i=0;i<7;i++) line(ctx,[[left,-billH/2+88+i*27],[right,-billH/2+88+i*27]],'#947b6259',.95);
    lettering(ctx,'Sold for',left,-45,{size:f*.9,align:'left',color:'#655044',family:mono});
    lettering(ctx,'$20',right,-45,{size:f*1.05,align:'right',color:'#376052',family:mono});
    lettering(ctx,'Buyback',left,8,{size:f*.9,align:'left',color:'#655044',family:mono});
    lettering(ctx,'$50',right,8,{size:f*1.05,align:'right',color:'#773a45',family:mono});
    line(ctx,[[left,46],[right,46]],'#986c60',1.8);
    if(reveal>0) layer(ctx,()=>{
      ctx.beginPath();
      ctx.rect(left,51,(right-left)*reveal,96);
      ctx.clip();
      lettering(ctx,'−$30',right-7,90,{size:portrait?49:67,weight:900,align:'right',color:'#a3434d',family:serif});
      line(ctx,[[right-89,116],[right-17,111]],'#a3434d',3.5);
    });
  });
  const billSlide=easeOut(p,.12,.36);
  const bx=mix(c-edge-90,c-edge*.64,billSlide);
  const by=portrait?212:292;
  cash(ctx,bx,by,{scale:portrait?1.1:1.67,count:3,angle:-.16});
  const orderSlide=easeOut(p,.28,.55);
  const tx=mix(w+100,c+edge*.54,orderSlide);
  const ty=portrait?502:476;
  ticket(ctx,tx,ty,'$50',{scale:portrait?1.09:1.39,angle:-.14});
  const pen=smooth(p,.53,.78);
  const exit=smooth(p,.78,.99);
  const penX=mix(c+18,c+edge*.7,pen)+exit*165;
  const penY=paperY+97+exit*67;
  line(ctx,[[penX,penY],[penX+74,penY+28]],'#b85d54',portrait?6:9);
  line(ctx,[[penX+1,penY+1],[penX+11,penY+4]],'#ebaa7e',4);
  reachingHand(ctx,penX+49,penY+19,3.45,{scale:portrait?.85:1.45,length:portrait?190:420});
}

export function gameStop(ctx,view,_assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  worktop(ctx,w,h,clock,{blue:true});
  const sheetW=portrait?290:535;
  const sheetH=portrait?368:438;
  const enter=easeOut(p,0,.24);
  const off=mix(h+135,portrait?336:354,enter);
  document(ctx,c+14,off,sheetW,sheetH,-.075,() => {
    const top=-sheetH/2;
    const left=-sheetW/2+22;
    const right=sheetW/2-22;
    const small=portrait?10:14;
    lettering(ctx,'SEC STAFF REPORT',left,top+30,{size:small,color:'#694e4b',family:mono,align:'left'});
    lettering(ctx,'JAN. 2021',right,top+30,{size:small,color:'#694e4b',family:mono,align:'right'});
    line(ctx,[[left,top+50],[right,top+50]],'#8c6453',2);
    lettering(ctx,'GAMESTOP',0,top+93,{size:portrait?41:70,color:'#3f2b35',family:serif,weight:900,maxWidth:sheetW-40});
    line(ctx,[[left,top+125],[right,top+125]],'#90695a',1.5);
    lettering(ctx,'SHORT INTEREST / PUBLIC FLOAT',0,-10,{size:portrait?9.6:15,color:'#6a544f',family:mono,maxWidth:sheetW-32});
    lettering(ctx,'122.97%',0,43,{size:portrait?49:81,color:'#7e343e',family:serif,weight:900});
    const radius=portrait?120:189;
    const progress=step(p,.28,.57);
    if (progress>0) {
      ctx.beginPath();
      ctx.ellipse(0,42,radius,portrait?41:55,-.06,-2.64,-2.64+progress*tau);
      ctx.lineWidth=3.6;
      ctx.strokeStyle='#a4414f';
      ctx.stroke();
    }
    for(let i=0;i<4;i++) line(ctx,[[left,top+sheetH-72+i*11],[right-(i===3?53:0),top+sheetH-72+i*11]],'#987d6777',1.7);
  });
  const pencilIn=pulse(p,.29,.49,.74);
  const pencilX=c+(portrait?126:204)+(1-pencilIn)*w*.36;
  const pencilY=off+36+29*Math.sin(p*9);
  line(ctx,[[pencilX-41,pencilY-8],[pencilX+65,pencilY+32]],'#a94952',portrait?7:10);
  reachingHand(ctx,pencilX+42,pencilY+22,3.5,{scale:portrait?1.05:1.8});
  if(p>.68) {
    const x=mix(-160,c-(portrait?108:181),easeOut(p,.68,.96));
    const y=portrait?501:506;
    ticket(ctx,x,y,'BUY',{scale:portrait?1.24:1.55,angle:.24,shade:'#a9b491',label:'MARKET ORDERS'});
  }
}
