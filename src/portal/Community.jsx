import {useCallback,useEffect,useRef,useState} from 'react';
import {supabase,result} from './client';

export default function Community({user}) {
  const requestVersion=useRef(0);
  const [kind,setKind]=useState('chat'),[posts,setPosts]=useState([]),[authors,setAuthors]=useState({}),[body,setBody]=useState(''),[thread,setThread]=useState(null),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[report,setReport]=useState(null),[reason,setReason]=useState(''),[notice,setNotice]=useState(''),[older,setOlder]=useState(null),[hasMore,setHasMore]=useState(false);
  const load=useCallback(async()=>{
    const version=++requestVersion.current;
    let q=supabase.from('orbis_posts').select('*').order('created_at',{ascending:false}).order('id',{ascending:false}).limit(51);
    q=thread?q.eq('reply_to',thread.id):q.eq('kind',kind).is('reply_to',null);
    if(older)q=q.or(`created_at.lt.${older.created_at},and(created_at.eq.${older.created_at},id.lt.${older.id})`);
    const rows=await result(q);
    const ids=[...new Set([...rows.slice(0,50).map(p=>p.author_id),...(thread?[thread.author_id]:[])])];
    const names=ids.length?await result(supabase.rpc('orbis_post_authors',{ids})):[];
    if(version!==requestVersion.current)return;
    setHasMore(rows.length>50);setPosts(rows.slice(0,50));setAuthors(Object.fromEntries(names.map(p=>[p.id,p])));setLoading(false);
  },[kind,thread,older]);
  useEffect(()=>{
    let active=true;setLoading(true);setError('');
    const refresh=()=>{if(active)load().catch(err=>{if(active){setError(err.message);setLoading(false);}});};
    refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')refresh();},15000);
    const channel=supabase.channel(`orbis-community-${kind}-${thread?.id||'main'}`).on('postgres_changes',{event:'*',schema:'public',table:'orbis_posts'},refresh).subscribe();
    return ()=>{active=false;requestVersion.current++;clearInterval(timer);supabase.removeChannel(channel);};
  },[load]);
  async function send(e) {e.preventDefault();setBusy(true);setError('');try{await result(supabase.rpc('orbis_send_post',{content:body,post_kind:thread?'reply':kind,parent:thread?.id||null}));setBody('');if(older)setOlder(null);else await load();}catch(err){setError(err.message);}finally{setBusy(false);}}
  async function remove(id) {if(!window.confirm('Remove your message?'))return;try{await result(supabase.rpc('orbis_remove_post',{post:id}));if(thread?.id===id){setThread(null);setOlder(null);}else await load();}catch(err){setError(err.message);}}
  async function submitReport(e) {e.preventDefault();setBusy(true);try{await result(supabase.from('orbis_reports').insert({reporter_id:user.id,post_id:report,reason}));setReport(null);setReason('');setNotice('Report received. The Orbis team can review it.');}catch(err){setError(err.code==='23505'?'You have already reported this message.':err.message);}finally{setBusy(false);}}
  const card=(p,parent=false)=><article className={`post ${parent?'thread-parent':''}`} key={p.id}><div className="post-meta"><strong>{authors[p.author_id]?.full_name||'CET member'}</strong><span>{authors[p.author_id]?.member_type}</span><time dateTime={p.created_at}>{new Date(p.created_at).toLocaleString()}</time></div><p>{p.body}</p><div className="post-actions">{!thread&&<button onClick={()=>{setThread(p);setOlder(null);setBody('');}}>Open discussion / reply</button>}{p.author_id===user.id?<button onClick={()=>remove(p.id)}>Remove</button>:<button onClick={()=>{setReport(p.id);setReason('');}}>Report</button>}</div></article>;
  return <section className="community-screen"><div className="page-heading"><h1>The common room</h1><p>Share an idea, ask a question, or offer a little experience. Be thoughtful. Keep private contact details out of public messages.</p></div>
    <div className="tabs">{thread?<button className="secondary" onClick={()=>{setThread(null);setOlder(null);}}>All conversations</button>:['chat','question'].map(k=><button key={k} aria-pressed={kind===k} onClick={()=>{setKind(k);setOlder(null);}}>{k==='chat'?'Global chat':'Questions & answers'}</button>)}<span className="portal-note">Updates automatically. Latest 50 messages.</span></div>
    {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}{thread&&card(thread,true)}
    <form className="composer" onSubmit={send}><label>{thread?'Add your reply':kind==='question'?'What would you like to ask?':'Start a conversation'}<textarea value={body} onChange={e=>setBody(e.target.value)} required minLength={1} maxLength={2000} rows={3} placeholder="Write something meaningful…"/></label><div><small>{body.length}/2000</small><button className="gold-button" disabled={busy||!body.trim()}>{busy?'Sending…':thread?'Post reply':kind==='question'?'Ask question':'Send message'}</button></div></form>
    {report&&<form className="report-form" onSubmit={submitReport}><label>Why are you reporting this message?<input value={reason} onChange={e=>setReason(e.target.value)} required minLength={5} maxLength={500}/></label><button disabled={busy} className="gold-button">Submit report</button><button type="button" className="secondary" onClick={()=>setReport(null)}>Cancel</button></form>}
    {loading?<p role="status">Loading conversations…</p>:<div className="post-list">{posts.map(p=>card(p))}{!posts.length&&<div className="empty-state"><h2>{thread?'Be the first to reply':'A new conversation starts with you'}</h2><p>{thread?'Share a helpful response.':'Introduce yourself or ask the community a question.'}</p></div>}</div>}
    <div className="pagination">{older&&<button className="secondary" onClick={()=>setOlder(null)}>Back to latest</button>}{hasMore&&<button className="secondary" onClick={()=>setOlder({created_at:posts.at(-1).created_at,id:posts.at(-1).id})}>Older messages</button>}</div>
  </section>;
}
