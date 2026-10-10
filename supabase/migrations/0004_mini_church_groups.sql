-- 0004_mini_church_groups.sql
-- A mini-church is a GROUP of members organised under a department. It is not a physical location.
-- This evolves the existing mini_churches table (no parallel table, no data loss):
--   department_id  -> which department the group belongs to (can be changed at any time)
--   group_label    -> optional identifier, e.g. "Group A"
--   meeting_day / meeting_time -> structured schedule (the old free-text "meeting" column is kept)
-- Members and leaders of a group live in the new mini_church_members table.
-- The old "location" column is kept but is no longer required or shown.
-- SAFE TO RE-RUN.

alter table public.mini_churches
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists group_label text,
  add column if not exists meeting_day text,
  add column if not exists meeting_time time;

alter table public.mini_churches alter column location drop not null;

alter table public.mini_churches drop constraint if exists mini_churches_meeting_day_check;
alter table public.mini_churches add constraint mini_churches_meeting_day_check
  check (meeting_day is null or meeting_day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'));

create index if not exists mini_churches_department_idx on public.mini_churches (department_id, display_order);

-- Members and leaders of each group
create table if not exists public.mini_church_members (
  id uuid primary key default uuid_generate_v4(),
  mini_church_id uuid not null references public.mini_churches(id) on delete cascade,
  full_name text not null,
  role text not null default 'member' check (role in ('leader','member')),
  phone text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists mini_church_members_group_idx on public.mini_church_members (mini_church_id, role, display_order);

alter table public.mini_church_members enable row level security;

-- Visitors may see a group's LEADERS only (names of ordinary members stay private)
drop policy if exists "public read mini church leaders" on public.mini_church_members;
create policy "public read mini church leaders" on public.mini_church_members for select
  using (
    is_admin()
    or (role = 'leader' and exists (
      select 1 from public.mini_churches g where g.id = mini_church_id and g.published = true))
  );
drop policy if exists "admins manage mini church members" on public.mini_church_members;
create policy "admins manage mini church members" on public.mini_church_members for all
  using (is_admin()) with check (is_admin());

-- Public member counts without exposing names
create or replace function public.public_mini_church_member_counts()
returns table (mini_church_id uuid, member_count int)
language sql stable security definer set search_path = public as $$
  select m.mini_church_id, count(*)::int
  from public.mini_church_members m
  join public.mini_churches g on g.id = m.mini_church_id
  where g.published = true
  group by m.mini_church_id;
$$;
grant execute on function public.public_mini_church_member_counts() to anon, authenticated;

-- Backfill 1: day/time from the old free-text "meeting" column, e.g. "Sundays · 9:00 AM"
do $$
declare r record; d text; t text[];
begin
  for r in select id, meeting from public.mini_churches where meeting is not null and (meeting_day is null or meeting_time is null) loop
    begin
      d := (regexp_match(r.meeting, '(monday|tuesday|wednesday|thursday|friday|saturday|sunday)', 'i'))[1];
      if d is not null then
        update public.mini_churches set meeting_day = initcap(d) where id = r.id and meeting_day is null;
      end if;
      t := regexp_match(r.meeting, '(\d{1,2}):(\d{2})\s*([ap]m)', 'i');
      if t is not null then
        update public.mini_churches
           set meeting_time = to_timestamp(t[1] || ':' || t[2] || ' ' || upper(t[3]), 'HH12:MI AM')::time
         where id = r.id and meeting_time is null;
      end if;
    exception when others then
      raise notice 'Could not parse meeting text for group %, left unchanged', r.id;
    end;
  end loop;
end $$;

-- Backfill 2: the single "leader_name" becomes a proper leader row (only once)
insert into public.mini_church_members (mini_church_id, full_name, role, phone)
select g.id, g.leader_name, 'leader', g.contact_phone
from public.mini_churches g
where g.leader_name is not null and trim(g.leader_name) <> ''
  and not exists (select 1 from public.mini_church_members m where m.mini_church_id = g.id and m.role = 'leader');

notify pgrst, 'reload schema';
