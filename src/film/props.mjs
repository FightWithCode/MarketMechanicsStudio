import {ellipse, ink, layer, lettering, line, linear, noise, path, poly, radial, rect, tau} from './paint.mjs';

const paper = '#ebcc93';
const mono = '"DejaVu Sans Mono", monospace';
const serif = '"DejaVu Serif", serif';

export function phone(ctx, x, y, {scale=1, angle=0, screen=0, alert=false, request, clock=0}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    rect(ctx,-41,-65,92,147,14,'#1a132e50');
    rect(ctx,-45,-74,90,148,14,'#755f6d',ink,3.4);
    rect(ctx,-42,-73,86,141,13,linear(ctx,-30,-68,37,75,[[0,'#503a51'],[.45,'#252533'],[1,'#342d44']]),ink,3);
    rect(ctx,-37,-61,74,107,8,screen>0?'#42303d':'#161b28','#160e1a',2);
    if (screen>0) {
      ctx.globalAlpha *= screen;
      rect(ctx,-34,-58,68,100,5,linear(ctx,0,-58,0,42,[[0,'#a04b52'],[.64,'#53334b'],[1,'#322535']]));
      lettering(ctx, '23:59', 0,-43,{size:12, color:'#ffe4ba',family:mono});
      if (alert) {
        rect(ctx,-28,-24,56,39,4,'#e5b58b');
        ellipse(ctx,-18,-12,5,5,'#a84143');
        lettering(ctx,'!',-18,-12,{size:7,color:'#ffe1c3'});
        lettering(ctx,'MARGIN',4,request?-16:-13,{size:8,color:'#542a3a',family:mono});
        lettering(ctx,'CALL',4,request?-7:-2,{size:8,color:'#542a3a',family:mono});
        if(request) lettering(ctx,request,0,6,{size:7.8,color:'#812c42',family:mono});
        for (let i=0;i<3;i++) ellipse(ctx,-5+i*5,26,1.1,1.1,Math.sin(clock*8-i)>.3?'#ffdbad':'#a37685');
      }
      ctx.globalAlpha /= screen;
    }
    rect(ctx,-12,-67,24,3,1.5,'#bd8f99');
    ellipse(ctx,0,57,8,5,'#675060','#191626',1.6);
    line(ctx,[[-34,-44],[-34,-55],[-26,-55]],'#ffdbb85c',1.9);
  });
}

export function share(ctx, x, y, {scale=1, angle=0, fold=0, opacity=1}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    ctx.globalAlpha *= opacity;
    const right = 61 - fold*14;
    path(ctx,[['M',-59,-28],['Q',-5,-34,right,-31],['L',right,28],['Q',-6,31,-61,32],['Z']],'#d9a46b55');
    ctx.translate(-2,-5);
    path(ctx,[['M',-61,-29],['Q',-2,-34,right,-32],['L',right,28],['Q',-11,27,-62,32],['Z']],paper,ink,2.7);
    rect(ctx,-54,-23,right+45,43,2,null,'#51766c',1.3);
    rect(ctx,-50,-19,right+37,35,1,null,'#966c51',.65);
    lettering(ctx,'ONE SHARE',-4,-4,{size:16,color:'#2b5350',family:serif,maxWidth:86});
    lettering(ctx,'STOCK CERTIFICATE',-4,11,{size:5.5,color:'#886052',family:mono});
    ellipse(ctx,right-10,16,6,6,'#af5b4d','#56394a',1);
    if (fold) poly(ctx,[[right-11,-31],[right,-32],[right,-13]],'#d5a870');
  });
}

export function cash(ctx, x, y, {scale=1, angle=0, count=1, amount='$20'}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    for (let i=count-1;i>=0;i--) rect(ctx,-51+i*2,-23+i*3,104,47,3,i===0?'#a5ad76':'#71805d',ink,2);
    rect(ctx,-47,-19,96,39,1,null,'#4a644f',1.5);
    ellipse(ctx,0,0,22,16,'#648063','#405a4d',1.1);
    lettering(ctx,amount,0,1,{size:16,family:serif,color:'#f2d9a2'});
    line(ctx,[[-39,-11],[-32,-11]],'#4e6252',2);
    line(ctx,[[33,10],[41,10]],'#4e6252',2);
  });
}

