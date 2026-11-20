import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player} from '@remotion/player';
import {Film,fps,size} from './video';
import './app.css';

const time=seconds=>Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');
const exportLabel=name=>(name.startsWith('narrated')?'Audio':'Silent')+' · '+(name.includes('captioned')?'Captions':'Clean');
async function api(path,options) {
  const response=await fetch('/api'+path,options);
  const data=await response.json();
  if (!response.ok || data.error) throw new Error(data.error || 'Studio request failed.');
  return data;
}

function NewProject({close}) {
  const [mode,setMode]=useState('Prompt');
  const [brief,setBrief]=useState('');
  const [aspect,setAspect]=useState('16:9');
  const [seconds,setSeconds]=useState(60);
  const [instruction,setInstruction]=useState('');
  const [copied,setCopied]=useState(false);
  const dialog=useRef(null);
  useEffect(()=>{dialog.current.showModal();},[]);
  useEffect(()=>{
    setInstruction('');
    setCopied(false);
  },[mode,brief,aspect,seconds]);
  async function handoff(event) {
    event.preventDefault();
    const timing=mode==='Script'?'Derive runtime from the narration.':`Target exactly ${seconds} seconds.`;
    const result=`In the Market Mechanics Studio workspace, read AGENTS.md and README.md. Author original, full-screen animated shots with character action, props and camera cuts. Use the shared performer rig in src/film/performer.mjs for human characters. Use the studio's film shot schema to create and register the video from my ${mode.toLowerCase()}. Aspect ratio: ${aspect}. ${timing} Generate the narration and timed captions, then report the dashboard project ID. For supplied script text, preserve the narration.\n\n${mode}:\n${brief.trim()}`;
    setInstruction(result);
    setCopied(false);
    try {await navigator.clipboard.writeText(result);setCopied(true);} catch {}
  }
  return <dialog ref={dialog} onCancel={close} aria-labelledby="new-title">
    <form className="new-project" onSubmit={handoff}>
      <div className="dialog-head"><h2 id="new-title">New video</h2><button type="button" className="icon-button" onClick={close} aria-label="Close">×</button></div>
      <p>Prepare a brief for ChatGPT or Claude in this workspace. The finished storyboard appears here when the agent registers it.</p>
      <div className="segments" aria-label="Brief type">{['Prompt','Script','Scene overview'].map(item=><button key={item} type="button" aria-pressed={mode===item} className={mode===item?'selected':''} onClick={()=>setMode(item)}>{item}</button>)}</div>
      <label>{mode}<textarea required value={brief} onChange={event=>setBrief(event.target.value)} placeholder={mode==='Prompt'?'Explain how a short squeeze turns sellers into buyers…':'Paste your '+mode.toLowerCase()+' here…'}/></label>
      <div className="brief-settings"><label>Aspect ratio<select value={aspect} onChange={event=>setAspect(event.target.value)}><option>16:9</option><option>9:16</option></select></label>
      {mode!=='Script' && <label>Duration in seconds<input type="number" min="1" max="1800" value={seconds} onChange={event=>setSeconds(event.target.value)} required/></label>}</div>
      <button className="primary" type="submit">{copied?'Copied to clipboard':'Copy agent brief'}</button>
      {instruction && <textarea className="handoff" aria-label="Agent brief" readOnly value={instruction} onFocus={event=>event.target.select()}/>}
    </form>
  </dialog>;
}

