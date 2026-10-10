# Supabase setup, migrations and checks

Everything the database needs is in `supabase/migrations`, as numbered files. **They only add and repair; they never delete your content.** Every file is safe to run more than once.

## What was causing the errors

Your live database was created from an **older version** of the schema. The website code kept gaining new settings, but `create table if not exists` never adds columns to a table that already exists, so those columns were never created. The site then asked for columns that were not there:

| Error you saw | Real cause | Fixed by |
|---|---|---|
| `Could not find the 'bank_account_name' column of 'giving_settings'` | The column exists in the code but your live table predates it (the same applies to other Giving, Homepage, About, Contact, Social and SEO fields). | `0002_schema_alignment.sql` |
| `new row violates row-level security policy` | You were signed in, but your user was not in the `profiles` table, so the database did not treat you as an administrator. | Add yourself to `profiles` (step 4) |
| Blog posts failing to save, or the public blog empty | The blog editor sent `""` for an empty date, and the public blog asked for a `published` column that `blog_posts` does not have (it uses `status`). | Frontend fixes in this release |
| `null value in column "display_order"` | A blank "Display order" was sent as `null` into a column that cannot be null. | Frontend fix in this release |
| Errors only after a successful migration | Supabase caches the table layout. | Each migration ends with `notify pgrst, 'reload schema'` |

One more cause was inside the app: each settings page used to send **every** setting at once, so one missing column broke all of them. Each page now sends only its own columns.

## What to run, in order

### 1. SQL to run in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

Paste the **whole** file, press **Run**, wait for "Success", then move to the next one. Run them in this order:

| # | File | What it does |
|---|---|---|
| 1 | `0001_baseline.sql` | Creates any missing table, the `is_admin()` helper and all permission (RLS) rules. Re-applies the latest rules on a database that already has the tables. |
| 2 | `0002_schema_alignment.sql` | **Adds every missing column** (fixes `bank_account_name` and the similar errors on the Giving, Homepage, About, Contact, Social, SEO, Blog and Live pages). |
| 3 | `0003_leadership_hierarchy.sql` | Adds the leadership tier, phone and email to leaders and sorts your existing leaders into tiers. |
| 4 | `0004_mini_church_groups.sql` | Turns mini-churches into department groups, adds the members table, and keeps your existing groups, leaders and meeting times. |
| 5 | `0005_service_schedule.sql` | Adds the weekly timetable (with your five regular services) and the next-service settings. |
| 6 | `0006_integrity_and_policies.sql` | Scheduled blog posts go public on time, `updated_at` is kept automatically, and indexes are added. |
| 7 | `0007_storage_policies.sql` | Upload permissions for the `church-pics` and `media` buckets (and creates them if missing). |

### 2. Check that nothing is missing

Run `verify_schema.sql` in the SQL Editor. It has four result sets.

- Results 1, 2 and 3 should all be **empty** (nothing missing, no table without permission rules).
- Result 4 should list **your email**. If it is empty, do step 4.

If result 1 lists a column, the migration for it did not run. Re-run the file for that table (usually `0002`).

### 3. Review what the migrations decided for you

```sql
-- Which tier did each existing leader get? Fix any wrong one in Admin > Leadership.
select name, position, department, category from public.leaders order by category, "order";

-- Which groups still need a department? Assign them in Admin > Mini-Church Groups.
select name, department_id, meeting_day, meeting_time from public.mini_churches order by name;

-- The seeded weekly timetable
select name, day_of_week, start_time, end_time, recurrence, week_of_month, is_streamed from public.service_schedule order by display_order;
```

### 4. Make yourself an administrator (fixes the permission error)

```sql
insert into public.profiles (id, full_name, role)
select id, 'Site Admin', 'admin' from auth.users
where email = 'you@example.com'      -- the email you sign in with
on conflict (id) do nothing;
```

Then sign out of the admin and sign back in.

### 5. Things that need a manual action outside the SQL

| Action | Where |
|---|---|
| Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only, never the service-role key). | Vercel → Project → Settings → Environment Variables |
| Set `VITE_STORAGE_BUCKET` to the bucket you use (default `church-pics`). | Same place |
| Redeploy the website (new code is needed: the SQL alone does not fix the blog, blank-number and settings-page bugs). | Vercel → Deployments |
| If you ever see "schema cache" errors again: Settings → API → **Reload schema**. | Supabase dashboard |
| Mark which regular services are streamed online, then add the YouTube link. | Admin → Live Service & Schedule |

### Supabase CLI (optional, instead of the SQL Editor)

The files are valid CLI migrations. For a project you have not run them on yet: `supabase link` then `supabase db push`. **If you already ran them in the SQL Editor, do not push**; the CLI would try to run them again and has no record that they ran. Re-running is safe, but it is unnecessary.

## What changed in the data model

- **Leaders:** `category` (tier), `phone`, `email`.
- **Mini-churches** are groups: `mini_churches.department_id`, `group_label`, `meeting_day`, `meeting_time`; new table `mini_church_members` (leaders and members, only leaders public); function `public_mini_church_member_counts()` for public member counts. The old location-style columns are kept but no longer shown.
- **Services:** new table `service_schedule` (weekly timetable). `live_service_settings` now holds only the next service and stream links (`next_mode` auto/manual, `service_date`, `force_live`).
- **Blog:** public visibility uses `status` (and scheduled time), `updated_at` is automatic.

See `SCHEMA.md` for every table, column, relationship, index and permission rule.

## Keeping code and database in sync

- `npm run audit:schema` checks that every column the website uses exists in the migrations, and rewrites `verify_schema.sql`.
- `npm run test:migrations` runs all migrations on a real Postgres: fresh install, running twice, repairing a database with missing columns, backfills and permission rules.
- `npm run docs:schema` regenerates `SCHEMA.md`.
- The columns used by the non-config forms are listed once in `src/data/schemaContract.js`; the admin form definitions are in `src/pages/admin/crudSections.js` and `settingsPages.js`. The audit reads all three, so a new column cannot be used without a migration.

## Rollback guidance

The migrations are additive, so the safest "rollback" is to leave the new columns in place; the older website code ignores them. If you really must undo one, **take a backup first** (Dashboard → Database → Backups), because dropping columns or tables deletes their data.

```sql
-- 0007: remove upload rules          drop policy "site media public read" on storage.objects; (and the three "admin" policies)
-- 0006: drop trigger trg_blog_posts_updated on public.blog_posts;  drop function public.set_updated_at() cascade;
--       restore the old blog rule:   create policy ... using (status = 'published' or is_admin());
-- 0005: drop table public.service_schedule;
--       alter table public.live_service_settings drop column next_mode, drop column service_date, drop column force_live;
-- 0004: drop function public.public_mini_church_member_counts();  drop table public.mini_church_members;
--       alter table public.mini_churches drop column department_id, drop column group_label, drop column meeting_day, drop column meeting_time;
-- 0003: alter table public.leaders drop column category, drop column phone, drop column email;
-- 0002: columns added there are required by the current website; do not drop them.
```

## What could not be verified here

I had no access to your live Supabase project. Everything above was verified against a real Postgres built from these files, plus a simulated "older database" with columns removed. Your live database may differ, which is why `verify_schema.sql` exists: run it and it tells you exactly what, if anything, is still missing.
