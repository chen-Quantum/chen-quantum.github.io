-- Applied to the existing teaching-workspace project using apply_migration.
-- Only the Edge Function may access these tables; browsers have no table grants.
create table public.student_portal_courses (
  id text primary key,
  title text not null,
  title_he text not null,
  role text not null,
  access_code text,
  board_enabled boolean not null default true
);
create table public.student_portal_staff (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.student_portal_memberships (
  actor_hash text not null,
  course_id text not null references public.student_portal_courses(id),
  created_at timestamptz not null default now(),
  primary key (actor_hash, course_id)
);
create table public.student_portal_questions (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.student_portal_courses(id),
  actor_hash text not null,
  title text not null check (length(title) between 4 and 180),
  body text not null check (length(body) between 5 and 8000),
  category text not null check (category in ('concept','exercise','logistics','technical')),
  status text not null default 'open' check (status in ('open','answered','closed')),
  hidden boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create index student_portal_questions_course_date on public.student_portal_questions(course_id,created_at desc);
create table public.student_portal_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.student_portal_questions(id) on delete cascade,
  actor_hash text not null,
  body text not null check (length(body) between 2 and 8000),
  official boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index student_portal_answers_question on public.student_portal_answers(question_id,created_at);
create table public.student_portal_votes (
  question_id uuid not null references public.student_portal_questions(id) on delete cascade,
  actor_hash text not null,
  primary key (question_id,actor_hash)
);
create table public.student_portal_tickets (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.student_portal_courses(id),
  actor_hash text not null,
  subject text not null check (length(subject) between 4 and 180),
  body text not null check (length(body) between 5 and 8000),
  student_name text not null default '' check (length(student_name)<=120),
  student_email text check (student_email is null or length(student_email)<=254),
  request_kind text not null default 'private' check (request_kind in ('private','logistics')),
  constraint student_portal_logistics_contact_required check (request_kind <> 'logistics' or (course_id <> 'general' and student_email is not null and student_email ~ '^[^[:space:][:cntrl:]@<>]+@[^[:space:][:cntrl:]@<>]+[.][^[:space:][:cntrl:]@<>]{2,}$')),
  category text not null check (category in ('logistics','material','personal','other')),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index student_portal_tickets_owner on public.student_portal_tickets(actor_hash,course_id,updated_at desc);
create index student_portal_tickets_course_status on public.student_portal_tickets(course_id,status);
create table public.student_portal_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.student_portal_tickets(id) on delete cascade,
  body text not null check (length(body) between 2 and 8000),
  official boolean not null default false,
  created_at timestamptz not null default now()
);
create index student_portal_ticket_messages_ticket on public.student_portal_ticket_messages(ticket_id,created_at);
create table public.student_portal_rate_limits (
  bucket text primary key,
  window_start timestamptz not null,
  hits integer not null
);
create function public.student_portal_rate_limit(p_bucket text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
  insert into public.student_portal_rate_limits(bucket,window_start,hits)
  values (p_bucket,now(),1)
  on conflict(bucket) do update set
    window_start=case when student_portal_rate_limits.window_start < now()-make_interval(secs=>p_seconds) then now() else student_portal_rate_limits.window_start end,
    hits=case when student_portal_rate_limits.window_start < now()-make_interval(secs=>p_seconds) then 1 else student_portal_rate_limits.hits+1 end
  returning hits into n;
  if random()<0.01 then
    delete from public.student_portal_rate_limits where window_start<now()-interval '2 days';
  end if;
  return n<=p_limit;
end;
$$;
revoke all on function public.student_portal_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.student_portal_rate_limit(text,integer,integer) to service_role;

do $$
declare t text;
begin
  foreach t in array array['courses','staff','memberships','questions','answers','votes','tickets','ticket_messages','rate_limits'] loop
    execute format('alter table public.student_portal_%I enable row level security',t);
    execute format('revoke all on table public.student_portal_%I from public,anon,authenticated',t);
    execute format('grant all on table public.student_portal_%I to service_role',t);
    execute format('create policy deny_browser_access on public.student_portal_%I for all to anon,authenticated using (false) with check (false)',t);
  end loop;
end;
$$;

insert into public.student_portal_courses(id,title,title_he,role,access_code,board_enabled) values
('international-engineering','International Engineering Program','המסלול הבינלאומי להנדסה','Lecturer',upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),true),
('linear-algebra-electrical','Linear Algebra · Electrical Engineering','אלגברה לינארית להנדסת חשמל','Teaching Assistant',upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),true),
('linear-algebra-biomedical','Linear Algebra · Biomedical Engineering','אלגברה לינארית להנדסה ביו־רפואית','Teaching Assistant',upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),true),
('general','General inquiries','פניות כלליות','Contact',null,false);
insert into public.student_portal_staff(user_id)
select id from auth.users where lower(email)='chengadi@mail.tau.ac.il';
