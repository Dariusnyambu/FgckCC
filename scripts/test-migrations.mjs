#!/usr/bin/env node
// Runs every migration in supabase/migrations on a real in-memory Postgres (PGlite) and checks behaviour:
// fresh install, re-running, repairing a drifted database, backfills, permissions (RLS), and verify_schema.sql.
import { PGlite } from "@electric-sql/pglite";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(root, "supabase", "migrations");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
let failures = 0;
const check = (name, ok, extra = "") => { if (!ok) failures++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`); };

async function fresh() {
  const db = new PGlite({ extensions: { uuid_ossp } });
  await db.exec(`
    create extension if not exists "uuid-ossp";
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean default false);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
  `);
  return db;
}
async function apply(db, list = files) {
  for (const f of list) {
    try { await db.exec(fs.readFileSync(path.join(DIR, f), "utf8")); }
    catch (e) { return `${f}: ${e.message}`; }
  }
  return null;
}
const rows = async (db, sql) => (await db.query(sql)).rows;
const grants = (db) => db.exec(`grant all on all tables in schema public to anon, authenticated; grant execute on all functions in schema public to anon, authenticated;`);
async function as(db, sub, role, sql) {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub','${sub}', false);`);
  try { return { ok: true, rows: (await db.query(sql)).rows }; }
  catch (e) { return { ok: false, error: e.message }; }
  finally { await db.exec("reset role;"); }
}

// ---------- 1. fresh install + idempotency ----------
let db = await fresh();
let err = await apply(db);
check("fresh install runs all migrations", !err, err || "");
err = await apply(db);
check("re-running every migration is safe (idempotent)", !err, err || "");
await grants(db);

// verify_schema.sql must return nothing on a correct database
const verify = fs.readFileSync(path.join(root, "supabase", "verify_schema.sql"), "utf8").split(/;\s*\n/).filter((q) => /select/i.test(q) && !/auth\.users/.test(q));
const bad = [];
for (const q of verify) { const r = await db.query(q); if (r.rows.length) bad.push(JSON.stringify(r.rows.slice(0, 3))); }
check("verify_schema.sql reports nothing missing", bad.length === 0, bad.join(" | "));

// ---------- 2. weekly timetable seed ----------
const sched = await rows(db, `select name, day_of_week d, start_time::text s, end_time::text e, recurrence r, week_of_month w from service_schedule order by display_order`);
const has = (name, d, s, e, r = "weekly", w = null) => sched.some((x) => x.name === name && x.d === d && x.s === s && x.e === e && x.r === r && x.w === w);
check("Daily Prayers Mon-Fri 6:00-7:00 PM (5 rows)", [1, 2, 3, 4, 5].every((d) => has("Daily Prayers", d, "18:00:00", "19:00:00")));
check("Midweek Service Wed 5:45-7:30 PM", has("Midweek Service", 3, "17:45:00", "19:30:00"));
check("Youth Service Sun 8:00-9:45 AM", has("Youth Service", 0, "08:00:00", "09:45:00"));
check("Main Service Sun 10:00 AM-1:30 PM", has("Main Service", 0, "10:00:00", "13:30:00"));
check("Worship Wednesday = every 3rd Wed 5:45-8:00 PM (not 'Worship Sunday')", has("Worship Wednesday", 3, "17:45:00", "20:00:00", "monthly_nth", 3) && !sched.some((x) => /sunday/i.test(x.name) && /worship/i.test(x.name)));
check("overlapping Wednesday entries preserved, nothing auto-resolved", sched.filter((x) => x.d === 3).length === 3);
const dupe = await db.query(`insert into service_schedule (name, day_of_week, start_time, end_time) values ('Main Service', 0, '10:00', '13:30')`).then(() => false, () => true);
check("duplicate timetable entry is rejected", dupe);
const badTime = await db.query(`insert into service_schedule (name, day_of_week, start_time, end_time) values ('X', 1, '10:00', '09:00')`).then(() => false, () => true);
check("end time before start time is rejected", badTime);
const badNth = await db.query(`insert into service_schedule (name, day_of_week, start_time, end_time, recurrence) values ('Y', 1, '10:00', '11:00', 'monthly_nth')`).then(() => false, () => true);
check("monthly entry without a week is rejected", badNth);
const manualNoDate = await db.query(`update live_service_settings set next_mode='manual' where id=1`).then(() => false, () => true);
check("one-off next service without a date is rejected", manualNoDate);
await db.exec(`update live_service_settings set next_mode='manual', service_date='2026-10-15', title='Thursday Prayer Meeting', start_time='18:00', end_time='19:00' where id=1`);
check("setting a one-off next service leaves the timetable untouched", (await rows(db, `select count(*)::int c from service_schedule`))[0].c === 9);

