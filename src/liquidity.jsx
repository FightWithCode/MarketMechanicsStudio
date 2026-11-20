import React,{useLayoutEffect,useRef} from 'react';
import {
  BufferAttribute,BufferGeometry,PerspectiveCamera,Points,PointsMaterial,Scene,Vector3,WebGLRenderer
} from 'three';

const count=160;
const width=620;
const height=400;
const camera=new PerspectiveCamera(40,width/height,.1,100);
camera.position.set(0,3,11);
camera.lookAt(0,0,0);
camera.updateMatrixWorld();

function particle(i,time) {
  const phase=i*2.39996+time*7;
  const radius=1.1+(i%19)/10;
  return new Vector3(Math.cos(phase)*radius,((i%27)-13)*.11,Math.sin(phase)*radius);
}

export function Liquidity({scene,t}) {
  const canvas=useRef(null);
  const engine=useRef(null);
  useLayoutEffect(()=>{
    let renderer;
    try {
      if (!canvas.current.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true})) return;
      renderer=new WebGLRenderer({canvas:canvas.current,alpha:true,antialias:true,preserveDrawingBuffer:true});
    } catch {
      return;
    }
    renderer.setSize(width,height,false);
    const geometry=new BufferGeometry();
    const points=new BufferAttribute(new Float32Array(count*3),3);
    geometry.setAttribute('position',points);
    const material=new PointsMaterial({color:'#87ffd6',size:.105,transparent:true,opacity:.84});
    const world=new Scene();
    world.add(new Points(geometry,material));
    engine.current={renderer,points,world};
    return ()=>{
      engine.current=null;
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  },[]);
  useLayoutEffect(()=>{
    if (!engine.current) return;
    const {renderer,points,world}=engine.current;
    for (let i=0;i<count;i++) {
      const point=particle(i,t);
      points.setXYZ(i,point.x,point.y,point.z);
    }
    points.needsUpdate=true;
    renderer.render(world,camera);
  },[t]);
  return <div className="liquidity">
    <div className="particle-view">
      <svg viewBox={`0 0 ${width} ${height}`} aria-label="Projected liquidity particles">
        {Array.from({length:count},(_,i)=>{
          const point=particle(i,t).project(camera);
          return <circle key={i} cx={(point.x+1)*width/2} cy={(1-point.y)*height/2} r={2+i%4} fill={i%4===0?'#f0bd72':'#73edc5'} opacity={.18+i%5*.1}/>;
        })}
      </svg>
      <canvas ref={canvas} width={width} height={height} aria-hidden="true"/>
    </div>
    <span>{scene.prop || 'LIQUIDITY'}</span>
  </div>;
}