function Project({project,refresh}) {
  const [audio,setAudio]=useState(Boolean(project.audio));
  const [captions,setCaptions]=useState(Boolean(project.captions.length));
  const [status,setStatus]=useState(null);
  const [job,setJob]=useState(null);
  const player=useRef(null);
  const [width,height]=size(project.aspect);
  const activeExport=(audio?'narrated':'silent')+'-'+(captions?'captioned':'clean')+'.mp4';
  const selectedExists=project.exports.includes(activeExport);
  useEffect(()=>{
    if (!job) return;
    let cancelled=false;
    let timer;
    const poll=async()=>{
      try {
        const next=await api('/render?job='+encodeURIComponent(job));
        if (cancelled) return;
        setStatus(next);
        if (next.url) {setJob(null);refresh();return;}
        timer=setTimeout(poll,1000);
      } catch (error) {
        if (!cancelled) {setStatus({error:error.message});setJob(null);}
      }
    };
    poll();
    return ()=>{cancelled=true;clearTimeout(timer);};
  },[job,refresh]);
  async function exportVideo() {
    setStatus({progress:0});
    try {
      const params=new URLSearchParams({project:project.id,audio:+audio,captions:+captions});
      const result=await api('/render?'+params,{method:'POST'});
      setJob(result.key);
    } catch (error) {setStatus({error:error.message});}
  }
  return <>
    <header className="project-head"><div><div className="eyebrow">VIDEO PROJECT <span> / </span> {project.aspect}</div><h1>{project.title}</h1><p>{project.summary}</p></div>
    <div className="resolution">{width} × {height} <span>·</span> 30 FPS</div></header>
    <div className="workbench">
      <section className="monitor">
        <div className="panel-head"><h2><i/> Composition preview</h2><span>{time(project.duration)}</span></div>
        <div className="preview">
          <Player ref={player} component={Film} inputProps={{project,audio,captions}} durationInFrames={Math.round(project.duration*fps)} fps={fps}
            compositionWidth={width} compositionHeight={height} controls showVolumeControls style={{width:project.aspect==='9:16'?'min(100%, 255px)':'100%',aspectRatio:width+'/'+height}}/>
        </div>
        <div className="layer-bar"><span>PREVIEW & EXPORT</span>
          <label><input type="checkbox" checked={audio} disabled={!project.audio} onChange={event=>setAudio(event.target.checked)}/> Audio</label>
          <label><input type="checkbox" checked={captions} disabled={!project.captions.length} onChange={event=>setCaptions(event.target.checked)}/> Captions</label>
        </div>
      </section>
      <aside className="inspector">
        <section className="panel">
          <div className="panel-head"><h2>Scene timeline</h2><span>{project.scenes.length} SCENES</span></div>
          <div className="scene-list">{project.scenes.map((scene,index)=><button key={index} onClick={()=>player.current?.seekTo(Math.round(scene.start*fps))}>
            <span className="scene-number">{String(index+1).padStart(2,'0')}</span><span>{scene.headline}</span><time>{time(scene.start)}</time>
          </button>)}</div>
        </section>
        <section className="panel export-panel">
          <div className="panel-head"><h2>Export</h2><span>H.264 / MP4</span></div>
          <div className="export-content">
            <button className="primary" onClick={exportVideo} disabled={Boolean(job) || Boolean(status && !status.url && !status.error)}>{job || (status && !status.url && !status.error)?'Rendering…':selectedExists?'Render selected version':'Render MP4'}</button>
            {status && !status.url && !status.error && <progress max="1" value={status.progress} aria-label="Render progress"/>}
            {status?.error && <div className="error" role="alert">{status.error}</div>}
            {project.exports.map(name=><a key={name} download href={`/projects/${project.id}/exports/${name}`}>{exportLabel(name)} <span>↓</span></a>)}
          </div>
        </section>
      </aside>
    </div>
  </>;
}

function App() {
  const [entries,setEntries]=useState([]);
  const [active,setActive]=useState(location.hash.slice(1));
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [creating,setCreating]=useState(false);
  const refresh=React.useCallback(async()=>{
    try {
      const next=await api('/projects');
      setEntries(current=>JSON.stringify(current)===JSON.stringify(next)?current:next);
      setError('');
    }
    catch (error) {setError(error.message);}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{
    refresh();
    const timer=setInterval(refresh,3500);
    const sync=()=>setActive(location.hash.slice(1));
    window.addEventListener('hashchange',sync);
    return ()=>{clearInterval(timer);window.removeEventListener('hashchange',sync);};
  },[refresh]);
  const project=entries.find(item=>item.id===active) || entries.find(item=>item.id==='short-squeeze-revised-wide') || entries[0];
  return <div className="studio-shell">
    <nav className="sidebar" aria-label="Video library">
      <div className="brand"><span className="brand-icon">◈</span><div>Market Mechanics<small>PRODUCTION STUDIO</small></div></div>
      <button className="primary new" onClick={()=>setCreating(true)}><span>＋</span> New video</button>
      <div className="library-heading">LIBRARY <span>{entries.length}</span></div>
      <div className="library-items">{entries.map(item=><a href={'#'+item.id} key={item.id} aria-current={project?.id===item.id?'page':undefined} className={project?.id===item.id?'active':''}>
        <span className={'format-icon '+(item.aspect==='9:16'?'vertical':'')}>▥</span><span>{item.title}<small>{item.aspect} <i/> {time(item.duration)}</small></span>
      </a>)}</div>
      <footer><i/> Local workspace</footer>
    </nav>
    <main>{error && <p className="error" role="alert">{error}</p>}{project?<Project key={project.id} project={project} refresh={refresh}/>:<div className="empty"><h1>{loading?'Loading studio…':'Your video library'}</h1>{!loading && <p>Create a brief to start a video.</p>}</div>}</main>
    {creating && <NewProject close={()=>setCreating(false)}/>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
