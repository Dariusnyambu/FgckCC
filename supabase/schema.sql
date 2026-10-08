-- FGCK Christ Centre — Supabase schema
-- Run in the Supabase SQL editor. Adjust as the CMS grows.

create extension if not exists "uuid-ossp";

-- ============ CORE ============

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  id int primary key default 1,
  church_name text not null default 'FGCK Christ Centre',
  tagline text,
  logo_url text,
  favicon_url text,
  hero_image_url text,
  hero_text text,
  about_content text,
  pastor_message text,
  address text,
  phone text,
  email text,
  service_summary text,
  footer_content text,
  hero_title text,
  about_intro text,
  about_history text,
  vision text,
  mission text,
  core_values text,
  beliefs text,
  facebook_url text,
  youtube_url text,
  instagram_url text,
  twitter_url text,
  tiktok_url text,
  whatsapp_number text,
  seo_title text,
  seo_keywords text,
  seo_description text,
  og_image text,
  show_about boolean not null default true,
  show_leadership boolean not null default true,
  show_departments boolean not null default true,
  show_sermons boolean not null default true,
  show_events boolean not null default true,
  show_cta boolean not null default true,
  -- Theme colors — editable from Admin > Site Settings, applied live via
  -- CSS custom properties (see src/context/ThemeContext.jsx).
  primary_color text not null default '#C62828',
  primary_color_dark text not null default '#8E1C1C',
  primary_color_light text not null default '#E2574A',
  secondary_color text not null default '#E86A1C',
  accent_color text not null default '#EFA80A',
  accent_color_dark text not null default '#B87F06',
  accent_color_light text not null default '#F7CB63',
  navy_color text not null default '#0B1F3A',
  navy_color_light text not null default '#15335C',
  background_color text not null default '#FFFFFF',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id, church_name) values (1, 'FGCK Christ Centre')
  on conflict (id) do nothing;

create table if not exists navigation_items (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  path text not null,
  display_order int not null default 0,
  published boolean not null default true
);

create table if not exists homepage_sections (
  id uuid primary key default uuid_generate_v4(),
  section_key text not null unique,
  title text,
  content text,
  enabled boolean not null default true,
  display_order int not null default 0
);

-- ============ LEADERSHIP ============

create table if not exists leaders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  position text not null,
  department text,
  bio text,
  image_url text,
  facebook_url text,
  instagram_url text,
  "order" int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ DEPARTMENTS ============

create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  description text,
  image_url text,
  leader_id uuid references leaders(id) on delete set null,
  meeting_day text,
  meeting_time text,
  contact_email text,
  contact_phone text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists department_members (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid references departments(id) on delete cascade,
  full_name text not null,
  role text,
  created_at timestamptz not null default now()
);

-- ============ MINI CHURCHES ============

create table if not exists mini_churches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  leader_name text,
  contact_phone text,
  meeting text,
  members_count int,
  description text,
  image_url text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ SERVICE SECTORS ============

create table if not exists service_sectors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  coordinator_name text,
  contact_phone text,
  meeting text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ GALLERY ============

create table if not exists gallery_albums (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text,
  cover_image text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default uuid_generate_v4(),
  album_id uuid references gallery_albums(id) on delete cascade,
  image_url text not null,
  title text,
  description text,
  featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ SERMONS ============

create table if not exists sermons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  speaker text,
  date date not null default current_date,
  scripture text,
  description text,
  thumbnail_url text,
  video_url text,
  audio_url text,
  youtube_url text,
  category text,
  tags text[],
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ EVENTS ============

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text,
  start_date date not null,
  end_date date,
  start_time time,
  location text,
  organizer text,
  registration_link text,
  contact_info text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============ BLOG ============

create table if not exists blog_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  published boolean not null default true
);

create table if not exists blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  cover_image text,
  author text,
  author_id uuid references profiles(id),
  category text,
  category_id uuid references blog_categories(id),
  status text not null default 'draft' check (status in ('draft','published','scheduled','archived')),
  seo_title text,
  seo_description text,
  focus_keyword text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image text,
  reading_time int,
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

