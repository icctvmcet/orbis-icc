-- ORBIS PORTAL | Paste this entire file into the Supabase SQL Editor and run.
-- Enable email confirmation separately in Authentication > Providers > Email.
-- All objects are prefixed orbis_ to avoid collisions with existing apps.
begin;

create table if not exists public.orbis_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  member_type text not null check (member_type in ('student','alumni')),
  program text not null check (program in ('B.Tech','M.Tech','MCA','MBA','B.Arch')),
  branch text not null default '', specialization text not null default '' check (char_length(specialization)<=150),
  graduation_year integer not null check (graduation_year between 1943 and 2030),
  country_code text not null check (country_code = any(string_to_array('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW',' '))),
  city text not null check (char_length(trim(city)) between 1 and 120),
  employment_status text not null default 'not_applicable' check (employment_status in ('not_applicable','employed','self_employed','seeking_work','studying','retired','other')),
  job_title text not null default '' check(char_length(job_title)<=150),
  company_name text not null default '' check(char_length(company_name)<=150),
  company_location text not null default '' check(char_length(company_location)<=200),
  linkedin text not null default '', github text not null default '', portfolio text not null default '',
  bio text not null default '' check (char_length(bio)<=500),
  mentorship boolean not null default false, directory_visible boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((program='B.Tech' and branch in ('ECE','AEI','CS','MECH','IE','CIVIL','EE')) or (program<>'B.Tech' and branch='')),
  check ((program='M.Tech' and char_length(trim(specialization))>0) or (program<>'M.Tech' and specialization='')),
  check ((member_type='student' and employment_status='not_applicable') or (member_type='alumni' and employment_status<>'not_applicable')),
  check (employment_status not in ('employed','self_employed') or (char_length(trim(job_title))>0 and char_length(trim(company_name))>0 and char_length(trim(company_location))>0)),
  check (char_length(linkedin)<=500 and (linkedin='' or linkedin ~ '^https?://[^[:space:]]+$')),
  check (char_length(github)<=500 and (github='' or github ~ '^https?://[^[:space:]]+$')),
  check (char_length(portfolio)<=500 and (portfolio='' or portfolio ~ '^https?://[^[:space:]]+$'))
);

create table if not exists public.orbis_private_profiles (
  id uuid primary key references public.orbis_profiles(id) on delete cascade,
  dob date not null check (dob >= date '1900-01-01' and dob < current_date),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$')
);

create table if not exists public.orbis_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.orbis_profiles(id) on delete cascade,
  kind text not null check (kind in ('chat','question','reply')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  reply_to uuid references public.orbis_posts(id) on delete cascade,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  check ((kind='reply' and reply_to is not null) or (kind<>'reply' and reply_to is null))
);
create index if not exists orbis_posts_date on public.orbis_posts(created_at desc);
create index if not exists orbis_posts_reply on public.orbis_posts(reply_to);
create index if not exists orbis_profiles_country on public.orbis_profiles(country_code) where directory_visible and member_type='alumni';

create table if not exists public.orbis_feedback (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.orbis_profiles(id) on delete cascade,
  category text not null check (category in ('idea','bug','question','other')),
  body text not null check (char_length(trim(body)) between 10 and 3000),
  status text not null default 'received' check (status in ('received','reviewing','resolved')),
  created_at timestamptz not null default now()
);
create table if not exists public.orbis_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.orbis_profiles(id) on delete cascade,
  post_id uuid not null references public.orbis_posts(id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 5 and 500),
  created_at timestamptz not null default now(), unique(reporter_id,post_id)
);

-- These helpers never read roles or permissions from editable user metadata.
create or replace function public.orbis_verified(who uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.users where id=who and email_confirmed_at is not null and (banned_until is null or banned_until<=now()));
$$;
create or replace function public.orbis_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.orbis_verified(auth.uid()) and exists(select 1 from public.orbis_profiles where id=auth.uid());
$$;