// ---------- 3. permissions (row level security) ----------
const ADMIN = "11111111-1111-1111-1111-111111111111";
await db.exec(`insert into auth.users (id, email) values ('${ADMIN}','admin@test.org')`);
let r = await as(db, ADMIN, "authenticated", `insert into mini_churches (name) values ('X')`);
check("signed-in user who is NOT in profiles is blocked (the RLS error you saw)", !r.ok && /row-level security/.test(r.error));
await db.exec(`insert into profiles (id, full_name, role) values ('${ADMIN}','Admin','admin')`);
r = await as(db, ADMIN, "authenticated", `insert into mini_churches (name) values ('Open Hearts') returning id`);
check("after adding the user to profiles, saving works", r.ok);
r = await as(db, ADMIN, "authenticated", `update giving_settings set bank_account_name='FGCK', mpesa_paybill='123' where id=1 returning bank_account_name`);
check("giving_settings.bank_account_name saves", r.ok && r.rows[0]?.bank_account_name === "FGCK", r.error || "");
r = await as(db, ADMIN, "authenticated", `insert into blog_posts (title, slug, status, author, category, scheduled_at) values ('T','t','scheduled','A','Faith', now() - interval '1 hour')`);
check("blog post with author, category and schedule saves", r.ok, r.error || "");
r = await as(db, ADMIN, "authenticated", `insert into leaders (name, position) values ('Rev Test','Senior Pastor') returning category`);
check("new leader gets a default tier", r.ok && r.rows[0].category === "pastoral_team");
r = await as(db, ADMIN, "authenticated", `insert into leaders (name, position, category) values ('Bad','X','nonsense')`);
check("invalid leadership tier is rejected", !r.ok);
r = await as(db, "", "anon", `select count(*)::int c from blog_posts`);
check("visitors see a scheduled post once its time has passed", r.rows?.[0]?.c === 1);
await db.exec(`insert into blog_posts (title, slug, status) values ('Draft','draft','draft')`);
r = await as(db, "", "anon", `select count(*)::int c from blog_posts`);
check("visitors never see drafts", r.rows?.[0]?.c === 1);
r = await as(db, "", "anon", `insert into mini_churches (name) values ('Hack')`);
check("visitors cannot create groups", !r.ok);
r = await as(db, "", "anon", `insert into prayer_requests (message, anonymous) values ('please pray', true)`);
check("visitors can submit a prayer request", r.ok);
r = await as(db, "", "anon", `select * from prayer_requests`);
check("visitors cannot read prayer requests", r.ok && r.rows.length === 0);
r = await as(db, "", "anon", `select count(*)::int c from service_schedule`);
check("visitors can read the timetable", r.rows?.[0]?.c === 9);
r = await as(db, "", "anon", `update service_schedule set name='Hacked'`);
check("visitors cannot edit the timetable", r.ok && r.rows.length === 0 && (await rows(db, `select count(*)::int c from service_schedule where name='Hacked'`))[0].c === 0);

// mini-church groups: private member names, public leaders + counts
const g = (await rows(db, `select id from mini_churches limit 1`))[0].id;
await db.exec(`insert into mini_church_members (mini_church_id, full_name, role) values ('${g}','Leader One','leader'),('${g}','Member One','member'),('${g}','Member Two','member')`);
r = await as(db, "", "anon", `select full_name from mini_church_members`);
check("visitors see group leaders but not ordinary members", r.rows?.length === 1 && r.rows[0].full_name === "Leader One");
r = await as(db, "", "anon", `select member_count from public_mini_church_member_counts() where mini_church_id='${g}'`);
check("visitors get the member count (3)", r.rows?.[0]?.member_count === 3);
await db.exec(`insert into departments (id, name) values ('22222222-2222-2222-2222-222222222222','Youth'), ('33333333-3333-3333-3333-333333333333','Women')`);
await db.exec(`update mini_churches set department_id='22222222-2222-2222-2222-222222222222' where id='${g}'`);
await db.exec(`update mini_churches set department_id='33333333-3333-3333-3333-333333333333' where id='${g}'`);
check("moving a group to another department keeps its members", (await rows(db, `select count(*)::int c from mini_church_members where mini_church_id='${g}'`))[0].c === 3);
await db.exec(`delete from departments where id='33333333-3333-3333-3333-333333333333'`);
check("deleting a department keeps its groups (unassigned)", (await rows(db, `select department_id from mini_churches where id='${g}'`))[0].department_id === null);

