import React,{useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {staticFile,useDelayRender,useVideoConfig} from 'remotion';
import {filmAssets,paintFilmFrame} from './index.mjs';

function loadSet(name, url) {
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve([name,image]);
    image.onerror=()=>reject(new Error('Could not load the painted set: '+url));
    image.src=staticFile(url);
  });
}

export function CanvasFilm({scenes,scene,elapsed,cue}) {
  const canvas=useRef(null);
  const ready=useRef(false);
  const {width,height}=useVideoConfig();
  const {delayRender,continueRender,cancelRender}=useDelayRender();
  const [handle]=useState(()=>delayRender('Load painted sets'));
  const [images,setImages]=useState(null);
  const paths=useMemo(()=>filmAssets(scenes),[scenes]);
  useEffect(()=>{
    let live=true;
    Promise.all(Object.entries(paths).map(([name,url])=>loadSet(name,url))).then(
      sets=>{if(live) setImages(Object.fromEntries(sets));},
      error=>{if(live) cancelRender(error);}
    );
    return ()=>{
      live=false;
      if(!ready.current) continueRender(handle);
    };
  },[paths,handle,continueRender,cancelRender]);

  useLayoutEffect(()=>{
    if(!images) return;
    const ctx=canvas.current.getContext('2d',{alpha:false});
    paintFilmFrame(ctx,width,height,scene,elapsed,images,cue);
    if(!ready.current) {
      ready.current=true;
      continueRender(handle);
    }
  },[images,width,height,scene,elapsed,cue,continueRender,handle]);

  return <canvas ref={canvas} width={width} height={height} style={{width:'100%',height:'100%',background:'#241b29'}} aria-label={scene.headline}/>;
}
