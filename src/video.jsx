import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Liquidity} from './liquidity';
import {CanvasFilm} from './film/CanvasFilm';
import './video.css';

export const fps = 30;
export const size = aspect => aspect === '9:16' ? [1080, 1920] : [1920, 1080];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => 1 - (1 - clamp(value)) ** 3;

function Character({color, name, pose, alarm}) {
  return <div className={'character ' + (alarm ? 'alarmed' : '')} style={{'--suit':color, transform:`translateY(${pose}px)`}}>
    <div className="person-shadow"/><div className="legs"/><div className="coat"><i/><b/></div>
    <div className="face"><div className="hair"/><div className="eyes"/><div className="mouth"/></div>
    <div className="nameplate">{name}</div>
  </div>;
}

function Chart({scene, t}) {
  const values = scene.values;
  const bounds = [...values, ...(scene.threshold == null ? [] : [scene.threshold])];
  const bottom = Math.min(...bounds);
  const range = Math.max(...bounds) - bottom || 1;
  const getY = value => 270 - 205 * (value - bottom) / range;
  const progress = t * 1.27 * values.length;
  return <div className="chart">
    <div className="chart-top"><span>PRICE ACTION</span><span>ILLUSTRATIVE</span></div>
    <svg viewBox="0 0 700 315" role="img" aria-label="Animated price chart">
      {[60, 112, 164, 216, 268].map(y => <line key={y} x1="40" x2="660" y1={y} y2={y} stroke="#305053"/>)}
      {scene.threshold != null && <g><line x1="40" x2="660" y1={getY(scene.threshold)} y2={getY(scene.threshold)} stroke="#fa8574" strokeWidth="2" strokeDasharray="9 7"/><text x="45" y={getY(scene.threshold)-9} fill="#fa8574" fontSize="18">COLLATERAL PRESSURE</text></g>}
      {values.map((value, i) => {
        const prev = values[Math.max(0, i - 1)];
        const x = 68 + i * (565 / (values.length - 1));
        const a = ease(progress - i);
        const open = getY(prev);
        const close = open + (getY(value) - open) * a;
        const color = value >= prev ? '#75ebbc' : '#fc806d';
        return <g key={i} opacity={a}>
          <line x1={x} x2={x} y1={Math.min(open,close)-11} y2={Math.max(open,close)+11} stroke={color} strokeWidth="3"/>
          <rect x={x - 9} y={Math.min(open,close)} width="18" height={Math.max(4,Math.abs(open-close))} rx="2" fill={color}/>
        </g>;
      })}
    </svg>
  </div>;
}

function PriceSeries({scene,t}) {
  const {values,startLabel,endLabel}=scene;
  const low=Math.min(...values);
  const high=Math.max(...values);
  const range=high-low || 1;
  const points=values.map((value,index)=>[
    45+610*index/(values.length-1),
    250-200*(value-low)/range
  ]);
  const progress=ease(t/.78)*(points.length-1);
  const index=Math.min(points.length-2,Math.floor(progress));
  const end=points[index].map((coordinate,axis)=>coordinate+(points[index+1][axis]-coordinate)*(progress-index));
  const visible=[...points.slice(0,index+1),end].map(point=>point.join(',')).join(' ');
  const color=values.at(-1)<values[0]?'#fc9e8f':'#75ebbc';
  return <div className="chart series-chart">
    <svg viewBox="0 0 700 320" role="img" aria-label={scene.detail || 'Animated price series'}>
      {[50,100,150,200,250].map(y=><line key={y} x1="45" x2="655" y1={y} y2={y} stroke="#365452"/>)}
      <polyline points={visible} fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round"/>
      <circle cx={end[0]} cy={end[1]} r="7" fill={color}/>
      <g fill="#c3d9cf" fontSize="21">
        <text x="45" y="297">{startLabel}</text>
        <text x="655" y="297" textAnchor="end" opacity={ease((t-.58)/.2)}>{endLabel}</text>
      </g>
    </svg>
  </div>;
}

