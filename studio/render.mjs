import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {existsSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import ffmpeg from 'ffmpeg-static';
import {access, mkdir, rename, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {availableParallelism} from 'node:os';
import {randomUUID} from 'node:crypto';
import {getProject,library,root} from './library.mjs';
import {renderFilm} from './render-film.mjs';

export function exportName(audio,captions) {
  return `${audio?'narrated':'silent'}-${captions?'captioned':'clean'}.mp4`;
}

const exec = promisify(execFile);

async function reusePicture(project, other, temporary, audio) {
  const argumentsForAudio = audio
    ? ['-i',join(root,'public',project.audio.slice(1)),'-map','0:v:0','-map','1:a:0','-c:a','aac','-b:a','160k','-af','apad','-t',String(project.duration)]
    : ['-map','0:v:0','-an'];
  await exec(ffmpeg,['-v','error','-i',other,...argumentsForAudio,'-c:v','copy','-movflags','+faststart',temporary]);
}

let bundlePromise;
let bundleDirty = false;

export function invalidateVideoBundle() {
  bundleDirty = true;
}

async function getVideoBundle() {
  if (bundleDirty && bundlePromise) {
    const stale = await bundlePromise.catch(() => undefined);
    bundlePromise = undefined;
    if (stale) await rm(stale,{recursive:true,force:true});
  }
  bundleDirty = false;
  bundlePromise ??= bundle({
    entryPoint: join(root,'src/remotion.jsx'),
    publicDir: join(root,'public'),
    symlinkPublicDir: true,
    onProgress: () => {}
  }).catch(error => {
    bundlePromise = undefined;
    throw error;
  });
  return bundlePromise;
}
let pending = Promise.resolve();
const jobs=new Map();

export async function render(id,{audio=true,captions=true,onProgress=()=>{}}={}) {
  const project=await getProject(id);
  audio=Boolean(audio && project.audio);
  captions=Boolean(captions && project.captions.length);
  const name=exportName(audio,captions);
  const path=join(library,id,'exports',name);
  const url='/projects/'+id+'/exports/'+name;
  const key=id+'/'+name;
  if (jobs.has(key)) return jobs.get(key);
  const work=pending.then(async()=>{
    try {await access(path);return {url,name};} catch (error) {if (error.code!=='ENOENT') throw error;}
    await mkdir(join(library,id,'exports'),{recursive:true});
    const temporary=path.replace(/\.mp4$/,'-'+randomUUID()+'.tmp.mp4');
    try {
      const other=join(library,id,'exports',exportName(!audio,captions));
      if (existsSync(other)) {
        await reusePicture(project,other,temporary,audio);
        onProgress(1);
      } else if (project.scenes.every(scene=>scene.kind==='film')) {
        await renderFilm({project,publicDir:join(root,'public'),audio,captions,temporary,onProgress});
      } else {
        const inputProps={project,audio,captions};
        const browserExecutable=process.env.CHROME_PATH || (existsSync('/opt/google/chrome/chrome')?'/opt/google/chrome/chrome':undefined);
        const serveUrl=await getVideoBundle();
        const composition=await selectComposition({serveUrl,id:'MarketMechanics',inputProps,browserExecutable});
        await renderMedia({composition,serveUrl,inputProps,browserExecutable,outputLocation:temporary,codec:'h264',muted:!audio,
          concurrency:Math.min(6,availableParallelism()),x264Preset:'veryfast',crf:18,onProgress:({progress})=>onProgress(progress)});
      }
      await rename(temporary,path);
      return {url,name};
    } finally {
      await rm(temporary,{force:true});
    }
  });
  jobs.set(key,work);
  pending=work.catch(()=>{});
  try {return await work;} finally {jobs.delete(key);}
}
