-- 0002_schema_alignment.sql
-- Repairs "column ... not found in the schema cache" errors.
-- Cause: the live database was created from an earlier version of the schema, and columns that the
-- admin dashboard now reads and writes were added to the code later. "create table if not exists"
-- never adds columns to a table that already exists, so they have to be added explicitly.
-- SAFE TO RE-RUN. Adds columns only; never drops or rewrites data.

-- ---------- site_settings ----------
alter table public.site_settings
  add column if not exists hero_title text,
  add column if not exists hero_image_url text,
  add column if not exists hero_text text,
  add column if not exists about_content text,
  add column if not exists pastor_message text,
  add column if not exists footer_content text,
  add column if not exists about_intro text,
  add column if not exists about_history text,
  add column if not exists vision text,
  add column if not exists mission text,
  add column if not exists core_values text,
  add column if not exists beliefs text,
  add column if not exists facebook_url text,
  add column if not exists youtube_url text,
  add column if not exists instagram_url text,
  add column if not exists twitter_url text,
  add column if not exists tiktok_url text,
  add column if not exists whatsapp_number text,
  add column if not exists map_url text,
  add column if not exists map_embed_url text,
  add column if not exists office_hours text,
  add column if not exists seo_title text,
  add column if not exists seo_keywords text,
  add column if not exists seo_description text,
  add column if not exists og_image text,
  add column if not exists show_about boolean not null default true,
  add column if not exists show_leadership boolean not null default true,
  add column if not exists show_departments boolean not null default true,
  add column if not exists show_sermons boolean not null default true,
  add column if not exists show_events boolean not null default true,
  add column if not exists show_cta boolean not null default true,
  add column if not exists primary_color text not null default '#C62828',
  add column if not exists primary_color_dark text not null default '#8E1C1C',
  add column if not exists primary_color_light text not null default '#E2574A',
  add column if not exists secondary_color text not null default '#E86A1C',
  add column if not exists accent_color text not null default '#EFA80A',
  add column if not exists accent_color_dark text not null default '#B87F06',
  add column if not exists accent_color_light text not null default '#F7CB63',
  add column if not exists navy_color text not null default '#0B1F3A',
  add column if not exists navy_color_light text not null default '#15335C',
  add column if not exists background_color text not null default '#FFFFFF';

-- ---------- giving_settings (fixes: column "bank_account_name" not found) ----------
alter table public.giving_settings
  add column if not exists message text,
  add column if not exists instructions text,
  add column if not exists mpesa_paybill text,
  add column if not exists mpesa_account text,
  add column if not exists mpesa_till text,
  add column if not exists bank_name text,
  add column if not exists bank_account_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_branch text;
insert into public.giving_settings (id) values (1) on conflict (id) do nothing;

-- ---------- blog_posts ----------
alter table public.blog_posts
  add column if not exists author text,
  add column if not exists category text,
  add column if not exists excerpt text,
  add column if not exists cover_image text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists focus_keyword text,
  add column if not exists canonical_url text,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists og_image text,
  add column if not exists reading_time int,
  add column if not exists published_at timestamptz,
  add column if not exists scheduled_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

-- ---------- live_service_settings ----------
alter table public.live_service_settings
  add column if not exists thumbnail_url text,
  add column if not exists streaming_url text,
  add column if not exists youtube_url text,
  add column if not exists facebook_url text,
  add column if not exists description text;
insert into public.live_service_settings (id) values (1) on conflict (id) do nothing;

-- ---------- prayer_requests: "read" status ----------
alter table public.prayer_requests drop constraint if exists prayer_requests_status_check;
alter table public.prayer_requests add constraint prayer_requests_status_check
  check (status in ('new','read','prayed_for','archived'));

-- ---------- leaders / departments / sermons / events / albums (columns the admin forms write) ----------
alter table public.leaders
  add column if not exists department text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text;
alter table public.departments
  add column if not exists slug text,
  add column if not exists meeting_day text,
  add column if not exists meeting_time text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;
alter table public.sermons
  add column if not exists category text,
  add column if not exists video_url text,
  add column if not exists audio_url text,
  add column if not exists youtube_url text,
  add column if not exists thumbnail_url text,
  add column if not exists featured boolean not null default false;
alter table public.events
  add column if not exists end_date date,
  add column if not exists organizer text,
  add column if not exists registration_link text,
  add column if not exists contact_info text,
  add column if not exists featured boolean not null default false;
alter table public.gallery_albums
  add column if not exists category text,
  add column if not exists cover_image text;
alter table public.service_sectors
  add column if not exists contact_phone text,
  add column if not exists meeting text;

notify pgrst, 'reload schema';
