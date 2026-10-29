import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import countries from 'i18n-iso-countries';

// An isolated PostgreSQL engine: tests the migration and real policies, never a live project.
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated; create role service_role bypassrls;
  create schema auth;
  create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz,raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth to anon,authenticated,service_role;
  grant execute on function auth.uid() to anon,authenticated,service_role;
`);
const migration=await readFile('supabase/001_orbis_portal.sql','utf8');
await db.exec(migration);
await db.exec(migration); // Safe to paste again.
const A='11111111-1111-4111-8111-111111111111', B='22222222-2222-4222-8222-222222222222', U='33333333-3333-4333-8333-333333333333';
const profile={full_name:'Test Alumni',member_type:'alumni',program:'B.Tech',branch:'CS',specialization:'',graduation_year:2020,country_code:'IN',city:'Trivandrum',employment_status:'employed',job_title:'Engineer',company_name:'Example',company_location:'Trivandrum, India',linkedin:'',github:'',portfolio:'',bio:'',mentorship:true,directory_visible:true,dob:'1998-01-02',phone:'+919876543210'};
for(const [id,verified] of [[A,true],[B,true],[U,false]]) await db.query('insert into auth.users(id,email_confirmed_at,raw_user_meta_data) values($1,$2,$3)',[id,verified?'2026-10-29T00:00:00Z':null,JSON.stringify({orbis_profile:{...profile,full_name:id===A?'Alumni A':id===B?'Alumni B':'Unverified'}})]);
assert.deepEqual((await db.query('select raw_user_meta_data from auth.users where id=$1',[A])).rows[0].raw_user_meta_data,{});
const as=async(role,id='')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec(`set role ${role}`);};
const denied=async(fn)=>{await assert.rejects(fn);};

await as('anon');
assert.equal(Number((await db.query('select * from public.orbis_country_counts()')).rows[0].alumni_count),2);
await denied(()=>db.query('select * from public.orbis_profiles'));
await denied(()=>db.query('select * from public.orbis_private_profiles'));
await denied(()=>db.query('select public.orbis_store_profile($1,$2)',[A,JSON.stringify(profile)]));
console.log('PASS: anonymous counts only; private and directory data blocked');

await as('authenticated',U);
assert.equal((await db.query('select * from public.orbis_profiles')).rows.length,0);
await denied(()=>db.query('select public.orbis_send_post($1,$2,$3)',['hello','chat',null]));
await denied(()=>db.query('select public.orbis_save_profile($1)',[JSON.stringify(profile)]));
console.log('PASS: unverified accounts cannot read or post');

await as('authenticated',A);
assert.equal((await db.query('select * from public.orbis_private_profiles')).rows.length,1);
assert.equal((await db.query('select * from public.orbis_private_profiles where id=$1',[B])).rows.length,0);
await denied(()=>db.query('update public.orbis_profiles set full_name=$1 where id=$2',['Impersonation',B]));
await denied(()=>db.query('select public.orbis_store_profile($1,$2)',[B,JSON.stringify(profile)]));
await denied(()=>db.query('insert into public.orbis_posts(author_id,kind,body) values($1,$2,$3)',[B,'chat','spoof']));
await denied(()=>db.query('select public.orbis_save_profile($1)',[JSON.stringify({...profile,full_name:'Should roll back',phone:'bad'})]));
assert.equal((await db.query('select full_name from public.orbis_profiles where id=$1',[A])).rows[0].full_name,'Alumni A');
for(const bad of [{program:'B.Tech',branch:'INVALID'},{graduation_year:1942},{graduation_year:2031},{program:'M.Tech',specialization:''},{portfolio:'javascript:alert(1)'},{company_name:''},{country_code:'ZZ'},{dob:'2099-01-01'}]) await denied(()=>db.query('select public.orbis_save_profile($1)',[JSON.stringify({...profile,...bad})]));
await db.query('select public.orbis_save_profile($1)',[JSON.stringify({...profile,full_name:'Alumni A',program:'M.Tech',specialization:'Any custom specialization',directory_visible:false})]);
const post=(await db.query('select public.orbis_send_post($1,$2,$3) as id',['Can someone help?','question',null])).rows[0].id;
await db.query('select public.orbis_send_feedback($1,$2)',['An idea for the Orbis network','idea']);
console.log('PASS: ownership, atomic validation, programme/year/link checks');

await as('authenticated',B);
assert.equal((await db.query('select * from public.orbis_profiles where id=$1',[A])).rows.length,0);
assert.equal((await db.query('select * from public.orbis_feedback')).rows.length,0);
assert.equal((await db.query('select * from public.orbis_post_authors($1)',[[A]])).rows[0].full_name,'Alumni A');
await db.query('select public.orbis_send_post($1,$2,$3)',['Here is a reply','reply',post]);
await db.query('select public.orbis_remove_post($1)',[post]);
assert.equal((await db.query('select * from public.orbis_posts where id=$1',[post])).rows.length,1);
await denied(()=>db.query('insert into public.orbis_reports(reporter_id,post_id,reason) values($1,$2,$3)',[A,post,'Not appropriate']));
await db.query('insert into public.orbis_reports(reporter_id,post_id,reason) values($1,$2,$3)',[B,post,'Not appropriate']);
for(let i=0;i<9;i++)await db.query('select public.orbis_send_post($1,$2,$3)',['Rate test '+i,'chat',null]);
await denied(()=>db.query('select public.orbis_send_post($1,$2,$3)',['Too many','chat',null]));
console.log('PASS: private opt-out, feedback isolation, replies, author-only removal, reporting and rate limit');

await as('authenticated',A);
await db.query('select public.orbis_remove_post($1)',[post]);
assert.equal((await db.query('select * from public.orbis_posts where id=$1',[post])).rows.length,0);
await as('anon');
assert.equal(Number((await db.query('select * from public.orbis_country_counts()')).rows[0].alumni_count),1);
console.log('PASS: deleted messages hidden; public counts respect directory opt-out');
await as('authenticated',A);
for(const country_code of Object.keys(countries.getAlpha2Codes())) await db.query('select public.orbis_save_profile($1)',[JSON.stringify({...profile,country_code,directory_visible:false})]);
for(const program of ['B.Tech','M.Tech','MCA','MBA','B.Arch']) for(const graduation_year of [1943,2030]) await db.query('select public.orbis_save_profile($1)',[JSON.stringify({...profile,member_type:'student',program,graduation_year,specialization:'Custom field',directory_visible:false})]);
for(const branch of ['ECE','AEI','CS','MECH','IE','CIVIL','EE']) await db.query('select public.orbis_save_profile($1)',[JSON.stringify({...profile,member_type:'student',branch,directory_visible:false})]);
await denied(()=>db.query('select public.orbis_send_post($1,$2,$3)',['Reply after removal','reply',post]));
console.log('PASS: all country options, programmes, branches, inclusive year boundaries, removed-thread protection');
await db.exec('reset role');
await db.query("update auth.users set banned_until=now()+interval '1 hour' where id=$1",[B]);
await as('authenticated',B);
assert.equal((await db.query('select * from public.orbis_profiles')).rows.length,0);
await denied(()=>db.query('select public.orbis_save_profile($1)',[JSON.stringify(profile)]));
await denied(()=>db.query('select public.orbis_send_post($1,$2,$3)',['Banned account','chat',null]));
await as('anon');
assert.equal((await db.query('select * from public.orbis_country_counts()')).rows.length,0);
console.log('PASS: banned accounts cannot access the portal with an existing token and are excluded from the map');
await db.close();
