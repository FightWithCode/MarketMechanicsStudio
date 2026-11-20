import {clamp,easeOut,ellipse,ink,layer,lettering,line,linear,mix,radial,rect,smooth,step} from './paint.mjs';
import {cash,deskShadow,document,ticket,worktop} from './props.mjs';
import {telephone} from './squeeze-performance.mjs';

const mono='"DejaVu Sans Mono", monospace';
const serif='"DejaVu Serif", serif';
const moss='#3c6252';
const plum='#61454a';
const red='#963d49';

function paperRow(ctx,x,y,width,label,value,{portrait,redInk=false,visible=1}={}) {
  const size=portrait?19:24;
  layer(ctx,()=>{
    ctx.globalAlpha=visible;
    line(ctx,[[x,y+23],[x+width,y+23]],'#94674e61',1.2);
    lettering(ctx,label,x,y,{size,align:'left',family:mono,color:plum});
    lettering(ctx,value,x+width,y,{size:size+5,align:'right',family:mono,color:redInk?red:moss});
  });
}

export function tradeMath(ctx,view,_assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const pageW=portrait?315:552;
  const pageH=portrait?353:374;
  const slide=easeOut(p,0,.145);
  const first=smooth(p,.12,.23);
  const second=smooth(p,.23,.37);
  const result=smooth(p,.45,.57);
  const x=c+(portrait?0:38);
  const y=portrait?352:359;
  worktop(ctx,w,h,clock,{blue:true});
  document(ctx,x,y+(1-slide)*53,pageW,pageH,-.041,()=>{
    const margin=portrait?19:28;
    const left=-pageW/2+margin;
    const width=pageW-2*margin;
    const top=-pageH/2;
    lettering(ctx,'TRADE RECEIPT',left,top+40,{size:portrait?22:31,family:serif,color:'#523743',align:'left'});
    lettering(ctx,'1 SHARE  ·  EXAMPLE',left,top+67,{size:portrait?10.5:12,family:mono,color:'#7a5850',align:'left'});
    line(ctx,[[left,top+87],[left+width,top+87]],'#957057',1.65);
    paperRow(ctx,left,top+120,width,'Sold for','+$20',{portrait,visible:first});
    paperRow(ctx,left,top+182,width,'Buy back for','−$50',{portrait,redInk:true,visible:second});
    if(result>0) {
      layer(ctx,()=>{
        ctx.globalAlpha=result;
        rect(ctx,left,top+226,width,portrait?67:78,5,'#c15d4720');
        lettering(ctx,'LOSS IF CLOSED',left+10,top+246,{size:portrait?13:16,align:'left',family:mono,color:red});
        lettering(ctx,'$30',left+width-11,top+259,{size:portrait?38:53,align:'right',family:serif,color:red});
        lettering(ctx,'BEFORE FEES',left+10,top+272,{size:portrait?10:12,align:'left',family:mono,color:plum});
      });
    }
  });
  if(!portrait) {
    const amount=easeOut(p,.12,.30);
    cash(ctx,mix(x-457,x-368,amount),y-54,{scale:1.23,count:2,angle:-.23,amount:'$20'});
    if(p>.25) {
      const inView=easeOut(p,.25,.42);
      ticket(ctx,mix(x+485,x+359,inView),y+26,'$50',{scale:1.21,angle:.13,shade:'#e9bd96',label:'BUYBACK QUOTE'});
    }
  }
}

function cashCell(ctx,x,y,w,h,kind,enter,used) {
  layer(ctx,()=>{
    ctx.translate(x,y-(1-enter)*72);
    ctx.rotate((1-enter)*-.15);
    ctx.globalAlpha=enter;
    rect(ctx,-w/2,-h/2,w,h,4,kind==='sale'?'#83996e':'#bfac6f','#41433c',1.65);
    rect(ctx,-w/2+3,-h/2+3,w-6,h-6,2,null,kind==='sale'?'#d5d6a0':'#e6ca8b',1);
    const radius=Math.min(w,h)*.27;
    ellipse(ctx,0,0,radius*1.18,radius,kind==='sale'?'#4e745d':'#92704c',null);
    lettering(ctx,'$10',0,.5,{size:Math.min(w,h)*.26,family:serif,color:'#fae5b3'});
    if(used>0) rect(ctx,-w/2,-h/2,w,h,4,'rgba(153,54,59,'+used*.53+')');
  });
}

