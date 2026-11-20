import {camera,clamp,cover,ellipse,ink,layer,lettering,line,linear,mix,radial,rect,smooth} from './paint.mjs';
import {cash,document,quoteBoard,share,ticket,worktop} from './props.mjs';

export const mono='"DejaVu Sans Mono", monospace';
export const serif='"DejaVu Serif", serif';
const amber='#f1be78';
const cream='#efdab1';
const green='#9dddba';
const red='#f09784';

export function slate(ctx,view) {
  const {w,h}=view;
  rect(ctx,0,0,w,h,0,linear(ctx,0,0,w,h,[[0,'#182735'],[.57,'#23283b'],[1,'#3a2535']]));
  rect(ctx,0,0,w,h,0,radial(ctx,w*.48,h*.44,w*.47,[[0,'#86759235'],[1,'#191a2700']]));
}

export function market(ctx,view,assets,p,{points,note,fall=false,black=false}) {
  const {w,h,portrait}=view;
  const c=w/2;
  if(assets.pit) {
    cover(ctx,assets.pit,w,h,{anchor:.35,y:h*.40,overscan:1.03+.07*p});
    rect(ctx,0,0,w,h,0,'#101925ac');
  } else slate(ctx,view);
  const width=Math.min(w-36,966);
  const x=c-width/2;
  const y=89;
  const height=portrait?430:478;
  const frame=linear(ctx,x,y,x+width,y+height,[[0,'#b0806b'],[.42,'#4d3c4b'],[1,'#776071']]);
  rect(ctx,x+12,y+16,width,height,17,'#0a101a9f');
  rect(ctx,x,y,width,height,16,frame,ink,4);
  rect(ctx,x+13,y+13,width-26,height-26,10,'#14232a','#c1997d',1.5);
  lettering(ctx,'GME / JAN–FEB 2021',x+31,y+37,{size:portrait?15:23,color:amber,family:mono,align:'left'});
  lettering(ctx,note,x+31,y+63,{size:portrait?11:16,color:'#bbbdab',family:mono,align:'left'});
  const left=x+width*.105;
  const right=x+width*.90;
  const top=y+132;
  const floor=y+height-82;
  const tick=Math.ceil(Math.max(...points.map(point=>point[1]))/4/10)*10;
  const maximum=tick*4;
  for(let i=0;i<5;i++){
    const yy=mix(floor,top,i/4);
    line(ctx,[[left,yy],[right,yy]],'#5c867740',1);
    if(!portrait) lettering(ctx,'$'+(tick*i),left-14,yy,{size:13,color:'#91a59f',align:'right',family:mono});
  }
  const coords=points.map(([_,value],i)=>[mix(left,right,i/(points.length-1)),mix(floor,top,value/maximum)]);
  const end=smooth(p,.06,.73)*(coords.length-1);
  const completed=Math.min(coords.length-1,Math.floor(end));
  const stroke=fall?red:green;
  for(let i=0;i<coords.length;i++){
    const [px,py]=coords[i];
    const [date,value,kind]=points[i];
    const show=smooth(end,i-.14,i+.05);
    if(i>0 && end>i-1){
      const [sx,sy]=coords[i-1];
      const fraction=clamp(end-(i-1));
      line(ctx,[[sx,sy],[mix(sx,px,fraction),mix(sy,py,fraction)]],stroke,4);
    }
    if(show<.02) continue;
    layer(ctx,()=>{
      ctx.globalAlpha=show;
      ellipse(ctx,px,py,5.7,5.7,stroke,'#183338',1.2);
      const nudge=i===coords.length-1 && value>400?22:-23;
      const price=value.toLocaleString('en-US',{minimumFractionDigits:Number.isInteger(value)?0:2});
      lettering(ctx,'$'+price,px,py+nudge,{size:portrait?14:23,color:cream,family:mono});
      lettering(ctx,date,px,floor+27,{size:portrait?10.5:15,color:'#d3c5ad',family:mono});
      lettering(ctx,kind,px,floor+46,{size:portrait?8:12,color:'#a4b8a7',family:mono});
    });
  }
  const [lx,ly]=coords[completed];
  if(end>.1) ellipse(ctx,lx,ly,9+Math.sin(view.clock*4)*2,9,null,stroke,1.1);
  if(black && p<.11) rect(ctx,0,0,w,h,0,'rgba(5,8,12,'+(1-smooth(p,.052,.11))+')');
}

