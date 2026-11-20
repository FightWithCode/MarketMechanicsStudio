import {createCanvas,loadImage} from '@napi-rs/canvas';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {join} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import ffmpeg from 'ffmpeg-static';
import {filmAssets,paintFilmFrame} from '../src/film/index.mjs';

export async function renderFilm({project,publicDir,audio,captions,temporary,onProgress}) {
  const [width,height]=project.aspect==='9:16'?[1080,1920]:[1920,1080];
  const frames=Math.round(project.duration*30);
  const sets=Object.entries(filmAssets(project.scenes));
  const images=Object.fromEntries(await Promise.all(sets.map(async ([key,path])=>[key,await loadImage(join(publicDir,path))])));
  const canvas=createCanvas(width,height);
  const ctx=canvas.getContext('2d',{alpha:false});
  const cues=captions?project.captions:[];
  const audioArgs=audio?[
    '-i',join(publicDir,project.audio.slice(1)),'-map','0:v:0','-map','1:a:0',
    '-c:a','aac','-b:a','192k','-af','apad'
  ]:['-map','0:v:0','-an'];

  const encoder=spawn(ffmpeg,[
    '-v','error','-filter_threads','2','-f','rawvideo','-pix_fmt','rgba',
    '-s',width+'x'+height,'-r','30','-i','pipe:0',...audioArgs,
    '-vf','scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
    '-c:v','libx264','-threads','3','-preset','veryfast','-crf','17',
    '-t',String(project.duration),'-movflags','+faststart',temporary
  ],{stdio:['pipe','ignore','pipe']});
  let errors='';
  encoder.stderr.setEncoding('utf8');
  encoder.stderr.on('data',chunk=>{errors=(errors+chunk).slice(-16000);});
  const finished=once(encoder,'close').then(([code,signal])=>{
    if(code!==0) throw new Error(errors.trim() || 'Film encoder exited with '+(signal || code));
  });

  function* drawFrames() {
    let sceneIndex=0;
    let cueIndex=0;
    for(let frame=0;frame<frames;frame++) {
      const time=frame/30;
      while(project.scenes[sceneIndex+1]?.start<=time) sceneIndex++;
      while(cues[cueIndex]?.end<=time) cueIndex++;
      const scene=project.scenes[sceneIndex];
      const cue=cues[cueIndex]?.start<=time?cues[cueIndex]:null;
      paintFilmFrame(ctx,width,height,scene,time-scene.start,images,cue);
      if(frame%12===0) onProgress(frame/frames*.98);
      yield canvas.data();
    }
  }

  try {
    const framesIn=Readable.from(drawFrames(),{objectMode:false,highWaterMark:1});
    await Promise.all([pipeline(framesIn,encoder.stdin),finished]);
    onProgress(1);
  } catch (error) {
    encoder.kill();
    await finished.catch(()=>{});
    throw errors ? new Error(errors.trim(),{cause:error}) : error;
  }
}
