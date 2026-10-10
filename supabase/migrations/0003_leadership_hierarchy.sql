-- 0003_leadership_hierarchy.sql
-- Adds a tier ("category") to every leader so the public Leadership page can show the structure:
--   1 pastoral_team  2 church_council  3 departmental_heads  4 service_sector_leaders  5 mini_church_leaders
-- Existing leaders are KEPT. They are backfilled once, based on their position/department text.
-- PLEASE REVIEW the backfill result (query at the bottom) and correct any leader in Admin > Leadership.
-- SAFE TO RE-RUN.

alter table public.leaders
  add column if not exists category text,
  add column if not exists phone text,
  add column if not exists email text;

update public.leaders set category = case
  when lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%pastor%'
    or lower(coalesce("position",'')) like '%bishop%' or lower(coalesce("position",'')) like '%reverend%' then 'pastoral_team'
  when lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%council%'
    or lower(coalesce("position",'')) like '%elder%' or lower(coalesce("position",'')) like '%trustee%' then 'church_council'
  when lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%mini church%'
    or lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%mini-church%'
    or lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%minichurch%'
    or lower(coalesce("position",'')) like '%group leader%' then 'mini_church_leaders'
  when lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%sector%'
    or lower(coalesce("position",'')) like '%usher%' or lower(coalesce("position",'')) like '%security%'
    or lower(coalesce("position",'')) like '%media%' then 'service_sector_leaders'
  when lower(coalesce("position",'') || ' ' || coalesce(department,'')) like '%head%'
    or lower(coalesce("position",'')) like '%director%' or lower(coalesce("position",'')) like '%coordinator%' then 'departmental_heads'
  else 'pastoral_team'
end
where category is null;

alter table public.leaders alter column category set default 'pastoral_team';
alter table public.leaders alter column category set not null;

alter table public.leaders drop constraint if exists leaders_category_check;
alter table public.leaders add constraint leaders_category_check
  check (category in ('pastoral_team','church_council','departmental_heads','service_sector_leaders','mini_church_leaders'));

create index if not exists leaders_category_order_idx on public.leaders (category, "order");

notify pgrst, 'reload schema';

-- Review query (run separately):
-- select name, position, department, category from public.leaders order by category, "order";