export function ticket(ctx, x, y, value, {scale=1, angle=0, shade='#f1ce8b', label='BUY ORDER'}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    const notch = 5;
    const shape = [['M',-45,-34],['L',45,-34],['L',45,-notch],['Q',32,0,45,notch],['L',45,34],['L',-45,34],
      ['L',-45,notch],['Q',-32,0,-45,-notch],['Z']];
    path(ctx,shape,shade,ink,2.5);
    lettering(ctx,label,0,-18,{size:7,family:mono,color:'#6f4a41',maxWidth:70});
    lettering(ctx,value,0,5,{size:27,family:serif,color:'#372931',maxWidth:74});
    line(ctx,[[-29,22],[29,22]],'#a87766',1);
  });
}

export function wallet(ctx, x, y, {scale=1, angle=0, openness=1}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    const h=34+openness*28;
    rect(ctx,-65,-h/2,130,h,7,'#4f3240',ink,3.5);
    rect(ctx,-58,-h/2+6,116,h-12,4,'#704a47','#bc805b',1.2);
    if (openness>.15) {
      path(ctx,[['M',-51,-10],['Q',0,-27,51,-10],['L',50,12],['Q',0,26,-50,12],['Z']],'#2b2334','#cb8964',1.8);
      line(ctx,[[-50,-5],[-36,-12],[32,-13],[51,-5]],'#9a6d5e',2.1);
    } else {
      rect(ctx,26,-9,39,18,4,'#98614f',ink,2.3);
      ellipse(ctx,51,0,4,4,'#d5a361','#633d45',1.2);
    }
  });
}

export function paddle(ctx, x, y, number, {angle=0, scale=1, color='#ebbe73'}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    rect(ctx,-4,-25,8,51,3,'#936354',ink,1.9);
    ellipse(ctx,0,-40,27,23,color,ink,2.5);
    ellipse(ctx,0,-40,22,18,null,'#664753',1.1);
    lettering(ctx,String(number),0,-40,{size:16,family:serif,color:'#342630'});
  });
}

export function quoteBoard(ctx, x, y, value, {scale=1, phase=1, caption='LAST TRADE', red=false}={}) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    rect(ctx,-125,-61,250,131,12,'#130f2688');
    rect(ctx,-129,-69,258,130,12,'#8e634f',ink,4);
    rect(ctx,-121,-62,242,116,8,'#39313d','#b47e59',2);
    lettering(ctx,caption,0,-43,{size:13,family:mono,color:'#e3b685'});
    const digits = String(value).split('');
    digits.forEach((digit, i) => {
      const dx = (i - (digits.length-1)/2) * 54;
      rect(ctx,dx-25,-26,50,63,5,'#211c2b','#705044',2);
      layer(ctx, () => {
        ctx.translate(dx,5);
        ctx.scale(1,.2+.8*phase);
        lettering(ctx,digit,0,0,{size:49,family:mono,color:red?'#ff9b81':'#ffd17f'});
      });
      line(ctx,[[dx-23,6],[dx+23,6]],'#15101c8a',2);
    });
    for (const [xx,yy] of [[-117,-56],[117,-56],[-117,49],[117,49]]) ellipse(ctx,xx,yy,2.6,2.6,'#d7a87c');
  });
}

export function worktop(ctx, w, h, clock, {blue=false}={}) {
  rect(ctx,0,0,w,h,0,linear(ctx,0,0,w,h,blue?[[0,'#2d3b4a'],[.5,'#3d4a50'],[1,'#29283b']]:[[0,'#664844'],[.46,'#5e403c'],[1,'#342a37']]));
  for (let i=0;i<115;i++) {
    const y = noise(i+44)*h;
    const x = noise(i+11)*w;
    const width=18+noise(i+3)*190;
    path(ctx,[['M',x,y],['Q',x+width*.65,y+3,x+width,y-2]],null,noise(i)>.45?'#e2ae6d19':'#1e132730',.6+noise(i+8)*1.4);
  }
  rect(ctx,0,0,w,h,0,radial(ctx,w*.46,h*.45,Math.max(w*.6,h*.65),[[0,'#ffc2752d'],[.8,'#ffc27503'],[1,'#21182b00']]));
  const light=16+2*Math.sin(clock*3);
  ellipse(ctx,w*.11,h*.91,light,light,null,'#a1796655',2.8);
}

export function document(ctx, x, y, width, height, angle, content) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    rect(ctx,-width/2+7,-height/2+9,width,height,3,'#1b132c66');
    path(ctx,[['M',-width/2,-height/2+2],['L',width/2-10,-height/2],['L',width/2,height/2-15],
      ['L',width/2-17,height/2],['Q',0,height/2+3,-width/2+1,height/2-2],['Z']],
      linear(ctx,0,-height/2,0,height/2,[[0,'#edddad'],[.65,'#e6cb95'],[1,'#cbab7c']]),'#6a4e48',2);
    poly(ctx,[[width/2-17,height/2],[width/2-13,height/2-15],[width/2,height/2-15]],'#b68864');
    for (let i=0;i<60;i++) ellipse(ctx,(noise(i+20)-.5)*(width-10),(noise(i+64)-.5)*(height-10),.4+noise(i+67)*.8,.4,'#71555020');
    content(ctx);
  });
}