export function paperwork(ctx,view,p,{heading,sub,rows,seal}) {
  const {w,h,portrait}=view;
  const c=w/2;
  worktop(ctx,w,h,view.clock,{blue:true});
  const width=Math.min(w*.87,690);
  const height=Math.min(435,176+57*rows.length);
  const scale=1+.052*p;
  camera(ctx,view,scale,[c,348],()=>{
    document(ctx,c,333+(1-smooth(p,0,.15))*64,width,height,-.046,()=>{
      const x=-width/2+25;
      const right=width/2-25;
      const y=-height/2;
      lettering(ctx,heading,x,y+38,{size:portrait?23:36,color:'#4d303e',family:serif,align:'left',maxWidth:width-50});
      lettering(ctx,sub,x,y+71,{size:portrait?10.5:13,color:'#7f5852',family:mono,align:'left',maxWidth:width-49});
      line(ctx,[[x,y+89],[right,y+89]],'#997254',1.4);
      rows.forEach(([label,value,color],i)=>{
        const at=.12+i*.60/rows.length;
        layer(ctx,()=>{
          ctx.globalAlpha=smooth(p,at,at+.085);
          const cy=y+117+i*52;
          lettering(ctx,label,x,cy,{size:portrait?12.5:19,color:'#5e4647',family:mono,align:'left',maxWidth:width*.55});
          lettering(ctx,value,right,cy,{size:portrait?17:25,color:color||'#365d54',family:mono,align:'right',maxWidth:width*.43});
          line(ctx,[[x,cy+22],[right,cy+22]],'#af8d705a',1.1);
        });
      });
      if(seal) layer(ctx,()=>{
        ctx.globalAlpha=smooth(p,.68,.82)*.8;
        ctx.rotate(-.08);
        const yy=height/2-34;
        rect(ctx,-width*.32,yy-13,width*.64,29,3,null,'#9a4750',2);
        lettering(ctx,seal,0,yy+1,{size:portrait?10:14,color:'#9a4750',family:mono,maxWidth:width*.60});
      });
    });
  });
}

export function floatCount(ctx,view,p) {
  const {w,h,portrait}=view;
  const c=w/2;
  slate(ctx,view);
  const gridW=portrait?294:470;
  const gridX=portrait?c-gridW/2:c-416;
  const gridY=portrait?268:160;
  const cell=gridW/10;
  const n=smooth(p,.08,.44)*100;
  const extra=smooth(p,.47,.68);
  for(let i=0;i<100;i++){
    const x=gridX+(i%10)*cell;
    const y=gridY+Math.floor(i/10)*(portrait?16:31);
    rect(ctx,x,y,cell-4,portrait?12:23,2,n>=i?'#b1b293':'#42545d','#e6c59963',.75);
    if(!portrait && n>=i) line(ctx,[[x+5,y+8],[x+cell-10,y+8]],'#637e70',1.1);
  }
  lettering(ctx,'PUBLIC FLOAT',gridX+gridW/2,gridY-32,{size:portrait?17:23,family:mono,color:cream});
  const displayX=portrait?c:c+240;
  const displayY=portrait?158:297;
  quoteBoard(ctx,displayX,displayY,extra>.1?'123%':'---',{scale:portrait?1.03:1.39,caption:'SHORT INTEREST / PUBLIC FLOAT',phase:extra>.1?extra:1,red:extra>.1});
  if(extra>.1) lettering(ctx,'122.97% REPORTED · JAN 2021',displayX,displayY+(portrait?92:111),{size:portrait?11:15,family:mono,color:cream});
  lettering(ctx,'SOURCE  SEC STAFF REPORT · OCTOBER 2021',c,h*.815,{size:portrait?10:14,color:'#d3bea4',family:mono});
}

