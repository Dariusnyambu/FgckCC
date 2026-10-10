-- 0006_integrity_and_policies.sql
-- * Scheduled blog posts become public automatically once their publish time has passed.
-- * updated_at is maintained by the database.
-- * Indexes for the queries the website runs most.
-- SAFE TO RE-RUN.

drop policy if exists "public read published blog_posts" on public.blog_posts;
create policy "public read published blog_posts" on public.blog_posts for select
  using (
    status = 'published'
    or (status = 'scheduled' and scheduled_at is not null and scheduled_at <= now())
    or is_admin()
  );

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_blog_posts_updated on public.blog_posts;
create trigger trg_blog_posts_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();
drop trigger if exists trg_service_schedule_updated on public.service_schedule;
create trigger trg_service_schedule_updated before update on public.service_schedule
  for each row execute function public.set_updated_at();
drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists events_start_date_idx on public.events (start_date);
create index if not exists sermons_date_idx on public.sermons (date desc);
create index if not exists departments_order_idx on public.departments (display_order);
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);
create index if not exists prayer_requests_status_idx on public.prayer_requests (status, created_at desc);

notify pgrst, 'reload schema';