create table if not exists blog_post_tags (
  post_id uuid references blog_posts(id) on delete cascade,
  tag_id uuid references blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============ LIVE SERVICE ============

create table if not exists live_service_settings (
  id int primary key default 1,
  title text not null default 'Sunday Worship Service',
  thumbnail_url text,
  streaming_url text,
  youtube_url text,
  facebook_url text,
  description text,
  day_of_week int not null default 0 check (day_of_week between 0 and 6),
  start_time time not null default '10:00',
  end_time time not null default '12:30',
  timezone text not null default 'Africa/Nairobi',
  status text not null default 'scheduled' check (status in ('scheduled','live','ended')),
  constraint single_row check (id = 1)
);
insert into live_service_settings (id) values (1) on conflict (id) do nothing;

-- ============ COMMUNICATION ============

create table if not exists prayer_requests (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  phone text,
  message text not null,
  anonymous boolean not null default false,
  status text not null default 'new' check (status in ('new','read','prayed_for','archived')),
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now()
);

-- ============ GIVING ============

create table if not exists giving_settings (
  id int primary key default 1,
  message text,
  bank_details text,
  mobile_money_details text,
  instructions text,
  mpesa_paybill text,
  mpesa_account text,
  mpesa_till text,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_branch text,
  constraint single_row check (id = 1)
);
insert into giving_settings (id) values (1) on conflict (id) do nothing;

-- ============ MEDIA ============

create table if not exists media (
  id uuid primary key default uuid_generate_v4(),
  file_url text not null,
  file_type text,
  file_name text,
  file_size int,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============
-- Public (anon) role: read-only, published content only.
-- Authenticated admins (rows in `profiles`): full read/write.

alter table site_settings enable row level security;
alter table navigation_items enable row level security;
alter table homepage_sections enable row level security;
alter table leaders enable row level security;
alter table departments enable row level security;
alter table department_members enable row level security;
alter table mini_churches enable row level security;
alter table service_sectors enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_images enable row level security;
alter table sermons enable row level security;
alter table events enable row level security;
alter table blog_categories enable row level security;
alter table blog_posts enable row level security;
alter table blog_tags enable row level security;
alter table blog_post_tags enable row level security;
alter table live_service_settings enable row level security;
alter table prayer_requests enable row level security;
alter table contact_messages enable row level security;
alter table giving_settings enable row level security;
alter table media enable row level security;
alter table profiles enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid());
$$ language sql stable security definer;

-- Public read access to published content
create policy "public read published leaders" on leaders for select using (published = true or is_admin());
create policy "public read published departments" on departments for select using (published = true or is_admin());
create policy "public read published mini_churches" on mini_churches for select using (published = true or is_admin());
create policy "public read published service_sectors" on service_sectors for select using (published = true or is_admin());
create policy "public read published gallery_albums" on gallery_albums for select using (published = true or is_admin());
create policy "public read gallery_images" on gallery_images for select using (true);
create policy "public read published sermons" on sermons for select using (published = true or is_admin());
create policy "public read published events" on events for select using (published = true or is_admin());
create policy "public read published blog_categories" on blog_categories for select using (published = true or is_admin());
create policy "public read published blog_posts" on blog_posts for select using (status = 'published' or is_admin());
create policy "public read blog_tags" on blog_tags for select using (true);
create policy "public read blog_post_tags" on blog_post_tags for select using (true);
create policy "public read site_settings" on site_settings for select using (true);
create policy "public read navigation_items" on navigation_items for select using (published = true or is_admin());
create policy "public read homepage_sections" on homepage_sections for select using (enabled = true or is_admin());
create policy "public read live_service_settings" on live_service_settings for select using (true);
create policy "public read giving_settings" on giving_settings for select using (true);

-- Anyone can submit prayer requests / contact messages, but only admins can read/manage them
create policy "anyone can submit prayer requests" on prayer_requests for insert with check (true);
create policy "admins manage prayer requests" on prayer_requests for select using (is_admin());
create policy "admins update prayer requests" on prayer_requests for update using (is_admin());
create policy "admins delete prayer requests" on prayer_requests for delete using (is_admin());

create policy "anyone can submit contact messages" on contact_messages for insert with check (true);
create policy "admins manage contact messages" on contact_messages for select using (is_admin());
create policy "admins update contact messages" on contact_messages for update using (is_admin());
create policy "admins delete contact messages" on contact_messages for delete using (is_admin());

-- Admin-only write access everywhere else
create policy "admins manage leaders" on leaders for all using (is_admin()) with check (is_admin());
create policy "admins manage departments" on departments for all using (is_admin()) with check (is_admin());
create policy "admins manage department_members" on department_members for all using (is_admin()) with check (is_admin());
create policy "admins manage mini_churches" on mini_churches for all using (is_admin()) with check (is_admin());
create policy "admins manage service_sectors" on service_sectors for all using (is_admin()) with check (is_admin());
create policy "admins manage gallery_albums" on gallery_albums for all using (is_admin()) with check (is_admin());
create policy "admins manage gallery_images" on gallery_images for all using (is_admin()) with check (is_admin());
create policy "admins manage sermons" on sermons for all using (is_admin()) with check (is_admin());
create policy "admins manage events" on events for all using (is_admin()) with check (is_admin());
create policy "admins manage blog_categories" on blog_categories for all using (is_admin()) with check (is_admin());
create policy "admins manage blog_posts" on blog_posts for all using (is_admin()) with check (is_admin());
create policy "admins manage blog_tags" on blog_tags for all using (is_admin()) with check (is_admin());
create policy "admins manage blog_post_tags" on blog_post_tags for all using (is_admin()) with check (is_admin());
create policy "admins manage site_settings" on site_settings for all using (is_admin()) with check (is_admin());
create policy "admins manage navigation_items" on navigation_items for all using (is_admin()) with check (is_admin());
create policy "admins manage homepage_sections" on homepage_sections for all using (is_admin()) with check (is_admin());
create policy "admins manage live_service_settings" on live_service_settings for all using (is_admin()) with check (is_admin());
create policy "admins manage giving_settings" on giving_settings for all using (is_admin()) with check (is_admin());
create policy "admins manage media" on media for all using (is_admin()) with check (is_admin());
create policy "admins read profiles" on profiles for select using (is_admin());
create policy "admins manage profiles" on profiles for all using (is_admin()) with check (is_admin());


-- ============ STORAGE (uploads) ============
-- Public bucket for images/videos/audio/PDFs uploaded from the admin dashboard.
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

create policy "public can view media" on storage.objects for select using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "admins update media" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "admins delete media" on storage.objects for delete using (bucket_id = 'media' and is_admin());

-- ============ UPGRADING AN EXISTING DATABASE ============
-- If you already ran an earlier version of this file, run these once:
alter table site_settings
  add column if not exists hero_title text, add column if not exists about_intro text,
  add column if not exists about_history text, add column if not exists vision text,
  add column if not exists mission text, add column if not exists core_values text,
  add column if not exists beliefs text, add column if not exists facebook_url text,
  add column if not exists youtube_url text, add column if not exists instagram_url text,
  add column if not exists twitter_url text, add column if not exists tiktok_url text,
  add column if not exists whatsapp_number text, add column if not exists seo_title text,
  add column if not exists seo_keywords text, add column if not exists seo_description text,
  add column if not exists og_image text,
  add column if not exists show_about boolean not null default true,
  add column if not exists show_leadership boolean not null default true,
  add column if not exists show_departments boolean not null default true,
  add column if not exists show_sermons boolean not null default true,
  add column if not exists show_events boolean not null default true,
  add column if not exists show_cta boolean not null default true;
alter table giving_settings
  add column if not exists mpesa_paybill text, add column if not exists mpesa_account text,
  add column if not exists mpesa_till text, add column if not exists bank_name text,
  add column if not exists bank_account_name text, add column if not exists bank_account_number text,
  add column if not exists bank_branch text;
alter table prayer_requests drop constraint if exists prayer_requests_status_check;
alter table prayer_requests add constraint prayer_requests_status_check
  check (status in ('new','read','prayed_for','archived'));
