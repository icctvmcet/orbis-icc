import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
countries.registerLocale(en);
export const countryOptions = Object.entries(countries.getNames('en', {select:'official'})).sort((a,b)=>a[1].localeCompare(b[1]));
export const countryName = code => countries.getName(code, 'en') || code;
export const numericCountry = id => countries.numericToAlpha2(String(id).padStart(3,'0'));
export const programs = ['B.Tech','M.Tech','MCA','MBA','B.Arch'];
export const branches = ['ECE','AEI','CS','MECH','IE','CIVIL','EE'];
export const years = Array.from({length:88},(_,i)=>2030-i);
export const blankProfile = {full_name:'',member_type:'student',program:'B.Tech',branch:'',specialization:'',graduation_year:'',dob:'',phone:'',country_code:'IN',city:'',employment_status:'employed',job_title:'',company_name:'',company_location:'',linkedin:'',github:'',portfolio:'',bio:'',mentorship:false,directory_visible:false};
export const normalizeProfile = p => ({...p,graduation_year:Number(p.graduation_year),branch:p.program==='B.Tech'?p.branch:'',specialization:p.program==='M.Tech'?p.specialization:'',employment_status:p.member_type==='alumni'?p.employment_status:'not_applicable',job_title:p.member_type==='alumni'?p.job_title:'',company_name:p.member_type==='alumni'?p.company_name:'',company_location:p.member_type==='alumni'?p.company_location:''});
export function validateProfile(p) {
  if (p.full_name.trim().length < 2) return 'Please enter your full name.';
  if (!programs.includes(p.program)) return 'Choose your CET programme.';
  if (p.program==='B.Tech' && !branches.includes(p.branch)) return 'Choose your B.Tech branch.';
  if (p.program==='M.Tech' && !p.specialization.trim()) return 'Enter your M.Tech specialization.';
  if (!Number.isInteger(Number(p.graduation_year)) || p.graduation_year<1943 || p.graduation_year>2030) return 'Choose a class year between 1943 and 2030.';
  if (!p.dob || p.dob >= new Date().toISOString().slice(0,10)) return 'Enter a valid date of birth before today.';
  if (!/^\+[1-9]\d{7,14}$/.test(p.phone)) return 'Use an international phone number, for example +919876543210 (no spaces).';
  if (!p.country_code || !p.city.trim()) return 'Enter your current country and city.';
  if (p.member_type==='alumni' && ['employed','self_employed'].includes(p.employment_status) && (!p.job_title.trim() || !p.company_name.trim() || !p.company_location.trim())) return 'Enter your position, company and company location.';
  for (const key of ['linkedin','github','portfolio']) if (p[key]) {
    try { if (!['https:','http:'].includes(new URL(p[key]).protocol)) return 'Profile links must start with https:// or http://.'; } catch { return 'Please enter complete website links, including https://.'; }
  }
  return '';
}
