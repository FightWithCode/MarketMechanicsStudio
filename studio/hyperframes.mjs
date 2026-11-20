import {copyFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {getProject,library,root} from './library.mjs';
import {render} from './render.mjs';

const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

export async function packageHyperframes(id,{audio=true,captions=true,onProgress}={}) {
  const project=await getProject(id);
  const {name}=await render(id,{audio:false,captions:false,onProgress});
  const source=join(library,id);
  const output=join(root,'hyperframes',id);
  await mkdir(output,{recursive:true});
  await copyFile(join(source,'exports',name),join(output,'visuals.mp4'));
  if (audio && project.audio) await copyFile(join(root,'public',project.audio.slice(1)),join(output,'audio.mp3'));
  const [width,height]=project.aspect==='9:16'?[1080,1920]:[1920,1080];
  const timed=(start,duration,track)=>`class="clip" data-start="${start.toFixed(6)}" data-duration="${duration.toFixed(6)}" data-track-index="${track}"`;
  const narration=audio && project.audio?`<audio id="sound" src="audio.mp3" ${timed(0,project.duration,1)}></audio>`:'';
  const cues=captions?project.captions.map((cue,i)=>`<div id="cue-${i}" ${timed(cue.start,cue.end-cue.start,2)}><span>${escape(cue.text)}</span></div>`).join('\n'):'';
  const html=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escape(project.title)}</title>
<style>
html,body{margin:0;background:#000}
#film{position:relative;width:${width}px;height:${height}px;overflow:hidden}
#visuals{width:100%;height:100%;position:absolute;inset:0}
#film .clip:not(video):not(audio){position:absolute;bottom:${project.aspect==='9:16'?11:5}%;left:8%;right:8%;text-align:center;color:#fff7dd;font:${project.aspect==='9:16'?51:42}px/1.3 'DejaVu Sans',sans-serif;font-weight:750;text-wrap:balance}
#film .clip:not(video):not(audio) span{background:#10191bf2;padding:.17em .38em;border-radius:8px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
</style>
</head>
<body>
<main id="film" data-composition-id="film" data-no-timeline data-start="0" data-duration="${project.duration}" data-width="${width}" data-height="${height}">
<video id="visuals" src="visuals.mp4" muted playsinline ${timed(0,project.duration,0)}></video>
${narration}
${cues}
</main>
<script>window.__timelines = window.__timelines || {};</script>
</body>
</html>
`;
  await writeFile(join(output,'index.html'),html);
  return output;
}
