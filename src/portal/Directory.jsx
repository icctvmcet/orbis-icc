import {useEffect,useRef,useState} from 'react';
import {supabase,result} from './client';
import {countryName,countryOptions,programs} from './data';

function MemberDetails({person,onClose}) {
  const ref=useRef();
  useEffect(()=>{ref.current.showModal();},[]);
  return <dialog ref={ref} className="member-dialog" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}} aria-labelledby="member-name">
    <button className="dialog-close secondary" onClick={onClose} aria-label="Close member profile">Close ×</button><p className="portal-eyebrow">{person.member_type} · Class of {person.graduation_year}</p><h2 id="member-name">{person.full_name}</h2>
    <p>{person.program} {person.branch||person.specialization} · CET</p><p>{person.city}, {countryName(person.country_code)}</p>
    {person.job_title&&<h3>{person.job_title}</h3>}{person.company_name&&<p>{person.company_name} · {person.company_location}</p>}
    {person.mentorship&&<span className="badge">Open to mentorship</span>}<p className="member-bio">{person.bio||'This member has not added a bio yet.'}</p>
    <div className="profile-links">{['linkedin','github','portfolio'].filter(k=>/^https?:\/\//.test(person[k]||'')).map(k=><a key={k} href={person[k]} target="_blank" rel="noopener noreferrer">{k==='portfolio'?'Website':k==='github'?'GitHub':'LinkedIn'} ↗</a>)}</div>
  </dialog>;
}

export default function Directory({country,setCountry}) {
  const [rows,setRows]=useState([]),[search,setSearch]=useState(''),[query,setQuery]=useState(''),[program,setProgram]=useState(''),[role,setRole]=useState('alumni'),[mentors,setMentors]=useState(false),[page,setPage]=useState(0),[more,setMore]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[selected,setSelected]=useState(null);
  useEffect(()=>{setPage(0);},[country,query,program,role,mentors]);
  useEffect(()=>{
    let active=true; setBusy(true);setError('');
    let req=supabase.from('orbis_profiles').select('*').eq('directory_visible',true).order('full_name').order('id').range(page*12,page*12+12);
    if(country)req=req.eq('country_code',country);if(program)req=req.eq('program',program);if(role)req=req.eq('member_type',role);if(mentors)req=req.eq('mentorship',true);if(query)req=req.ilike('full_name',`%${query.replace(/[%_]/g,'')}%`);
    result(req).then(data=>{if(active){setRows(data.slice(0,12));setMore(data.length>12);}}).catch(err=>{if(active){setError(err.message);setRows([]);}}).finally(()=>{if(active)setBusy(false);});
    return ()=>{active=false;};
  },[country,query,program,role,mentors,page]);
  return <section><div className="page-heading"><p className="portal-eyebrow">Find your people</p><h1>{country?`Connections in ${countryName(country)}`:'The CET directory'}</h1><p>Meet alumni, reconnect with your batch, or find someone to learn from.</p></div>
    <form className="directory-filters" onSubmit={e=>{e.preventDefault();setQuery(search.trim());}}><label>Name<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members" maxLength={100}/></label><label>Country<select value={country} onChange={e=>setCountry(e.target.value)}><option value="">Everywhere</option>{countryOptions.map(([code,name])=><option key={code} value={code}>{name}</option>)}</select></label><label>Programme<select value={program} onChange={e=>setProgram(e.target.value)}><option value="">All programmes</option>{programs.map(p=><option key={p}>{p}</option>)}</select></label><label>Members<select value={role} onChange={e=>setRole(e.target.value)}><option value="alumni">Alumni</option><option value="student">Students</option><option value="">Everyone</option></select></label><button className="gold-button">Search</button><label className="check-label"><input type="checkbox" checked={mentors} onChange={e=>setMentors(e.target.checked)}/>Open to mentorship</label></form>
    {error&&<p role="alert" className="form-error">{error}</p>}{busy?<p role="status">Finding connections…</p>:<><div className="member-grid">{rows.map(p=><button className="member-card" key={p.id} onClick={()=>setSelected(p)}><span className="avatar">{p.full_name.split(' ').map(s=>s[0]).slice(0,2).join('')}</span><span className="badge">{p.member_type} · {p.graduation_year}</span><h2>{p.full_name}</h2><p>{p.job_title||p.program}{p.company_name?` · ${p.company_name}`:''}</p><p>{p.city}, {countryName(p.country_code)}</p><small>{p.program} {p.branch||p.specialization}</small><span className="member-link">View profile ↗ {p.mentorship?'· Mentor':''}</span></button>)}</div>{!rows.length&&!error&&<div className="empty-state"><h2>No members found yet</h2><p>Try another country or filter. Only profiles shared with the directory appear here.</p></div>}</>}
    <div className="pagination"><button className="secondary" disabled={page===0||busy} onClick={()=>setPage(p=>p-1)}>Previous</button><span>Page {page+1}</span><button className="secondary" disabled={!more||busy} onClick={()=>setPage(p=>p+1)}>Next</button></div>
    {selected&&<MemberDetails person={selected} onClose={()=>setSelected(null)}/>}
  </section>;
}
