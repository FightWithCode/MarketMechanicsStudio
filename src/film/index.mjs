import {cashGap, gameStop, marginCall, opening, borrow, returnShare, sell} from './squeeze-rooms.mjs';
import {buyCascade, coverTrade, priceRises, race} from './squeeze-market.mjs';
import {giveBack,loan,sale,telephone} from './squeeze-performance.mjs';
import {buyOne,feedback,hurry,risingQuote} from './squeeze-crowd.mjs';
import {cushion,marginDecision,tradeMath} from './squeeze-account.mjs';
import {gamestop} from './gamestop.mjs';
import {clamp, layer, lettering, vignette} from './paint.mjs';

const squeeze = {
  opening: {paint:opening, sets:['apartment']},
  borrow: {paint:borrow, sets:['exchange']},
  sell: {paint:sell, sets:['exchange']},
  price: {paint:priceRises, sets:['street','pit']},
  gap: {paint:cashGap, sets:[]},
  margin: {paint:marginCall, sets:['apartment']},
  race: {paint:race, sets:['street']},
  buyback: {paint:coverTrade, sets:['pit']},
  cascade: {paint:buyCascade, sets:['pit']},
  evidence: {paint:gameStop, sets:[]},
  return: {paint:returnShare, sets:['exchange']},
};

const setArt=Object.fromEntries(['apartment','exchange','street','pit'].map(name=>[name,'films/short-squeeze/'+name+'.webp']));

const performedSqueeze = {
  opening: {paint:telephone, sets:['apartment']},
  borrow: {paint:loan, sets:['exchange']},
  sell: {paint:sale, sets:['exchange']},
  price: {paint:risingQuote, sets:['street','pit']},
  loss: {paint:tradeMath, sets:[]},
  cushion: {paint:cushion, sets:[]},
  margin: {paint:marginDecision, sets:['apartment']},
  street: {paint:hurry, sets:['street']},
  buyback: {paint:buyOne, sets:['pit']},
  cascade: {paint:feedback, sets:['pit']},
  evidence: {paint:gameStop, sets:[]},
  return: {paint:giveBack, sets:['exchange']},
};

// Shot IDs stay stable once a project uses them.
const films = {
  squeeze: {sets:setArt,shots:squeeze},
  'squeeze-cut': {sets:setArt,shots:performedSqueeze},
  gamestop,
};

function findShot(id) {
  const [film, name, extra]=id.split('/');
  if (extra || !Object.hasOwn(films,film) || !Object.hasOwn(films[film].shots,name)) return null;
  return {film, shot:films[film].shots[name]};
}

export const hasFilmShot = id => typeof id==='string' && Boolean(findShot(id));

export function filmAssets(scenes) {
  const assets={};
  for(const scene of scenes) {
    if(scene.kind!=='film') continue;
    const found=findShot(scene.shot);
    if(!found) throw new Error('Unknown film shot: '+scene.shot);
    for(const name of found.shot.sets) assets[found.film+'/'+name]=films[found.film].sets[name];
  }
  return assets;
}

function paintCaption(ctx,w,h,text,portrait) {
  const size=portrait?20:24;
  const options={size, family:'"DejaVu Sans", sans-serif', weight:700, color:'#fff5e8', outline:'#221722'};
  ctx.font=options.weight+' '+size+'px '+options.family;
  const lines=[''];
  for(const word of text.split(/\s+/)) {
    const last=lines.length-1;
    const candidate=lines[last] ? lines[last]+' '+word : word;
    if(lines[last] && ctx.measureText(candidate).width>w*(portrait?.84:.82)) lines.push(word);
    else lines[last]=candidate;
  }
  const y=h*(portrait?.867:.906);
  const lineHeight=size*1.3;
  for(const [index, line] of lines.entries()) lettering(ctx,line,w/2,y+(index-(lines.length-1)/2)*lineHeight,options);
}

export function paintFilmFrame(ctx, width, height, scene, elapsed, images, cue) {
  const h=720;
  const w=width / height * h;
  const portrait=w<h;
  const {film,shot}=findShot(scene.shot);
  const assets=Object.fromEntries(shot.sets.map(name=>[name,images[film+'/'+name]]));
  const progress=clamp(elapsed/scene.seconds);
  ctx.setTransform(height/h,0,0,height/h,0,0);
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.imageSmoothingEnabled=true;
  ctx.fillStyle='#231b2c';
  ctx.fillRect(0,0,w,h);
  layer(ctx,()=>shot.paint(ctx,{w,h,portrait,clock:elapsed},assets,progress));
  vignette(ctx,w,h,portrait?.45:.59);
  if(cue) paintCaption(ctx,w,h,cue.text,portrait);
}
