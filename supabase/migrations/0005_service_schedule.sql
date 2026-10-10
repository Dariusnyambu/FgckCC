-- 0005_service_schedule.sql
-- Separates two different things that used to be mixed together:
--   1. NEXT SERVICE  (live_service_settings): the specific upcoming service/event. Either computed
--      automatically from the weekly timetable ("auto") or set to a one-off event ("manual").
--   2. WEEKLY TIMETABLE (service_schedule): the church's regular services. Never changed by the next-service setting.
-- SAFE TO RE-RUN. Seeding only inserts entries that do not already exist.

alter table public.live_service_settings
  add column if not exists next_mode text not null default 'auto',
  add column if not exists service_date date,
  add column if not exists force_live boolean not null default false;

alter table public.live_service_settings drop constraint if exists live_service_next_mode_check;
alter table public.live_service_settings add constraint live_service_next_mode_check
  check (next_mode in ('auto','manual'));
alter table public.live_service_settings drop constraint if exists live_service_manual_needs_date;
alter table public.live_service_settings add constraint live_service_manual_needs_date
  check (next_mode = 'auto' or service_date is not null);

create table if not exists public.service_schedule (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  day_of_week int not null check (day_of_week between 0 and 6),          -- 0 = Sunday ... 6 = Saturday
  start_time time not null,
  end_time time not null,
  recurrence text not null default 'weekly' check (recurrence in ('weekly','monthly_nth')),
  week_of_month int,                                                      -- 1..5, or -1 = last (monthly_nth only)
  timezone text not null default 'Africa/Nairobi',
  is_streamed boolean not null default false,
  stream_url text,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_schedule_end_after_start check (end_time > start_time),
  constraint service_schedule_week_valid check (
    (recurrence = 'weekly' and week_of_month is null)
    or (recurrence = 'monthly_nth' and week_of_month is not null and (week_of_month between 1 and 5 or week_of_month = -1))
  )
);

alter table public.service_schedule drop constraint if exists service_schedule_week_valid;
alter table public.service_schedule add constraint service_schedule_week_valid check (
  (recurrence = 'weekly' and week_of_month is null)
  or (recurrence = 'monthly_nth' and week_of_month is not null and (week_of_month between 1 and 5 or week_of_month = -1))
);

create unique index if not exists service_schedule_unique_entry
  on public.service_schedule (name, day_of_week, start_time, coalesce(week_of_month, 0));
create index if not exists service_schedule_day_idx on public.service_schedule (day_of_week, start_time);

alter table public.service_schedule enable row level security;
drop policy if exists "public read active service schedule" on public.service_schedule;
create policy "public read active service schedule" on public.service_schedule for select
  using (is_active = true or is_admin());
drop policy if exists "admins manage service schedule" on public.service_schedule;
create policy "admins manage service schedule" on public.service_schedule for all
  using (is_admin()) with check (is_admin());

-- The church's regular order of services. Overlaps (Wednesday) are intentional and preserved.
insert into public.service_schedule (name, day_of_week, start_time, end_time, recurrence, week_of_month, display_order)
select v.name, v.dow, v.st::time, v.et::time, v.rec, v.wk, v.ord
from (values
  ('Daily Prayers',      1, '18:00', '19:00', 'weekly',      null::int, 10),
  ('Daily Prayers',      2, '18:00', '19:00', 'weekly',      null::int, 11),
  ('Daily Prayers',      3, '18:00', '19:00', 'weekly',      null::int, 12),
  ('Daily Prayers',      4, '18:00', '19:00', 'weekly',      null::int, 13),
  ('Daily Prayers',      5, '18:00', '19:00', 'weekly',      null::int, 14),
  ('Midweek Service',    3, '17:45', '19:30', 'weekly',      null::int, 20),
  ('Youth Service',      0, '08:00', '09:45', 'weekly',      null::int, 30),
  ('Main Service',       0, '10:00', '13:30', 'weekly',      null::int, 40),
  ('Worship Wednesday',  3, '17:45', '20:00', 'monthly_nth', 3,         50)
) as v(name, dow, st, et, rec, wk, ord)
where not exists (
  select 1 from public.service_schedule s
  where s.name = v.name and s.day_of_week = v.dow and s.start_time = v.st::time
    and coalesce(s.week_of_month, 0) = coalesce(v.wk, 0)
);

notify pgrst, 'reload schema';
