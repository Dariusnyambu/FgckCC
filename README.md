# FGCK Christ Centre | Website + CMS (starter)

A React + Vite + Tailwind + Supabase church website for FGCK Christ Centre,
built CMS-first: every public page reads through `src/data/content.js`, which
tries Supabase and falls back to local sample content in
`src/data/sampleContent.js` so the site looks fully populated even before the
backend is connected.

## What's included

- **Public site** — Home, About, Leadership (with Rev. Dr. John Kimani and
  Pst. Jane Kimani, plus your logo), Departments, Sermons, Live Service
  (self-resetting weekly countdown -> auto "WE ARE LIVE"), Events, Gallery,
  Blog, Prayer, Giving, Contact.
- **Admin shell** — Supabase-auth-protected `/admin` dashboard with the full
  sidebar structure from the brief, stat cards, and a placeholder screen per
  content type that names the exact table it will manage.
- **Database** — complete Postgres schema with Row Level Security in
  `supabase/schema.sql` (public reads published content only; only rows in
  `profiles` can write).
- **Design system** — a distinct visual identity pulled from your logo
  (crimson, gold, warm cream, ink), Fraunces + Inter type pairing, Lucide
  icons throughout.

## What's a placeholder right now

The admin dashboard's individual CRUD screens (blog editor, gallery manager,
event editor, etc.) are stubbed — they show which Supabase table they'll
read/write but don't yet have working forms. The public site and the data
layer are fully wired for them, so building each admin screen is additive
work, not a redesign.

## Run it locally

```bash
npm install
npm run dev
```

The site runs immediately on local sample content — no Supabase project is
required to see the design.

## Connect Supabase (to enable the CMS + admin login)

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`.
3. In Supabase Storage, create a public bucket (e.g. `media`) for images.
4. Copy `.env.example` to `.env.local` and fill in your project's URL and
   **anon** key (Project Settings -> API). Never put the service-role key in
   the frontend.
5. Create your first admin user in Supabase Auth, then insert a matching row
   into `profiles` so Row Level Security recognizes them as an admin:
   ```sql
   insert into profiles (id, full_name, role)
   values ('<the user auth.users id>', 'Your Name', 'admin');
   ```
6. Restart `npm run dev` — the admin dashboard at `/admin/login` will now
   accept that email/password, and public pages will read from Supabase
   instead of the local sample content the moment you publish rows.

## Project structure

```
src/
  components/       Navbar, Footer, Layout, ServiceCountdown, cards
  context/          AuthContext (Supabase auth)
  data/             content.js (Supabase-first data layer), sampleContent.js
  lib/              supabaseClient.js, serviceSchedule.js (countdown logic)
  pages/            public pages
  pages/admin/      admin dashboard, sidebar, login, placeholders
supabase/schema.sql Full Postgres schema + RLS policies
```

## Suggested next build order

1. Blog editor (WYSIWYG, SEO fields, draft/publish/schedule)
2. Leadership & Departments admin CRUD (photo upload to Supabase Storage)
3. Gallery album/image manager
4. Sermons & Events admin CRUD
5. Site settings / homepage section editor
6. Prayer requests & contact messages inbox


## Since the last update

- Rebranded: Roboto (multiple weights) + a red/orange/gold/navy/white theme, stored as CSS variables so it's live-editable from Admin → Site Settings (color pickers, instant preview, persists to `site_settings`).
- Added **Mini Churches** and **Service Sectors** as full content types (schema, public pages, nav/footer links, admin CRUD).
- Admin CRUD now works end-to-end (once Supabase is connected) for: Events, Departments, Mini Churches, Service Sectors, Sermons, Gallery Albums, Leadership.
- Blog has a real editor now: `/admin/blogs` (list) and `/admin/blogs/new` / `/admin/blogs/:id` (editor) with a lightweight rich-text toolbar (headings, lists, blockquote, scripture block, callout, links, images, divider, alignment), SEO/OG fields, draft/published/scheduled/archived status, and auto reading-time. Public posts render at `/blog/:slug`.
- Live Service Settings now has a real admin form (`/admin/live-service`) with a live preview of the countdown — change day/time/timezone/stream links and the public countdown recalculates automatically, no manual reset.
- Navbar's CTA auto-switches to a pulsing "Watch Live" button (linking straight to the stream) during the live window.

## Latest update

- Header decluttered (8 main links + CTA); Departments, Mini Churches, Service Sectors, Gallery, Prayer and Giving now live as quick-link buttons in the homepage hero (and the full mobile menu / footer).
- Logo cropped to its circle, so the header logo and browser tab icon are circular (`public/images/logo.png`, `favicon.png`).
- Every admin screen is now a working page: list + search + add + edit + publish/hide + delete for Events, Departments, Mini Churches, Service Sectors, Sermons, Gallery Albums, Leadership and Blog Categories; editors for Homepage, About, Social Media, SEO and Giving; inboxes for Prayer Requests and Contact Messages; Media Library; Admin Users; Site Settings; Blog editor; Live Service.
- Image fields upload straight to Supabase Storage (`media` bucket, created by `supabase/schema.sql`).
- Admin works on phones (slide-out menu). The dashboard shows live counts, quick actions and the upcoming-service countdown.
- Already ran an older `schema.sql`? Run the "UPGRADING AN EXISTING DATABASE" block at the bottom of the file once.