function brassTag(ctx,x,y,label,width=150) {
  rect(ctx,x-width/2,y-16,width,32,5,'#a77a58','#332835',2);
  lettering(ctx,label,x,y,{size:width<145?12:15,color:'#292736',family:mono,maxWidth:width-12});
}

export function lendChain(ctx,view,p,{second=false,recap=false}={}) {
  const {w,h,portrait}=view;
  const c=w/2;
  worktop(ctx,w,h,view.clock);
  const shortCount=second?2:1;
  const width=Math.min(w*.92,1020);
  const cols=portrait?[-.28,0,.28]:[-.34,0,.34];
  const [a,b,d]=cols.map(col=>c+col*width);
  const lower=portrait?437:442;
  const upper=portrait?257:230;
  const route=second?[[d,upper],[b,lower],[a,upper]]:[[a,upper],[b,lower],[d,upper]];
  const travel=smooth(p,.12,.76)*2;
  const index=Math.min(1,Math.floor(travel));
  const [x0,y0]=route[index];
  const [x1,y1]=route[index+1];
  const q=clamp(travel-index);
  for(const [i,[xx,yy]] of route.entries()){
    rect(ctx,xx-49,yy-29,98,58,8,'#40323b','#ad7e61',2.6);
    const label=(second?['NEW OWNER','SHORT B','NEXT BUYER']:['LENDER','SHORT A','NEW OWNER'])[i];
    brassTag(ctx,xx,yy+56,label,portrait?109:160);
    if(i<2) {
      const [nextX,nextY]=route[i+1];
      line(ctx,[[xx,yy],[nextX,nextY]],'#d2b38864',2.2);
      const u=.49;
      lettering(ctx,i===0?'LOAN':'SALE',mix(xx,nextX,u),mix(yy,nextY,u)-28,{size:portrait?12:17,family:mono,color:'#fff0cb'});
    }
  }
  const flightX=mix(x0,x1,q);
  const flightY=mix(y0,y1,q)-24*Math.sin(q*Math.PI);
  share(ctx,flightX,flightY,{scale:portrait?.6:1.04,angle:Math.sin(Math.PI*q)*.2});
  if(travel>1.58) {
    ticket(ctx,c+(portrait?0:width*.23),536,String(shortCount),{scale:portrait?.76:1.08,label:'OPEN SHORTS',angle:.07});
    if(recap) lettering(ctx,'ONE UNDERLYING SHARE',c-(portrait?0:140),583,{size:portrait?13:19,color:cream,family:mono});
  }
  if(second && travel<1.56) ticket(ctx,c-(portrait?0:width*.24),537,'1',{scale:portrait?.73:1.0,label:'EXISTING SHORT',angle:-.1});
}