// ---------- 4. a database created from an older schema (missing columns) is repaired ----------
db = await fresh();
await apply(db);
await db.exec(`
  alter table giving_settings drop column bank_account_name, drop column bank_branch;
  alter table site_settings drop column show_cta, drop column map_url, drop column primary_color;
  alter table blog_posts drop column author, drop column category;
  alter table mini_churches drop column department_id cascade, drop column meeting_day, drop column group_label;
  alter table leaders drop column category cascade;
  alter table live_service_settings drop column next_mode cascade, drop column force_live;
`);
err = await apply(db);
check("a database missing columns is repaired by the migrations", !err, err || "");
const fixed = (await rows(db, `select
  (select count(*) from information_schema.columns where table_name='giving_settings' and column_name='bank_account_name')::int a,
  (select count(*) from information_schema.columns where table_name='site_settings' and column_name in ('show_cta','map_url','primary_color'))::int b,
  (select count(*) from information_schema.columns where table_name='blog_posts' and column_name in ('author','category'))::int c,
  (select count(*) from information_schema.columns where table_name='leaders' and column_name='category')::int d,
  (select count(*) from information_schema.columns where table_name='mini_churches' and column_name in ('department_id','meeting_day','group_label'))::int e`))[0];
check("all dropped columns were restored", fixed.a === 1 && fixed.b === 3 && fixed.c === 2 && fixed.d === 1 && fixed.e === 3, JSON.stringify(fixed));

// ---------- 5. existing data is kept and backfilled ----------
db = await fresh();
await apply(db, files.filter((f) => f < "0003"));
await db.exec(`
  insert into leaders (name, position, department) values
   ('Rev. Dr. John Kimani','Senior Pastor','Overall Leadership'), ('Pst. Jane Kimani','Assistant Pastor','Pastoral Care'),
   ('Elder Sam','Church Elder',null), ('Youth Head','Head of Youth','Youth Ministry');
  insert into mini_churches (name, location, leader_name, contact_phone, meeting) values
   ('Kasarani Mini Church','Kasarani','Elder Peter','0700','Sundays · 9:00 AM'), ('Ruaka Mini Church','Ruaka',null,null,'Thursday 6:30 PM');
`);
err = await apply(db, files.filter((f) => f >= "0003"));
check("existing leaders and groups survive the upgrade", !err, err || "");
const lead = Object.fromEntries((await rows(db, `select name, category from leaders`)).map((x) => [x.name, x.category]));
check("existing leaders get a sensible tier (pastors, elder, 'Ministry' is not a mini-church)", lead["Rev. Dr. John Kimani"] === "pastoral_team" && lead["Pst. Jane Kimani"] === "pastoral_team" && lead["Elder Sam"] === "church_council" && lead["Youth Head"] === "departmental_heads", JSON.stringify(lead));
check("no leader was lost or duplicated", (await rows(db, `select count(*)::int c from leaders`))[0].c === 4);
const grp = Object.fromEntries((await rows(db, `select name, meeting_day, meeting_time::text t from mini_churches`)).map((x) => [x.name, x]));
check("old free-text meeting times become day and time", grp["Kasarani Mini Church"].meeting_day === "Sunday" && grp["Kasarani Mini Church"].t === "09:00:00" && grp["Ruaka Mini Church"].meeting_day === "Thursday" && grp["Ruaka Mini Church"].t === "18:30:00", JSON.stringify(grp));
const mem = await rows(db, `select full_name, role, phone from mini_church_members`);
check("old single leader names become leader records (once)", mem.length === 1 && mem[0].full_name === "Elder Peter" && mem[0].role === "leader" && mem[0].phone === "0700", JSON.stringify(mem));
err = await apply(db, files.filter((f) => f >= "0003"));
check("re-running does not duplicate backfilled leaders", (await rows(db, `select count(*)::int c from mini_church_members`))[0].c === 1);

console.log(failures ? `\n${failures} CHECK(S) FAILED` : "\nALL MIGRATION CHECKS PASSED");
process.exit(failures ? 1 : 0);
