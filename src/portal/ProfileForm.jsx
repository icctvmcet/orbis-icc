import {useState} from 'react';
import {blankProfile,programs,branches,years,countryOptions,validateProfile,normalizeProfile} from './data';

export default function ProfileForm({initial=blankProfile,onSubmit,register=false,busy=false,disabled=false}) {
  const [p,setP]=useState({...blankProfile,...initial});
  const [step,setStep]=useState(0),[error,setError]=useState('');
  const set=(key,value)=>setP(old=>({...old,[key]:value,...(key==='member_type'&&value==='alumni'&&old.employment_status==='not_applicable'?{employment_status:'employed'}:{})}));
  const field=(key,label,type='text',extra={})=><label className={extra.wide?'wide':''}>{label}<input name={key} type={type} value={p[key]??''} onChange={e=>set(key,e.target.value)} required={!['linkedin','github','portfolio'].includes(key)} maxLength={type==='url'?500:150} {...extra}/></label>;
  const select=(key,label,options)=><label>{label}<select name={key} value={p[key]} onChange={e=>set(key,e.target.value)} required><option value="">Select…</option>{options.map(x=><option key={Array.isArray(x)?x[0]:x} value={Array.isArray(x)?x[0]:x}>{Array.isArray(x)?x[1]:x}</option>)}</select></label>;
  async function submit(e) {
    e.preventDefault(); setError('');
    if(register&&step<2){setStep(step+1);return;}
    const normalized=normalizeProfile(p),problem=validateProfile(normalized);
    if(problem){setError(problem);return;}
    try { await onSubmit(normalized); } catch(err){setError(err.message||'Could not save. Please try again.');}
  }
  return <form className="profile-form" onSubmit={submit}>
    {register&&<ol className="form-steps" aria-label="Registration steps">{['About you','CET & career','Your profile'].map((label,i)=><li key={label} aria-current={step===i?'step':undefined}><span>{i+1}</span>{label}</li>)}</ol>}
    {(!register||step===0)&&<fieldset><legend>Start with you</legend><div className="form-grid">
      <div className="wide role-choice"><span>I am a CET</span>{['student','alumni'].map(role=><label key={role}><input type="radio" name="member_type" checked={p.member_type===role} onChange={()=>set('member_type',role)} />{role==='student'?'Student':'Alumnus / alumna'}</label>)}</div>
      {field('full_name','Full name','text',{autoComplete:'name',minLength:2,maxLength:100})}
      {field('dob','Date of birth · private','date',{min:'1900-01-01',max:new Date(Date.now()-86400000).toISOString().slice(0,10),autoComplete:'bday'})}
      {field('phone','Phone with country code · private','tel',{placeholder:'+919876543210',pattern:'\\+[1-9][0-9]{7,14}',maxLength:16,autoComplete:'tel'})}
      {register&&<>{field('email','Email address','email',{autoComplete:'email',maxLength:254})}{field('password','Password · at least 12 characters','password',{autoComplete:'new-password',minLength:12,maxLength:128})}</>}
    </div><p className="portal-note">DOB and phone are visible only to you and authorized database administrators. They never appear on the map or directory.</p></fieldset>}
    {(!register||step===1)&&<><fieldset><legend>Your time at CET</legend><div className="form-grid">
      {select('program','Programme',programs)}
      {p.program==='B.Tech'&&select('branch','B.Tech branch',branches)}
      {p.program==='M.Tech'&&field('specialization','M.Tech specialization','text',{placeholder:'Enter any specialization',maxLength:150})}
      {select('graduation_year','Class of · graduation / expected year',years)}
    </div></fieldset><fieldset><legend>{p.member_type==='alumni'?'Where life has taken you':'Where you are now'}</legend><div className="form-grid">
      {select('country_code','Current country',countryOptions)}{field('city','Current city','text',{maxLength:120})}
      {p.member_type==='alumni'&&<>{select('employment_status','Current work status',[['employed','Employed'],['self_employed','Self-employed / founder'],['seeking_work','Looking for work'],['studying','Further studies'],['retired','Retired'],['other','Other']])}
      {field('job_title','Current position / role','text',{required:['employed','self_employed'].includes(p.employment_status),maxLength:150})}
      {field('company_name','Company / organization','text',{required:['employed','self_employed'].includes(p.employment_status),maxLength:150})}
      {field('company_location','Company location · city, country','text',{required:['employed','self_employed'].includes(p.employment_status),maxLength:200})}</>}
    </div></fieldset></>}
    {(!register||step===2)&&<fieldset><legend>Make yourself known</legend><div className="form-grid">
      {field('linkedin','LinkedIn · optional','url',{placeholder:'https://www.linkedin.com/in/you'})}
      {field('github','GitHub · optional','url',{placeholder:'https://github.com/you'})}
      {field('portfolio','Portfolio website · optional','url',{placeholder:'https://your-website.com'})}
      <label className="wide">A little about you · optional<textarea value={p.bio} maxLength={500} rows={3} onChange={e=>set('bio',e.target.value)} placeholder="Your interests, skills, or what you hope to build."/></label>
      <label className="check-label wide"><input type="checkbox" checked={p.mentorship} onChange={e=>set('mentorship',e.target.checked)}/>I’m open to mentoring or sharing my experience.</label>
      <label className="check-label wide"><input type="checkbox" checked={p.directory_visible} onChange={e=>set('directory_visible',e.target.checked)}/>Show my profile to verified members and include me in public country totals if I’m alumni.</label>
    </div><p className="portal-note">Directory visibility includes your name, CET details, location, career, bio and links. You can change it anytime. Your name accompanies messages you choose to post in the community, even with a hidden directory profile.</p>
    {register&&<label className="check-label"><input type="checkbox" required/>I confirm that I studied or currently study at College of Engineering Trivandrum, and understand how this information will be used.</label>}
    </fieldset>}
    {error&&<p className="form-error" role="alert">{error}</p>}
    <div className="form-actions">{register&&step>0&&<button type="button" className="secondary" onClick={()=>{setError('');setStep(step-1);}}>Back</button>}<button className="gold-button" disabled={busy||(disabled&&(!register||step===2))}>{busy?'Saving…':register?(step<2?'Continue':'Create account & verify email'):'Save profile'}</button></div>
  </form>;
}
