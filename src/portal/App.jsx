import {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {supabase,configured,result,portalUrl} from './client';
import {blankProfile} from './data';
import ProfileForm from './ProfileForm';
import WorldMap from './WorldMap';
import Directory from './Directory';
import Community from './Community';
import Feedback from './Feedback';
import PortalNav from './PortalNav';
import './portal.css';

const routes=['home','login','register','verify','forgot','recover','directory','community','feedback','profile'];
const invalidAuthLink=new URLSearchParams(location.hash.slice(1)).has('error')||new URLSearchParams(location.search).has('error');
const initialRoute=()=>{const key=location.hash.slice(1);return routes.includes(key)?key:'home';};

function App() {
  const [tab,setTab]=useState(initialRoute),[session,setSession]=useState(null),[authReady,setAuthReady]=useState(!configured),[profile,setProfile]=useState(null),[profileReady,setProfileReady]=useState(false),[profileError,setProfileError]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[country,setCountry]=useState(new URLSearchParams(location.search).get('country')||'');
  const user=session?.user,verified=Boolean(user?.email_confirmed_at);
  const go=(next)=>{setError('');setNotice('');setPassword('');setTab(next);location.hash=next;};
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[tab]);
  useEffect(()=>{
    if(invalidAuthLink){setError('This email link has expired or is invalid. Request a new confirmation or password reset link below.');setTab('login');history.replaceState(null,'',location.pathname+'#login');}
    const handler=()=>{if(routes.includes(location.hash.slice(1)))setTab(initialRoute());};window.addEventListener('hashchange',handler);
    if(!supabase)return ()=>window.removeEventListener('hashchange',handler);
    let alive=true;
    supabase.auth.getSession().then(({data,error})=>{if(alive){if(error)setError(error.message);setSession(data.session);setAuthReady(true);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{
      if(!alive)return;setSession(s);setAuthReady(true);
      if(event==='PASSWORD_RECOVERY'){setTab('recover');location.hash='recover';}
      else if(event==='SIGNED_IN'&&initialRoute()==='login'){setTab('home');location.hash='home';}
    });
    return ()=>{alive=false;subscription.unsubscribe();window.removeEventListener('hashchange',handler);};
  },[]);
  useEffect(()=>{
    let alive=true;setProfile(null);setProfileError('');setProfileReady(false);
    if(!verified){setProfileReady(true);return;}
    Promise.all([result(supabase.from('orbis_profiles').select('*').eq('id',user.id).maybeSingle()),result(supabase.from('orbis_private_profiles').select('dob,phone').eq('id',user.id).maybeSingle())]).then(([p,privateData])=>{if(alive){setProfile(p?{...p,...privateData}:null);setProfileReady(true);}}).catch(err=>{if(alive){setProfileError(err.message);setProfileReady(true);}});
    return ()=>{alive=false;};
  },[user?.id,verified]);
  async function register(p) {
    if(!supabase)return;setBusy(true);
    const {email:address,password:secret,...details}=p;
    try{const {error}=await supabase.auth.signUp({email:address.trim(),password:secret,options:{emailRedirectTo:portalUrl(),data:{orbis_profile:details}}});if(error)throw error;setEmail(address);go('verify');setNotice('Check your inbox for a confirmation link. If you already have an account, sign in or reset your password.');}finally{setBusy(false);}
  }
  async function authAction(e) {
    e.preventDefault();if(!supabase)return;setBusy(true);setError('');setNotice('');
    try {
      if(tab==='login') {await result(supabase.auth.signInWithPassword({email:email.trim(),password}));go('home');}
      else if(tab==='forgot'){await result(supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:portalUrl()}));setNotice('If this email has an account, a password reset link is on its way.');}
      else if(tab==='recover'){await result(supabase.auth.updateUser({password}));setPassword('');setNotice('Your password has been updated.');}
      else {await result(supabase.auth.resend({type:'signup',email:email.trim(),options:{emailRedirectTo:portalUrl()}}));setNotice('Confirmation requested. Check your inbox and spam folder.');}
    } catch(err){setError(err.message);}finally{setBusy(false);}
  }
  async function save(p) {setBusy(true);try{await result(supabase.rpc('orbis_save_profile',{p}));setProfile({...p,id:user.id});setNotice('Your profile has been saved.');}finally{setBusy(false);}}
  async function signOut(){setBusy(true);try{await result(supabase.auth.signOut());setSession(null);setProfile(null);go('home');}catch(err){setError(err.message);}finally{setBusy(false);}}
  const chooseCountry=code=>{setCountry(code);go('directory');};
  const loginGate=<div className="empty-state"><p className="portal-eyebrow">A community built on trust</p><h1>Come into the circle.</h1><p>Verify your email to explore member profiles, join conversations, and send feedback.</p><div className="form-actions"><button className="gold-button" onClick={()=>go('register')}>Create your account</button><button className="secondary" onClick={()=>go('login')}>Sign in</button></div></div>;
  let content;
  if(!authReady)content=<p role="status">Checking your session…</p>;
  else if(tab==='home')content=<><div className="portal-welcome"><div><p className="portal-eyebrow">The Orbis network · CET</p><h1>{verified?`Welcome${profile?', '+profile.full_name.split(' ')[0]:''}.`:'Your campus connections. Everywhere.'}</h1><p>A shared space for CET students and alumni to find one another, exchange experience, and create opportunities.</p><div className="form-actions"><button className="gold-button" onClick={()=>go(verified?'directory':'register')}>{verified?'Explore the directory':'Join the network'}</button><button className="secondary" onClick={()=>go(verified?'community':'login')}>{verified?'Enter the common room':'Already a member? Sign in'}</button></div></div><div className="welcome-seal"><img src="assets/orbis-mark.png" width="182" height="182" alt=""/><span>People · Skills · Impact</span></div></div><WorldMap onCountry={chooseCountry}/><div className="portal-feature-grid">{[['directory','Reconnect','Find classmates, alumni and mentors.'],['community','Ask & share','A common room for ideas and questions.'],['feedback','Shape Orbis','Tell us what would make this network better.']].map(([key,title,description])=><button key={key} className="feature-card" onClick={()=>go(key)}><h2>{title} ↗</h2><p>{description}</p></button>)}</div></>;
  else if(tab==='register')content=verified?<div className="empty-state"><h1>You’re already signed in.</h1><button className="gold-button" onClick={()=>go('profile')}>Go to your profile</button></div>:<section className="narrow-content"><div className="page-heading"><p className="portal-eyebrow">Your next chapter starts here</p><h1>Join the Orbis network.</h1><p>For students and alumni of College of Engineering Trivandrum. Email verification confirms your email address; CET affiliation is self-declared.</p></div><ProfileForm register onSubmit={register} busy={busy} disabled={!configured}/></section>;
  else if(['login','forgot','verify','recover'].includes(tab))content=<section className="auth-panel"><p className="portal-eyebrow">Welcome to your community</p><h1>{tab==='login'?'Good to have you back.':tab==='forgot'?'Let’s get you back in.':tab==='recover'?'Choose a new password.':'Check your inbox.'}</h1><p>{tab==='verify'?'Open the confirmation link in your email to activate your account. You can request another link below.':tab==='forgot'?'We’ll send a password reset link to your email.':'Your connections are waiting.'}</p>
    {tab==='recover'&&!session?<p className="notice">Open the password reset link from your email first. <button onClick={()=>go('forgot')} className="text-button">Request a new link</button></p>:<form onSubmit={authAction}>{tab!=='recover'&&<label>Email address<input type="email" required value={email} autoComplete="email" onChange={e=>setEmail(e.target.value)}/></label>}{['login','recover'].includes(tab)&&<label>{tab==='recover'?'New password · at least 12 characters':'Password'}<input type="password" required minLength={tab==='recover'?12:1} maxLength={128} autoComplete={tab==='recover'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>}<button disabled={!configured||busy} className="gold-button">{busy?'Please wait…':tab==='login'?'Sign in':tab==='forgot'?'Send reset link':tab==='recover'?'Update password':'Resend verification email'}</button></form>}
    <div className="auth-links">{tab==='login'?<><button onClick={()=>go('forgot')}>Forgot your password?</button><button onClick={()=>go('verify')}>Resend confirmation</button><button onClick={()=>go('register')}>Create an account</button></>:<button onClick={()=>go('login')}>Back to sign in</button>}</div></section>;
  else if(!verified)content=loginGate;
  else if(!profileReady)content=<p role="status">Loading your profile…</p>;
  else if(profileError)content=<div className="empty-state"><h1>We couldn’t load your profile.</h1><p className="form-error">{profileError}</p><p>If the project is new, run the Orbis database migration first.</p><button className="secondary" onClick={()=>location.reload()}>Retry</button></div>;
  else if(tab==='profile'||!profile)content=<section className="narrow-content"><div className="page-heading"><p className="portal-eyebrow">Your place in the network</p><h1>{profile?'Your profile. Your story.':'Finish your profile.'}</h1><p>Keep your details current and choose what the community can see.</p></div><ProfileForm key={user.id} initial={profile||blankProfile} onSubmit={save} busy={busy}/><div className="account-settings"><h2>Account settings</h2><p>Signed in as {user.email}</p><button className="secondary" onClick={()=>go('forgot')}>Reset password</button><p className="portal-note">To request account or data deletion, send the team private feedback. You can hide your directory profile immediately using the visibility setting above.</p></div></section>;
  else if(tab==='directory')content=<Directory country={country} setCountry={setCountry}/>;
  else if(tab==='community')content=<Community user={user}/>;
  else if(tab==='feedback')content=<Feedback/>;
  return <div className="portal-shell"><a className="skip-link" href="#portal-content">Skip to content</a><header className="portal-header"><a className="portal-brand" href="index.html"><img src="assets/orbis-mark.png" alt="" width="44" height="44"/><span><strong>ORBIS</strong><small>The CET network</small></span></a><PortalNav active={tab} onSelect={go}/><div className="portal-account">{session?<><button className="secondary" onClick={()=>go('profile')}>My profile</button><button className="text-button" disabled={busy} onClick={signOut}>Sign out</button></>:<button className="gold-button" onClick={()=>go('login')}>Sign in</button>}</div></header>
    {!configured&&<div className="setup-notice" role="status">Portal preview · Account services will open after the Supabase project is connected. You can explore the registration form now.</div>}
    <main id="portal-content" tabIndex={-1} className="portal-main">{error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="notice">{notice}</p>}{content}</main><footer className="portal-footer"><span>Orbis · An Islamic Cultural Centre initiative</span><a href="index.html">Back to the main website ↗</a></footer></div>;
}
createRoot(document.getElementById('portal-root')).render(<App/>);