export function cushion(ctx,view,_assets,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const trayW=portrait?356:686;
  const trayH=portrait?331:365;
  const y=portrait?346:356;
  const top=y-trayH/2;
  const left=c-trayW/2;
  const pad=portrait?12:25;
  const inside=trayW-2*pad;
  const cell=(inside-18-4*4)/5;
  const posted=smooth(p,.18,.41);
  const filled=smooth(p,.28,.47);
  const quoteGrowth=smooth(p,.51,.75);
  const quoted=20+Math.round(30*quoteGrowth);
  const used=filled>0?(quoted/50):0;
  const equity=50-quoted;
  const labelSize=portrait?12.1:18;
  worktop(ctx,w,h,clock);
  deskShadow(ctx,c+7,y+145,trayW*.54,36,.46);
  rect(ctx,left+6,top+10,trayW,trayH,16,'#282432',ink,3);
  rect(ctx,left,top,trayW,trayH,15,
    linear(ctx,left,top,left+trayW,top+trayH,[[0,'#a17150'],[.38,'#6e4943'],[1,'#4f3743']]),ink,3);
  rect(ctx,left+6,top+7,trayW-12,trayH-14,11,null,'#bf895b',1.4);
  const tagY=top+38;
  rect(ctx,c-(portrait?121:156),tagY-17,portrait?242:312,34,5,'#bb8b5e','#3e2d33',2);
  lettering(ctx,'FUNDS HELD BY BROKER',c,tagY,{size:portrait?13:16,family:mono,color:'#3c2b34'});
  rect(ctx,left+pad,top+72,inside,102,6,'#322a33','#a17155',2);
  for(let i=0;i<5;i++) {
    const cellX=left+pad+9+i*(cell+4)+cell/2;
    const enter=i<2?easeOut(p,.025+i*.05,.21+i*.05):easeOut(p,.19+(i-2)*.048,.41+(i-2)*.028);
    const redeemed=clamp(used*5-i);
    cashCell(ctx,cellX,top+129,cell,portrait?44:53,i<2?'sale':'cash',enter,redeemed*filled);
  }
  const groups=[
    {start:0,count:2,caption:'SALE  $20',progress:smooth(p,.025,.22),color:'#e2d6a4'},
    {start:2,count:3,caption:'CASH DEPOSIT  $30',progress:posted,color:'#f2cb8e'},
  ];
  for(const group of groups) {
    layer(ctx,()=>{
      ctx.globalAlpha=group.progress;
      const x=left+pad+7+group.start*(cell+4);
      const length=group.count*(cell+4)-1;
      line(ctx,[[x,top+182],[x,top+188],[x+length,top+188],[x+length,top+182]],group.color,1.6);
      lettering(ctx,group.caption,x+length/2,top+202,{size:labelSize,family:mono,color:group.color});
    });
  }
  const gaugeY=top+231;
  rect(ctx,left+pad,gaugeY,inside,24,4,'#3f5247','#1f212a',1.6);
  if(used>0) rect(ctx,left+pad,gaugeY,inside*used*filled,24,4,'#b25a58');
  for(let i=1;i<5;i++) line(ctx,[[left+pad+inside*i/5,gaugeY+3],[left+pad+inside*i/5,gaugeY+21]],'#ffd09855',1);
  if(filled>0) layer(ctx,()=>{
    ctx.globalAlpha=filled;
    lettering(ctx,'BUYBACK COST  $'+quoted,left+pad,gaugeY+45,{size:labelSize,family:mono,align:'left',color:'#ffc4ac'});
    lettering(ctx,'TOTAL  $50',left+trayW-pad,gaugeY+45,{size:labelSize,family:mono,align:'right',color:'#efd4a8'});
    const accent=equity===0?'#ff967f':'#e5dfad';
    const lamp=c+(portrait?100:126);
    lettering(ctx,'CUSHION LEFT  $'+equity,c,gaugeY+78,{size:portrait?16.5:23,family:mono,color:accent});
    if(equity===0) {
      ellipse(ctx,lamp,gaugeY+77,5,5,'#e8836d','#f6a977',1);
      rect(ctx,left,top,trayW,trayH,10,radial(ctx,lamp,gaugeY+77,39,[[0,'#ff826740'],[1,'#ff826700']]));
    }
  });
}

function maintenanceTicket(ctx,view,p) {
  const {w,h,portrait,clock}=view;
  const c=w/2;
  const paperW=portrait?326:541;
  const paperH=portrait?356:374;
  const enter=easeOut(p,0,.19);
  const formula=smooth(p,.11,.24);
  const need=smooth(p,.45,.60);
  const next=smooth(p,.68,.83);
  worktop(ctx,w,h,clock,{blue:true});
  document(ctx,c,h*.48+(1-enter)*78,paperW,paperH,-.037,()=>{
    const left=-paperW/2+20;
    const right=paperW/2-20;
    const top=-paperH/2;
    lettering(ctx,'MARGIN CALL',left,top+38,{size:portrait?26:36,family:serif,color:red,align:'left'});
    lettering(ctx,'ILLUSTRATIVE MAINTENANCE RULE',left,top+65,{size:portrait?10.5:14,family:mono,color:plum,align:'left'});
    line(ctx,[[left,top+85],[right,top+85]],'#966657',1.8);
    layer(ctx,()=>{
      ctx.globalAlpha=formula;
      lettering(ctx,'30% × $50 = $15',0,top+124,{size:portrait?24:43,family:mono,color:'#70414b',maxWidth:paperW-41});
      lettering(ctx,'REQUIRED CUSHION',0,top+157,{size:portrait?13:16,family:mono,color:plum});
    });
    paperRow(ctx,left,top+205,right-left,'Cushion now','$0',{portrait,redInk:true,visible:need});
    layer(ctx,()=>{
      ctx.globalAlpha=next;
      rect(ctx,left,top+245,right-left,68,6,'#ac464622');
      lettering(ctx,'ADD $15',0,top+269,{size:portrait?23:29,family:mono,color:red});
      lettering(ctx,'OR BUY BACK 1 SHARE',0,top+293,{size:portrait?13:16,family:mono,color:plum});
    });
  });
}

export function marginDecision(ctx,view,assets,p) {
  if(p<.72) {
    maintenanceTicket(ctx,view,step(p,0,.72));
  } else {
    telephone(ctx,view,assets,mix(.69,1,step(p,.72,1)),{closer:true,request:'ADD $15'});
  }
}