-- Internal atomic writer. Never grant this function to browser roles.
create or replace function public.orbis_store_profile(who uuid, p jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if who is null then raise exception 'Authentication required'; end if;
  insert into public.orbis_profiles(id,full_name,member_type,program,branch,specialization,graduation_year,country_code,city,employment_status,job_title,company_name,company_location,linkedin,github,portfolio,bio,mentorship,directory_visible)
  values(who,trim(p->>'full_name'),p->>'member_type',p->>'program',case when p->>'program'='B.Tech' then coalesce(p->>'branch','') else '' end,case when p->>'program'='M.Tech' then coalesce(p->>'specialization','') else '' end,(p->>'graduation_year')::integer,p->>'country_code',trim(p->>'city'),case when p->>'member_type'='student' then 'not_applicable' else p->>'employment_status' end,coalesce(p->>'job_title',''),coalesce(p->>'company_name',''),coalesce(p->>'company_location',''),coalesce(p->>'linkedin',''),coalesce(p->>'github',''),coalesce(p->>'portfolio',''),coalesce(p->>'bio',''),coalesce((p->>'mentorship')::boolean,false),coalesce((p->>'directory_visible')::boolean,false))
  on conflict(id) do update set full_name=excluded.full_name,member_type=excluded.member_type,program=excluded.program,branch=excluded.branch,specialization=excluded.specialization,graduation_year=excluded.graduation_year,country_code=excluded.country_code,city=excluded.city,employment_status=excluded.employment_status,job_title=excluded.job_title,company_name=excluded.company_name,company_location=excluded.company_location,linkedin=excluded.linkedin,github=excluded.github,portfolio=excluded.portfolio,bio=excluded.bio,mentorship=excluded.mentorship,directory_visible=excluded.directory_visible,updated_at=now();
  insert into public.orbis_private_profiles(id,dob,phone) values(who,(p->>'dob')::date,p->>'phone')
  on conflict(id) do update set dob=excluded.dob,phone=excluded.phone;
end;
$$;

create or replace function public.orbis_on_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ? 'orbis_profile' then
    perform public.orbis_store_profile(new.id,new.raw_user_meta_data->'orbis_profile');
    -- Remove the registration payload so private fields don't persist in JWT metadata.
    update auth.users set raw_user_meta_data=raw_user_meta_data-'orbis_profile' where id=new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists orbis_signup on auth.users;
create trigger orbis_signup after insert on auth.users for each row execute function public.orbis_on_signup();

create or replace function public.orbis_save_profile(p jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.orbis_verified(auth.uid()) then raise exception 'Verify your email before saving your profile'; end if;
  perform public.orbis_store_profile(auth.uid(),p);
end;
$$;

-- Only counts are public. No names, email, phone or dates of birth leave this RPC.
create or replace function public.orbis_country_counts() returns table(country_code text, alumni_count bigint)
language sql stable security definer set search_path = '' as $$
  select p.country_code,count(*) from public.orbis_profiles p join auth.users u on u.id=p.id
  where p.member_type='alumni' and p.directory_visible and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until<=now()) group by p.country_code;
$$;

-- Private directory profiles still display a name beside their voluntary posts.
create or replace function public.orbis_post_authors(ids uuid[]) returns table(id uuid,full_name text,member_type text)
language sql stable security definer set search_path = '' as $$
  select p.id,p.full_name,p.member_type from public.orbis_profiles p where public.orbis_member()
  and p.id=any(ids) and cardinality(ids)<=100
  and exists(select 1 from public.orbis_posts m where m.author_id=p.id and not m.deleted);
$$;

create or replace function public.orbis_send_post(content text, post_kind text default 'chat', parent uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if not public.orbis_member() then raise exception 'A verified account and completed profile are required'; end if;
  perform 1 from public.orbis_profiles where id=auth.uid() for update;
  if (select count(*) from public.orbis_posts where author_id=auth.uid() and created_at>now()-interval '1 minute')>=10 then raise exception 'Please wait a minute before posting again'; end if;
  if parent is not null and not exists(select 1 from public.orbis_posts where id=parent and not deleted and kind in ('chat','question')) then raise exception 'This conversation is unavailable'; end if;
  insert into public.orbis_posts(author_id,kind,body,reply_to) values(auth.uid(),post_kind,trim(content),parent) returning id into new_id;
  return new_id;
end;
$$;
create or replace function public.orbis_remove_post(post uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.orbis_member() then raise exception 'Authentication required'; end if;
  update public.orbis_posts set deleted=true,body='[removed]' where id=post and author_id=auth.uid();
end;
$$;
create or replace function public.orbis_send_feedback(content text, feedback_category text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.orbis_member() then raise exception 'Authentication required'; end if;
  perform 1 from public.orbis_profiles where id=auth.uid() for update;
  if (select count(*) from public.orbis_feedback where author_id=auth.uid() and created_at>now()-interval '1 minute')>=3 then raise exception 'Please wait before sending more feedback'; end if;
  insert into public.orbis_feedback(author_id,body,category) values(auth.uid(),trim(content),feedback_category);
end;
$$;

alter table public.orbis_profiles enable row level security;
alter table public.orbis_private_profiles enable row level security;
alter table public.orbis_posts enable row level security;
alter table public.orbis_feedback enable row level security;
alter table public.orbis_reports enable row level security;
drop policy if exists orbis_profile_read on public.orbis_profiles;
create policy orbis_profile_read on public.orbis_profiles for select to authenticated using ((select public.orbis_verified()) and (id=(select auth.uid()) or (directory_visible and public.orbis_verified(id))));
drop policy if exists orbis_private_read on public.orbis_private_profiles;
create policy orbis_private_read on public.orbis_private_profiles for select to authenticated using (id=(select auth.uid()) and (select public.orbis_verified()));
drop policy if exists orbis_posts_read on public.orbis_posts;
create policy orbis_posts_read on public.orbis_posts for select to authenticated using (not deleted and (select public.orbis_member()));
drop policy if exists orbis_feedback_read on public.orbis_feedback;
create policy orbis_feedback_read on public.orbis_feedback for select to authenticated using (author_id=(select auth.uid()) and (select public.orbis_member()));
drop policy if exists orbis_reports_read on public.orbis_reports;
create policy orbis_reports_read on public.orbis_reports for select to authenticated using (reporter_id=(select auth.uid()) and (select public.orbis_member()));
drop policy if exists orbis_reports_insert on public.orbis_reports;
create policy orbis_reports_insert on public.orbis_reports for insert to authenticated with check (reporter_id=(select auth.uid()) and (select public.orbis_member()) and exists(select 1 from public.orbis_posts where id=post_id));

revoke all on public.orbis_profiles,public.orbis_private_profiles,public.orbis_posts,public.orbis_feedback,public.orbis_reports from public,anon,authenticated;
grant select on public.orbis_profiles,public.orbis_private_profiles,public.orbis_posts,public.orbis_feedback,public.orbis_reports to authenticated;
grant insert(reporter_id,post_id,reason) on public.orbis_reports to authenticated;
grant all on public.orbis_profiles,public.orbis_private_profiles,public.orbis_posts,public.orbis_feedback,public.orbis_reports to service_role;

revoke all on function public.orbis_verified(uuid),public.orbis_member(),public.orbis_store_profile(uuid,jsonb),public.orbis_on_signup(),public.orbis_save_profile(jsonb),public.orbis_country_counts(),public.orbis_post_authors(uuid[]),public.orbis_send_post(text,text,uuid),public.orbis_remove_post(uuid),public.orbis_send_feedback(text,text) from public,anon,authenticated;
grant execute on function public.orbis_verified(uuid),public.orbis_member(),public.orbis_save_profile(jsonb),public.orbis_post_authors(uuid[]),public.orbis_send_post(text,text,uuid),public.orbis_remove_post(uuid),public.orbis_send_feedback(text,text) to authenticated;
grant execute on function public.orbis_country_counts() to anon,authenticated;

-- Enable live conversation updates if this Supabase project has Realtime enabled.
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='orbis_posts' and schemaname='public') then
    alter publication supabase_realtime add table public.orbis_posts;
  end if;
end $$;
commit;