export function settleChain(ctx,view,assets,p,{stage=0}={}) {
  const {w,h,portrait}=view;
  const c=w/2;
  cover(ctx,assets.clearing,w,h,{anchor:.50,y:h*.52,overscan:1.02+.07*p});
  rect(ctx,0,0,w,h,0,'#10233168');
  const size=Math.min(w*.91,1050);
  const left=c-size/2;
  const yy=455;
  const xs=[left+size*.17,c,left+size*.83];
  rect(ctx,left,338,size,217,12,'#2f2d36','#a2755f',3);
  rect(ctx,left+10,352,size-20,169,7,'#233039','#8f6760',1);
  line(ctx,[[xs[0],yy],[xs[2],yy]],stage===2?'#c98375':'#9e8f7c',2);
  const labels=['BUYER BROKER','CLEARINGHOUSE','SELLER BROKER'];
  const node=portrait?110:183;
  for(let i=0;i<3;i++){
    rect(ctx,xs[i]-node/2,369,node,127,7,'#31454a','#9c876d',2);
    brassTag(ctx,xs[i],385,labels[i],node*.92);
    rect(ctx,xs[i]-node*.40,430,node*.8,44,5,'#182a31','#6c6868',1.5);
  }
  const q=smooth(p,.18,.75);
  if(stage<2) {
    const shareX=mix(xs[2],xs[0],q);
    share(ctx,shareX,437-27*Math.sin(q*Math.PI),{scale:portrait?.48:.84,angle:-.13*Math.sin(q*Math.PI)});
    cash(ctx,mix(xs[0],xs[2],q),477+24*Math.sin(q*Math.PI),{scale:portrait?.48:.82,amount:'CASH',angle:.16});
    const heading=stage===0?'TRADE DATE → TWO BUSINESS DAYS':'NATIONAL SECURITIES CLEARING CORPORATION';
    lettering(ctx,heading,c,298,{size:portrait?13:24,color:cream,family:mono,maxWidth:size});
  } else if(stage===2) {
    lettering(ctx,'UNSETTLED TRADES',c,172,{size:portrait?18:29,color:cream,family:mono});
    for(let i=0;i<5;i++) {
      const arrived=smooth(p,.06+i*.065,.15+i*.065);
      const gap=portrait?64:105;
      const x=c+(i-2)*gap;
      const y=mix(327,261,arrived);
      if(arrived>0) layer(ctx,()=>{
        ctx.globalAlpha=arrived;
        ticket(ctx,x,y,'GME',{scale:portrait?.62:.91,label:'TRADE FILLED',angle:(i-2)*.07});
      });
    }
    const risk=smooth(p,.42,.65);
    if(risk) layer(ctx,()=>{
      ctx.globalAlpha=risk;
      rect(ctx,c-size*.36,506,size*.72,38,6,'#583d4d','#ba8078',1.1);
      lettering(ctx,'ONE BROKER FAILS · TRADES ARE STILL OWED',c,525,{size:portrait?11:18,color:cream,family:mono,maxWidth:size*.65});
    });
  } else {
    const drop=smooth(p,.24,.69);
    const vaultX=mix(xs[0],c,drop);
    const vaultY=mix(241,460,drop);
    lettering(ctx,'BROKER COLLATERAL DEPOSIT',c,151,{size:portrait?18:29,color:cream,family:mono});
    const meterW=size*.51;
    rect(ctx,c-meterW/2,185,meterW,15,5,'#263138','#847667',1.4);
    rect(ctx,c-meterW/2,185,meterW*mix(.21,1,smooth(p,.08,.51)),15,5,'#df8a7e');
    lettering(ctx,'DEPOSIT REQUIREMENT RISES',c,221,{size:portrait?11:16,color:'#edc0a4',family:mono});
    line(ctx,[[xs[0],269],[xs[0],319],[c,319],[c,425]],'#edbc785c',3);
    cash(ctx,vaultX,vaultY,{scale:portrait?.66:1.15,count:1+Math.floor(q*5),amount:'DEPOSIT'});
    if(drop>.92) lettering(ctx,'FROM THE MEMBER BROKER',c,525,{size:portrait?11:18,color:cream,family:mono});
  }
}

export function splitShare(ctx,view,p) {
  const {w,h}=view;
  const c=w/2;
  worktop(ctx,w,h,view.clock,{blue:true});
  const q=smooth(p,.28,.66);
  const width=Math.min(w*.65,588);
  const x=c;
  const y=340;
  for(let i=0;i<4;i++){
    share(ctx,mix(x,x+(i-1.5)*width/4,q),y+Math.sin(i*2+q)*14*q,{scale:mix(1.52,.83,q),opacity:i===0?1:q,angle:mix(0,(i-1.5)*.14,q)});
  }
  lettering(ctx,'JULY 2022  ·  FOUR-FOR-ONE SPLIT',c,210,{size:w<500?16:28,color:cream,family:mono});
  if(p>.56) lettering(ctx,'JANUARY 2021 PRICES IN THIS FILM ARE PRE-SPLIT',c,492,{size:w<500?10.5:17,color:cream,family:mono});
}
