import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile, writeFile, readdir, mkdir, mkdtemp, rename, rm} from 'node:fs/promises';
import {resolve, join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {tmpdir} from 'node:os';
import ffmpeg from 'ffmpeg-static';
import {starters} from './starters.mjs';
import {hasFilmShot} from '../src/film/index.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const library = join(root, 'public/projects');
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const exec = promisify(execFile);
const number = (v,min,max) => Number.isFinite(v) && v >= min && v <= max;
const string = (v,max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const list = (v,min,max,fn) => Array.isArray(v) && v.length >= min && v.length <= max && v.every(fn);

export function validate(draft) {
  if (!draft || !string(draft.title,140) || !['9:16','16:9'].includes(draft.aspect)) throw new Error('A title and an aspect of 9:16 or 16:9 are required.');
  if (draft.summary != null && typeof draft.summary !== 'string') throw new Error('Summary must be text.');
  if (draft.sources != null && !list(draft.sources,0,100,value=>string(value,1000))) throw new Error('Sources must be a list of text URLs.');
  if (draft.score != null && !string(draft.score,220)) throw new Error('Score must be a local audio file.');
  if (draft.narrationTempo != null && !number(draft.narrationTempo,.8,1.25)) throw new Error('Narration tempo must be between 0.8 and 1.25.');
  if (draft.duration != null && !number(draft.duration, 1, 1800)) throw new Error('Duration must be between 1 and 1800 seconds.');
  if (!list(draft.scenes, 1, 240, scene => scene && string(scene.label,45) && string(scene.headline,65) && string(scene.narration,1200)
    && (scene.seconds == null || number(scene.seconds,1,1800)))) throw new Error('Provide 1–240 scenes with label, headline and narration. Check storyboard field limits.');
  for (const scene of draft.scenes) {
    const checks = {
      candles: () => list(scene.values,2,28,Number.isFinite) && (scene.threshold == null || Number.isFinite(scene.threshold)),
      series: () => list(scene.values,2,28,Number.isFinite) && string(scene.startLabel,20) && string(scene.endLabel,20),
      ledger: () => list(scene.nodes,2,4,v=>string(v,34)),
      loop: () => list(scene.nodes,2,4,v=>string(v,28)),
      metric: () => list(scene.metrics,1,2,m=>m && string(m.value,10) && string(m.label,42)),
      liquidity: () => true,
      image: () => string(scene.image,220),
      film: () => hasFilmShot(scene.shot)
    };
    if (!Object.hasOwn(checks,scene.kind) || !checks[scene.kind]()) throw new Error('Invalid scene artwork for ' + scene.label);
    if (scene.detail != null && !string(scene.detail,110)) throw new Error('Check detail for ' + scene.label);
    if (scene.prop != null && !string(scene.prop,25)) throw new Error('Check prop for ' + scene.label);
    if (scene.propLabel != null && !string(scene.propLabel,18)) throw new Error('Check prop label for ' + scene.label);
    if (scene.people != null && !list(scene.people,2,2,v=>string(v,18))) throw new Error('Provide two short character labels.');
  }
}

export async function getProject(id) {
  if (!slugPattern.test(id)) throw new Error('Invalid project identifier.');
  return JSON.parse(await readFile(join(library,id,'project.json'),'utf8'));
}

export async function projects() {
  const entries = await readdir(library,{withFileTypes:true});
  const items = await Promise.all(entries.filter(d=>d.isDirectory() && slugPattern.test(d.name)).map(d=>getProject(d.name)));
  return items.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}

function phraseGroups(text) {
  const words = [...text.matchAll(/\S+/g)];
  const groups = [];
  for (let i=0; i<words.length;) {
    const first = words[i++];
    let last = first;
    while (i<words.length && words[i].index + words[i][0].length - first.index <= 40 && !/[.!?]$/.test(last[0])) last=words[i++];
    groups.push({text:text.slice(first.index,last.index+last[0].length), first:first.index, last:last.index+last[0].length-1});
  }
  return groups;
}

async function synthesize(scene, folder, index, provider) {
  const file = join(folder,'take-'+index+(provider==='elevenlabs'?'.mp3':'.wav'));
  let timings;
  if (provider==='elevenlabs') {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(process.env.ELEVENLABS_VOICE_ID)+'/with-timestamps',{
      method:'POST', headers:{'xi-api-key':process.env.ELEVENLABS_API_KEY,'content-type':'application/json'},
      body:JSON.stringify({text:scene.narration,model_id:process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'}),
      signal:AbortSignal.timeout(90000)
    });
    if (!response.ok) throw new Error('ElevenLabs narration failed (HTTP '+response.status+').');
    const result = await response.json();
    await writeFile(file,Buffer.from(result.audio_base64,'base64'));
    timings = result.alignment;
  } else {
    const process = exec('python3',[join(root,'studio/voice.py'),file]);
    process.child.stdin.end(scene.narration);
    const {stdout} = await process;
    timings = {words:JSON.parse(stdout)};
  }
  const {stderr} = await exec(ffmpeg,['-hide_banner','-i',file,'-f','null','-']);
  const [,hours,minutes,seconds] = stderr.match(/Duration: (\d+):(\d+):([\d.]+)/) || [];
  const duration = 3600*Number(hours)+60*Number(minutes)+Number(seconds);
  if (!Number.isFinite(duration) || duration<=0) throw new Error('Narration duration could not be read.');
  return {file,duration,timings};
}

async function synthesizePiper(scenes, folder) {
  const child = exec(process.env.PIPER_PYTHON || 'python3', [
    join(root,'studio/piper_voice.py'),
    resolve(process.env.PIPER_MODEL),
    folder
  ]);
  child.child.stdin.end(JSON.stringify(scenes.map(scene=>scene.narration)));
  const {stdout}=await child;
  return JSON.parse(stdout).map(({duration,spans},index)=>({
    file:join(folder,'take-'+index+'.wav'),
    duration,
    timings:{spans}
  }));
}

function cuesFor(scene, take, playable, tempo) {
  const groups = phraseGroups(scene.narration);
  const startAt = (group) => {
    const textIndex = Array.from(scene.narration.slice(0,group.first)).length;
    const span = take?.timings?.spans?.find(span=>textIndex>=span.first && textIndex<span.last);
    if (span) return span.start + (textIndex-span.first)/(span.last-span.first)*(span.end-span.start);
    return take?.timings?.character_start_times_seconds?.[textIndex]
      ?? take?.timings?.words?.find(word=>word.index>=textIndex)?.start
      ?? group.first/scene.narration.length*(take?.duration || playable);
  };
  return groups.map((group,i)=>({
    text:group.text,
    start:scene.start+Math.min(playable,startAt(group)/tempo),
    end:scene.start+(groups[i+1]?Math.min(playable,startAt(groups[i+1])/tempo):playable)
  })).filter(cue=>cue.end>cue.start);
}

async function localImage(scene, inputDir, outputDir, id, i) {
  if (scene.kind!=='image') return scene;
  const source = resolve(inputDir,scene.image);
  const ext = source.match(/\.(png|jpg|jpeg|webp)$/i)?.[0].toLowerCase();
  if (!ext) throw new Error('Image scenes require a local PNG, JPEG or WebP file.');
  const filename='scene-'+i+ext;
  await writeFile(join(outputDir,filename),await readFile(source),{flag:'wx'});
  return {...scene,image:'/projects/'+id+'/'+filename};
}

export async function createProject(input, options={}) {
  const inputFile=resolve(input);
  const draft=JSON.parse(await readFile(inputFile,'utf8'));
  return saveProject(draft,dirname(inputFile),options);
}

export async function createStarter(key, options={}) {
  if (!Object.hasOwn(starters,key)) throw new Error('Choose a supported starter.');
  return saveProject(starters[key].storyboard,join(root,'studio/starters'),options);
}

async function saveProject(storyboard,inputDir,{id,aspect,voice}) {
  const draft=aspect && storyboard ? {...storyboard,aspect} : storyboard;
  validate(draft);
  if (!id) {
    const slug = draft.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70).replace(/-$/,'');
    id = (slug || 'video') + '-' + randomUUID().slice(0,6);
  }
  if (!slugPattern.test(id)) throw new Error('Use lowercase hyphenated words for the project ID.');
  const provider = voice || (process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID ? 'elevenlabs' : process.env.PIPER_MODEL ? 'piper' : 'local');
  if (!['local','elevenlabs','piper','none'].includes(provider)) throw new Error('Voice must be local, elevenlabs, piper or none.');
  if (provider==='elevenlabs' && (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID)) throw new Error('Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.');
  if (provider==='piper' && !process.env.PIPER_MODEL) throw new Error('Set PIPER_MODEL to the local voice model.');
  await mkdir(library,{recursive:true});
  const output=await mkdtemp(join(library,'.building-'));
  const scratch=await mkdtemp(join(tmpdir(),'market-mechanics-'));
  try {
    const takes=provider==='piper' ? await synthesizePiper(draft.scenes,scratch) : [];
    if (provider!=='piper') {
      for (const [index,scene] of draft.scenes.entries()) takes.push(provider==='none' ? null : await synthesize(scene,scratch,index,provider));
    }
    const narrationTempo=draft.narrationTempo ?? 1;
    const weights=draft.scenes.map((scene,i)=>scene.seconds ?? ((takes[i]?takes[i].duration/narrationTempo:scene.narration.split(/\s+/).length / 2.5)+.55));
    const total=weights.reduce((a,b)=>a+b,0);
    const frames=Math.round((draft.duration ?? total)*30);
    if (!number(frames,30,54000) || frames<draft.scenes.length*15) throw new Error('Duration is outside the supported range or too short for the storyboard.');
    let accumulated=0;
    let offset=0;
    const scenes=[];
    const captions=[];
    const clips=[];
    for (const [i,source] of draft.scenes.entries()) {
      accumulated += weights[i];
      const end = i===draft.scenes.length-1 ? frames : Math.round(accumulated/total*frames);
      if (end-offset<15) throw new Error('Each scene must have at least half a second.');
      const scene = {...await localImage(source,inputDir,output,id,i),start:offset/30,seconds:(end-offset)/30};
      const take=takes[i];
      const available=scene.seconds-.16;
      const tempo=take ? Math.max(narrationTempo,take.duration/available) : 1;
      if (tempo>1.6) throw new Error('Narration is too long for '+scene.label+'. Allocate more time or shorten that beat.');
      captions.push(...cuesFor(scene,take,take?take.duration/tempo:available,tempo));
      if (take) {
        const clip='scene-'+i+'.wav';
        await exec(ffmpeg,['-v','error','-y','-i',take.file,'-af',`atempo=${tempo},apad`,'-t',String(scene.seconds),'-ar','48000','-ac','1',join(scratch,clip)]);
        clips.push("file '"+clip+"'");
      }
      scenes.push(scene);
      offset=end;
    }
    let audioFile=null;
    if (clips.length) {
      await writeFile(join(scratch,'list.txt'),clips.join('\n'));
      await exec(ffmpeg,['-v','error','-y','-f','concat','-safe','0','-i',join(scratch,'list.txt'),'-c:a','libmp3lame','-q:a','3',join(output,'narration.mp3')]);
      audioFile='narration.mp3';
    }
    if (draft.score) {
      const score=resolve(inputDir,draft.score);
      const scoreInputs=audioFile ? [
        '-i',join(output,audioFile),'-i',score,'-filter_complex',
        '[0:a]highpass=f=75,acompressor=threshold=0.15:ratio=2:attack=12:release=170,pan=stereo|FL=c0|FR=c0[voice];[1:a]volume=0.8[score];[voice][score]amix=inputs=2:normalize=0,alimiter=limit=0.94:level=false,apad'
      ] : ['-i',score,'-af','apad'];
      await exec(ffmpeg,['-v','error','-y',...scoreInputs,'-t',String(frames/30),'-c:a','libmp3lame','-q:a','2',join(output,'mix.mp3')]);
      audioFile='mix.mp3';
    }
    const project={id,title:draft.title,summary:draft.summary || '',sources:draft.sources || [],aspect:draft.aspect,duration:frames/30,voice:provider,
      createdAt:new Date().toISOString(),scenes,captions,audio:audioFile?'/projects/'+id+'/'+audioFile:null};
    await writeFile(join(output,'project.json'),JSON.stringify(project,null,2)+'\n');
    await rename(output,join(library,id));
    return project;
  } finally {
    await Promise.all([rm(scratch,{recursive:true,force:true}),rm(output,{recursive:true,force:true})]);
  }
}
