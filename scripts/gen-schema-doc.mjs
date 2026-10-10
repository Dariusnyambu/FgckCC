#!/usr/bin/env node
// Generates supabase/SCHEMA.md by applying the migrations to a real Postgres (PGlite) and reading the catalog,
// so the documentation is exactly what the migrations create. Purposes/feature mapping is kept in `docs` below.
import { PGlite } from "@electric-sql/pglite";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(root, "supabase", "migrations");

const docs = {
  profiles: ["Administrators. A signed-in user can change content only if they have a row here; this is what is_admin() checks.", "Admin login and permissions, Admin Users"],
  site_settings: ["Single row (id = 1): church name, logo, brand colours, hero text, About content, contact, map, social links, SEO and which homepage sections are shown.", "Site Settings, Homepage, About, Contact & Location, Social Media, SEO, theme, header/footer"],
  giving_settings: ["Single row (id = 1): giving message, M-Pesa and bank details.", "Giving Settings, public Giving page"],
  live_service_settings: ["Single row (id = 1): the NEXT SERVICE (automatic or one-off) and streaming links. Not the weekly timetable.", "Live Service & Schedule, Live page, homepage hero, header Watch Live button"],
  service_schedule: ["The weekly order of services. One row per service per day; supports 'every week' and 'Nth week of the month'.", "Live Service & Schedule, Live page timetable, automatic next service"],
  leaders: ["Church leaders. `category` is the leadership tier (pastoral team, church council, departmental heads, service sector leaders, mini-church leaders).", "Leadership admin, Leadership page, homepage pastoral team"],
  departments: ["Departments and ministries.", "Departments admin and page, parent of mini-church groups"],
  department_members: ["Reserved for department membership lists. No screen uses it yet.", "(none yet)"],
  mini_churches: ["Mini-church GROUPS: a group of members under a department (not a location). Day/time, description, department.", "Mini-Church Groups admin, Mini-Churches page"],
  mini_church_members: ["Leaders and members of each group. Only leaders and the member count are public.", "Mini-Church Groups admin (Members panel), Mini-Churches page"],
  service_sectors: ["Service teams (ushering, media, security, ...).", "Service Sectors admin and page"],
  gallery_albums: ["Photo albums.", "Gallery admin and page"],
  gallery_images: ["Photos inside albums. No admin screen yet.", "(none yet)"],
  sermons: ["Sermons with YouTube/video/audio links.", "Sermons admin, Sermons page, homepage"],
  events: ["Church events.", "Events admin and page, homepage"],
  blog_categories: ["Blog categories.", "Blog Categories admin, blog editor"],
  blog_posts: ["Blog articles. Visibility is controlled by `status` (draft, published, scheduled, archived), not a published flag.", "Blogs admin and editor, Blog pages"],
  blog_tags: ["Reserved for tags. No screen uses it yet.", "(none yet)"],
  blog_post_tags: ["Reserved: links posts to tags.", "(none yet)"],
  prayer_requests: ["Prayer requests from visitors. Anyone can submit; only admins can read.", "Prayer page, Prayer Requests inbox"],
  contact_messages: ["Messages from the contact form. Anyone can submit; only admins can read.", "Contact page, Contact Messages inbox"],
  media: ["Index of files uploaded to Storage.", "Media Library, image upload fields"],
  navigation_items: ["Reserved for editable navigation. The header is currently defined in code.", "(none yet)"],
  homepage_sections: ["Reserved. Homepage section visibility currently uses the show_* columns of site_settings.", "(none yet)"],
};

const db = new PGlite({ extensions: { uuid_ossp } });
await db.exec(`
  create extension if not exists "uuid-ossp";
  create role anon nologin; create role authenticated nologin;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  create table storage.buckets (id text primary key, name text, public boolean default false);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
`);
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) await db.exec(fs.readFileSync(path.join(DIR, f), "utf8"));

const q = async (sql) => (await db.query(sql)).rows;
const tables = (await q(`select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by 1`)).map((r) => r.table_name);
const cols = await q(`select table_name t, column_name c, data_type d, udt_name u, is_nullable n, column_default df, ordinal_position o from information_schema.columns where table_schema='public' order by table_name, ordinal_position`);
const pks = await q(`select tc.table_name t, string_agg(kcu.column_name, ', ') c from information_schema.table_constraints tc join information_schema.key_column_usage kcu using (constraint_name, table_schema) where tc.table_schema='public' and tc.constraint_type='PRIMARY KEY' group by 1`);
const fks = await q(`select conrelid::regclass::text t, pg_get_constraintdef(oid) d from pg_constraint where contype='f' and connamespace='public'::regnamespace order by 1`);
const checks = await q(`select conrelid::regclass::text t, conname n, pg_get_constraintdef(oid) d from pg_constraint where contype='c' and connamespace='public'::regnamespace order by 1, 2`);
const uniques = await q(`select tablename t, indexname n, indexdef d from pg_indexes where schemaname='public' and indexdef like 'CREATE UNIQUE%' and indexname not like '%_pkey' order by 1`);
const indexes = await q(`select tablename t, indexname n, indexdef d from pg_indexes where schemaname='public' and indexdef not like 'CREATE UNIQUE%' order by 1, 2`);
const pols = await q(`select schemaname s, tablename t, policyname n, cmd, roles::text r, qual, with_check from pg_policies where schemaname in ('public','storage') order by schemaname, tablename, policyname`);
const funcs = await q(`select p.proname n, pg_get_function_arguments(p.oid) a, pg_get_function_result(p.oid) r, p.prosecdef sd from pg_proc p where pronamespace='public'::regnamespace order by 1`);
const trigs = await q(`select event_object_table t, trigger_name n, action_timing || ' ' || event_manipulation e from information_schema.triggers where trigger_schema='public' order by 1`);
const rls = Object.fromEntries((await q(`select relname t, relrowsecurity r from pg_class where relnamespace='public'::regnamespace and relkind='r'`)).map((r) => [r.t, r.r]));