function Exchange({scene,t}) {
  const active = Math.min(scene.nodes.length-1, Math.floor(t * scene.nodes.length));
  return <div className="exchange">
    <div className="booth"><div className="booth-lamp"/><div className="booth-back"/></div>
    <div className="actors">
      <Character color="#52858a" name={scene.people?.[0] || 'LENDER'} pose={3*Math.sin(t*18)}/>
      <div className="certificate" style={{transform:`translate(${Math.sin(t*8)*48}px,${-13*Math.sin(t*11)}px) rotate(${10*Math.cos(t*8)}deg)`}}>
        <small>{scene.propLabel || 'CERTIFICATE'}</small><strong>{scene.prop || '1 SHARE'}</strong><span>◈</span>
      </div>
      <Character color="#ae634a" name={scene.people?.[1] || 'SHORT SELLER'} pose={3*Math.cos(t*18)} alarm={active===scene.nodes.length-1}/>
    </div>
    <div className="counter"/>
    <div className="steps">{scene.nodes.map((node,i)=><div key={i} className={i===active?'active':''}><span>{String(i+1).padStart(2,'0')}</span>{node}</div>)}</div>
  </div>;
}

function Loop({scene,t}) {
  const active = Math.floor(t * scene.nodes.length * 2) % scene.nodes.length;
  return <div className="loop">
    <div className="orbit"/>
    <div className="orbit-dot" style={{transform:`rotate(${t*720}deg) translateY(-145px)`}}/>
    <div className="loop-core">↻</div>
    {scene.nodes.map((node,i)=>{
      const angle = (i/scene.nodes.length)*2*Math.PI - Math.PI/2;
      return <div key={i} className={'loop-node '+(i===active?'active':'')} style={{left:`${50+34*Math.cos(angle)}%`,top:`${50+35*Math.sin(angle)}%`}}>{node}</div>;
    })}
  </div>;
}

function Metrics({scene,t}) {
  return <div className="metrics">{scene.metrics.map(({value,label},i)=><div className="ticket" key={i} style={{opacity:ease(t*5-i*1.35),transform:`translateY(${30*(1-ease(t*5-i*1.35))}px) rotate(${i%2 ? 4 : -4}deg)`}}>
    <span>{label}</span><strong style={{color:value.startsWith('−')?'#ac3c34':undefined}}>{value}</strong><b>◆ ━━━━━ ◆</b>
  </div>)}</div>;
}

function Artwork({scene,t}) {
  if (scene.kind === 'series') return <PriceSeries scene={scene} t={t}/>;
  if (scene.kind === 'candles') return <Chart scene={scene} t={t}/>;
  if (scene.kind === 'ledger') return <Exchange scene={scene} t={t}/>;
  if (scene.kind === 'loop') return <Loop scene={scene} t={t}/>;
  if (scene.kind === 'liquidity') return <Liquidity scene={scene} t={t}/>;
  if (scene.kind === 'image') return <Img className="scene-image" src={staticFile(scene.image.slice(1))} alt="" style={{transform:`scale(${1+t*.08})`}}/>;
  return <Metrics scene={scene} t={t}/>;
}

export function Film({project, audio = true, captions = true}) {
  const frame = useCurrentFrame();
  const time = frame / fps;
  const scene = project.scenes.findLast(item => item.start <= time) || project.scenes[0];
  const t = clamp((time - scene.start)/scene.seconds);
  const cue = project.captions?.find(item => time >= item.start && time < item.end);
  if (scene.kind==='film') return <AbsoluteFill>
    <CanvasFilm scenes={project.scenes} scene={scene} elapsed={time-scene.start} cue={captions?cue:null}/>
    {audio && project.audio && <Audio src={staticFile(project.audio.slice(1))}/>}
  </AbsoluteFill>;
  const intro = interpolate(t,[0,.065],[0,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill className={'film ' + (project.aspect === '9:16' ? 'portrait ' : '') + scene.kind}>
    <div className="film-grid"/><div className="film-vignette"/>
    <div className="film-brand"><i>◈</i> MARKET MECHANICS</div>
    <div className="chapter" style={{opacity:.35+.65*intro,transform:`translateY(${(1-intro)*22}px)`}}>
      <div className="film-kicker">{scene.label}</div><div className="film-title">{scene.headline}</div>
      <div className="film-detail">{scene.detail}</div>
    </div>
    <div className="artwork" style={{opacity:.55+.45*intro,transform:`translateY(${(1-intro)*20}px) scale(${1+t*.018})`}}><Artwork scene={scene} t={t}/></div>
    {captions && cue && <div className="film-caption"><span>{cue.text}</span></div>}
    {audio && project.audio && <Audio src={staticFile(project.audio.slice(1))}/>}
    <div className="film-progress" style={{width:`${time/project.duration*100}%`}}/>
  </AbsoluteFill>;
}