export function stamp(ctx, x, y, rotation, angle=0) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(rotation);
    ctx.transform(1,0,angle,1,0,0);
    rect(ctx,-55,-13,111,25,4,'#67423e',ink,2.5);
    rect(ctx,-55,4,111,9,3,'#a74c4d',ink,2);
    rect(ctx,-16,-53,34,43,7,'#9e694b',ink,2.8);
    ellipse(ctx,1,-54,25,17,'#b77952',ink,3);
    ellipse(ctx,-4,-58,13,6,'#d7a176');
  });
}

export function gavel(ctx, x, y, angle, scale=1) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scale,scale);
    rect(ctx,-12,-6,110,13,6,'#a16649',ink,3);
    rect(ctx,78,-9,30,17,7,'#7a493e',ink,3);
    rect(ctx,-34,-33,61,66,11,'#a7734e',ink,3);
    rect(ctx,-39,-34,71,16,5,'#bd8a5e',ink,2.6);
    rect(ctx,-39,19,71,16,5,'#89563e',ink,2.6);
    rect(ctx,-33,-6,60,13,0,'#d19b62','#67483c',1.7);
  });
}

export function rain(ctx, w, h, t, {strength=1, count=72, seed=1}={}) {
  ctx.beginPath();
  for (let i=0;i<count;i++) {
    const speed=220+noise(i+seed)*460;
    const x=(noise(i+90+seed)*(w+180)+w-((t*speed*.18)%(w+180)))%(w+180)-80;
    const y=(noise(i+64)*h+t*speed)%h;
    const length=7+speed*.033;
    ctx.moveTo(x,y);
    ctx.lineTo(x-length*.24,y+length);
  }
  ctx.lineWidth=1.05;
  ctx.strokeStyle='rgba(185,202,226,'+strength*.29+')';
  ctx.stroke();
}

export function splashes(ctx, x, y, t, seed, scale=1) {
  const phase=((t*5.8+seed)%1);
  if (phase>.65) return;
  for (let i=0;i<8;i++) {
    const p=(phase+.2)*scale;
    const px=x + (noise(i+seed)-.5)*80*p;
    const py=y - Math.sin(phase*Math.PI/.65)*(8+noise(i+4)*23)*scale;
    ellipse(ctx,px,py,1.8*scale,1.1*scale,'rgba(187,198,217,'+(1-phase)*.44+')');
  }
  ellipse(ctx,x,y,10+phase*27,2+phase*5,null,'rgba(172,187,208,'+(1-phase)*.36+')',1);
}

export function actionLines(ctx, x, y, time, intensity=1, radius=90) {
  layer(ctx, () => {
    ctx.globalAlpha *= intensity;
    for (let i=0;i<13;i++) {
      const a=noise(i+2)*tau;
      const d=radius+18*noise(i+16)+time*14;
      const len=7+noise(i+23)*21;
      line(ctx,[[x+Math.cos(a)*d,y+Math.sin(a)*d],[x+Math.cos(a)*(d+len),y+Math.sin(a)*(d+len)]],i%2?'#ffd4a0b2':'#e98c7ca4',1.8);
    }
  });
}

export function deskShadow(ctx,x,y,rx,ry,alpha=.35) {
  ellipse(ctx,x,y,rx,ry,'rgba(33,23,37,'+alpha+')');
}

export function gear(ctx,x,y,r,rotation,color) {
  layer(ctx, () => {
    ctx.translate(x,y);
    ctx.rotate(rotation);
    const teeth=12;
    const points=[];
    for(let i=0;i<teeth*4;i++) {
      const a=i*tau/(teeth*4);
      const radius=(i%4===0||i%4===3)?r*.81:r;
      points.push([Math.cos(a)*radius,Math.sin(a)*radius]);
    }
    poly(ctx,points,color,ink,2.6);
    ellipse(ctx,0,0,r*.55,r*.55,'#493947','#d6a278',1.5);
    for(let i=0;i<4;i++) {
      const a=i*tau/4;
      ellipse(ctx,Math.cos(a)*r*.39,Math.sin(a)*r*.39,r*.085,r*.085,'#ba825d',ink,1);
    }
    ellipse(ctx,0,0,r*.19,r*.19,'#d4ab7c',ink,1.6);
  });
}