const type = (c) => (c.d === "USER-DEFINED" ? c.u : c.d === "ARRAY" ? `${c.u.replace(/^_/, "")}[]` : c.d).replace("timestamp with time zone", "timestamptz").replace("character varying", "text").replace("time without time zone", "time");
const short = (s) => (s || "").replace(/\s+/g, " ").replace(/::[a-z ]+/g, "").trim();
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");

let md = `# Database schema reference

_Generated by \`npm run docs:schema\` from the migrations in \`supabase/migrations\` (applied to a real Postgres), so it matches what they create. Do not edit by hand._

Applied in this order: ${files.map((f) => `\`${f}\``).join(", ")}.

## Tables at a glance

| Table | Purpose | Used by |
|---|---|---|
${tables.map((t) => `| \`${t}\` | ${esc(docs[t]?.[0] || "")} | ${esc(docs[t]?.[1] || "")} |`).join("\n")}

## Relationships

${fks.map((f) => `- \`${f.t.replace("public.", "")}\`: ${short(f.d).replace(/public\./g, "")}`).join("\n")}

## Tables and columns
`;
for (const t of tables) {
  md += `\n### \`${t}\`\n\n${docs[t]?.[0] || ""}\n\nPrimary key: ${pks.find((p) => p.t === t)?.c || "none"} · Row Level Security: **${rls[t] ? "on" : "OFF"}**\n\n| Column | Type | Nullable | Default |\n|---|---|---|---|\n`;
  for (const c of cols.filter((x) => x.t === t)) md += `| \`${c.c}\` | ${type(c)} | ${c.n === "YES" ? "yes" : "**no**"} | ${esc(short(c.df)) ? "`" + esc(short(c.df)) + "`" : ""} |\n`;
  const ck = checks.filter((x) => x.t === t);
  const un = uniques.filter((x) => x.t === t);
  if (ck.length) md += `\nChecks: ${ck.map((x) => `\`${x.n}\` ${short(x.d)}`).join("; ")}\n`;
  if (un.length) md += `\nUnique: ${un.map((x) => `\`${x.n}\``).join(", ")}\n`;
}
md += `\n## Indexes\n\n${indexes.map((i) => `- \`${i.t}\`: \`${i.n}\``).join("\n")}\n`;
md += `\n## Functions and triggers\n\n${funcs.map((f) => `- \`${f.n}(${f.a})\` returns ${f.r}${f.sd ? " (security definer)" : ""}`).join("\n")}\n${trigs.map((t) => `- trigger \`${t.n}\` on \`${t.t}\` (${t.e})`).join("\n")}\n`;
md += `\n## Row Level Security policies\n\nAdministrators are users with a row in \`profiles\` (checked by \`is_admin()\`). The public (anon) role is limited to what is listed below.\n\n| Table | Policy | Command | Who / condition |\n|---|---|---|---|\n`;
for (const p of pols) md += `| \`${p.s === "storage" ? "storage." : ""}${p.t}\` | ${esc(p.n)} | ${p.cmd} | ${esc(short([p.qual && `using ${p.qual}`, p.with_check && `check ${p.with_check}`].filter(Boolean).join(" ")))} |\n`;
md += `
## Storage

Public buckets \`church-pics\` (default, set by \`VITE_STORAGE_BUCKET\`) and \`media\`. Anyone can view files; only administrators can upload, replace or delete (migration 0007). Uploaded files are indexed in the \`media\` table.

## Notes on legacy columns (kept, not removed)

- \`live_service_settings.day_of_week\`: no longer used. The weekly timetable now lives in \`service_schedule\`.
- \`mini_churches.location\`, \`mini_churches.meeting\`, \`leader_name\`, \`contact_phone\`, \`members_count\`: from when mini-churches were treated as places. \`location\` is optional and hidden; \`meeting\`, \`leader_name\` and \`members_count\` are still used as a fallback when the newer fields are empty.
`;
fs.writeFileSync(path.join(root, "supabase", "SCHEMA.md"), md);
// One file with every migration in order, for pasting into the SQL Editor in a single go.
fs.writeFileSync(
  path.join(root, "supabase", "all-migrations-combined.sql"),
  `-- All migrations in order (generated by npm run docs:schema). Safe to run more than once.\n\n` +
    files.map((f) => `-- ===================== ${f} =====================\n` + fs.readFileSync(path.join(DIR, f), "utf8")).join("\n\n")
);
console.log(`Wrote supabase/SCHEMA.md (${tables.length} tables, ${pols.length} policies)`);
