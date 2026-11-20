import {parseArgs} from 'node:util';
import {createProject,createStarter} from './library.mjs';
import {packageHyperframes} from './hyperframes.mjs';
import {render} from './render.mjs';

try {
  const {positionals:[command,input],values}=parseArgs({allowPositionals:true,options:{
    id:{type:'string'},aspect:{type:'string'},voice:{type:'string'},
    'no-audio':{type:'boolean'},'no-captions':{type:'boolean'}
  }});
  if (['create','starter'].includes(command) && input) {
    const create=command==='starter'?createStarter:createProject;
    const project=await create(input,values);
    console.log(project.id);
  } else if (['render','hyperframes'].includes(command) && input) {
    let last=-1;
    const run=command==='render'?render:packageHyperframes;
    const result=await run(input,{audio:!values['no-audio'],captions:!values['no-captions'],onProgress:progress=>{
      const step=Math.floor(progress*10);
      if (step>last) {console.log(step*10+'%');last=step;}
    }});
    console.log(typeof result==='string'?result:'public'+result.url);
  } else {
    throw new Error('Use create <storyboard.json> or starter <market-recap|company-deep-dive|market-explainer> [--id name] [--aspect 9:16|16:9] [--voice local|elevenlabs|piper|none] or render|hyperframes <project-id> [--no-audio] [--no-captions].');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode=1;
}
