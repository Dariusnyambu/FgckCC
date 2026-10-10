# FGCK Christ Centre website

React + Vite + Tailwind + Supabase church website with an admin dashboard.

## Run locally

```bash
npm install
npm run dev
```

It runs on built-in sample content until Supabase is connected. Copy `.env.example` to `.env.local` and fill in your project URL and **anon** key to use the real database.

## Database

All database setup, the fix for "column not found" and permission errors, and the SQL to run are in **`supabase/README.md`**. The schema is documented in `supabase/SCHEMA.md`.

## Checks

```bash
npm test               # schema audit + schedule logic + migrations on a real Postgres
npm run build
```

## Where things are

| Area | Location |
|---|---|
| Public pages | `src/pages` |
| Admin screens | `src/pages/admin` (list screens are configured in `crudSections.js`, settings screens in `settingsPages.js`) |
| Data access | `src/data/content.js` |
| Service schedule logic | `src/lib/serviceSchedule.js` |
| Leadership tiers | `src/data/leadership.js` |
| Migrations | `supabase/migrations` |

## Notes

- Videos: paste a YouTube link in Admin > Sermons or Admin > Live Service & Schedule; it plays on the site with its own thumbnail.
- Time zone for services is Africa/Nairobi.
- `public/sitemap.xml`, `public/robots.txt` and `index.html` use `https://fgck-cc.vercel.app`; change it if you move to your own domain.
