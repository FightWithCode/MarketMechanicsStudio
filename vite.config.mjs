import {defineConfig} from 'vite';
import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createStarter,projects,library,root,slugPattern} from './studio/library.mjs';
import {invalidateVideoBundle,render} from './studio/render.mjs';

const jobs=new Map();
const json=(res,data,status=200)=>{
  res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});
  res.end(JSON.stringify(data));
};

export default defineConfig({
  server:{
    strictPort:true,
    watch:{ignored:['**/public/projects/.building-*','**/public/projects/*/exports/*.tmp.mp4']},
  },
  plugins:[{
    name:'market-mechanics-studio',
    configureServer(server) {
      server.watcher.on('all',(_event,path)=>{
        if (path.startsWith(join(root,'src')+'/')) invalidateVideoBundle();
      });
      server.middlewares.use('/api',async(req,res)=>{
        const url=new URL(req.url,'http://127.0.0.1');
        try {
          if (req.method==='GET' && url.pathname==='/projects') {
            const entries=await projects();
            return json(res,await Promise.all(entries.map(async project=>{
              const exports=await readdir(join(library,project.id,'exports')).catch(error=>{
                if (error.code!=='ENOENT') throw error;
                return [];
              });
              return {...project,exports:exports.filter(name=>/^(silent|narrated)-(clean|captioned)\.mp4$/.test(name))};
            })));
          }
          if (req.method==='POST' && url.pathname==='/starters') {
            if (req.headers.origin && new URL(req.headers.origin).host!==req.headers.host) return json(res,{error:'Use the local studio to create a project.'},403);
            const aspect=url.searchParams.get('aspect');
            const voice=url.searchParams.get('audio')==='0'?'none':undefined;
            const project=await createStarter(url.searchParams.get('format'),{aspect,voice});
            return json(res,{id:project.id},201);
          }
          if (req.method==='POST' && url.pathname==='/render') {
            if (req.headers.origin && new URL(req.headers.origin).host!==req.headers.host) return json(res,{error:'Use the local studio to start a render.'},403);
            const id=url.searchParams.get('project') || '';
            if (!slugPattern.test(id)) return json(res,{error:'Invalid project ID.'},400);
            const audio=url.searchParams.get('audio')==='1';
            const captions=url.searchParams.get('captions')==='1';
            const key=[id,+audio,+captions].join('/');
            if (!jobs.has(key) || jobs.get(key).error) {
              const job={progress:0};
              jobs.set(key,job);
              render(id,{audio,captions,onProgress:value=>{job.progress=value;}}).then(result=>Object.assign(job,result),error=>{job.error=error.message;});
            }
            return json(res,{key},202);
          }
          if (req.method==='GET' && url.pathname==='/render') {
            const job=jobs.get(url.searchParams.get('job'));
            return job?json(res,job):json(res,{error:'Render job not found. Check the export list or start another render.'},404);
          }
          return json(res,{error:'Unknown route.'},404);
        } catch (error) {
          return json(res,{error:error.message},500);
        }
      });
    }
  }]
});
