#!/usr/bin/env node
// Schema audit: compares what the frontend expects with what supabase/migrations actually define.
//   node scripts/schema-audit.mjs            -> report (exit code 1 when something is missing)
//   node scripts/schema-audit.mjs --write    -> also (re)writes supabase/verify_schema.sql
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migDir = path.join(root, "supabase", "migrations");

// ---------- 1. What the migrations define ----------
const defined = {}; // table -> Set(columns)
const functions = new Set();
const strip = (s) => s.replace(/--.*$/gm, "");
const clean = (t) => t.replace(/^public\./, "").replace(/"/g, "");

for (const file of fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort()) {
  const sql = strip(fs.readFileSync(path.join(migDir, file), "utf8"));
  for (const m of sql.matchAll(/create table if not exists\s+([\w."]+)\s*\(([\s\S]*?)\n\);/gi)) {
    const table = clean(m[1]);
    defined[table] ??= new Set();
    let depth = 0, cur = "", parts = [];
    for (const ch of m[2]) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
    }
    parts.push(cur);
    for (const p of parts) {
      const word = p.trim().split(/\s+/)[0]?.replace(/"/g, "");
      if (word && !/^(constraint|primary|unique|check|foreign)$/i.test(word)) defined[table].add(word);
    }
  }
  for (const stmt of sql.split(";")) {
    const a = stmt.match(/alter table\s+(?:if exists\s+)?([\w."]+)/i);
    if (!a) continue;
    const table = clean(a[1]);
    defined[table] ??= new Set();
    for (const c of stmt.matchAll(/add column if not exists\s+"?(\w+)"?/gi)) defined[table].add(c[1]);
  }
  for (const f of sql.matchAll(/create (?:or replace )?function\s+(?:public\.)?(\w+)/gi)) functions.add(f[1]);
}

// ---------- 2. What the frontend expects ----------
const expected = {}; // table -> Map(column -> [sources])
const need = (table, col, src) => ((expected[table] ??= new Map()).get(col)?.push(src) ?? expected[table].set(col, [src]));

const { CRUD_SECTIONS } = await import(pathToFileURL(path.join(root, "src/pages/admin/crudSections.js")));
for (const s of CRUD_SECTIONS) {
  const src = `admin/${s.path} (crudSections.js)`;
  need(s.table, "id", src);
  s.fields.forEach((f) => need(s.table, f.name, src));
  (s.columns || []).forEach((c) => need(s.table, c, src));
  if (s.orderBy) need(s.table, s.orderBy, src);
  Object.keys(s.emptyDefaults || {}).forEach((c) => need(s.table, c, src));
  if (s.hasPublished !== false) need(s.table, "published", src);
}
const { SETTINGS_PAGES } = await import(pathToFileURL(path.join(root, "src/pages/admin/settingsPages.js")));
for (const p of SETTINGS_PAGES) {
  const src = `admin/${p.path} (settingsPages.js)`;
  need(p.table, "id", src);
  p.sections.forEach((sec) => sec.fields.forEach((f) => need(p.table, f.name, src)));
}
const { CONTRACT, RPC_FUNCTIONS } = await import(pathToFileURL(path.join(root, "src/data/schemaContract.js")));
for (const [table, cols] of Object.entries(CONTRACT)) cols.forEach((c) => need(table, c, "schemaContract.js"));

// ---------- 3. Compare ----------
let problems = 0;
const report = [];
for (const [table, cols] of Object.entries(expected).sort()) {
  if (!defined[table]) {
    report.push(`MISSING TABLE  ${table}  (used by: ${[...new Set([...cols.values()].flat())].slice(0, 3).join(", ")})`);
    problems++;
    continue;
  }
  const missing = [...cols.keys()].filter((c) => !defined[table].has(c));
  missing.forEach((c) => {
    report.push(`MISSING COLUMN ${table}.${c}  (used by: ${cols.get(c).join(", ")})`);
    problems++;
  });
}
for (const fn of RPC_FUNCTIONS) if (!functions.has(fn)) { report.push(`MISSING FUNCTION ${fn}`); problems++; }

const tablesUsed = Object.keys(expected).length;
const colsChecked = Object.values(expected).reduce((n, m) => n + m.size, 0);
console.log(`Schema audit: ${tablesUsed} tables, ${colsChecked} columns, ${RPC_FUNCTIONS.length} functions checked against supabase/migrations`);
if (report.length) { console.log("\n" + report.join("\n")); }
const unused = Object.keys(defined).filter((t) => !expected[t]).sort();
if (unused.length) console.log(`\nTables defined but not used by the frontend (kept, not an error): ${unused.join(", ")}`);
console.log(problems ? `\nRESULT: ${problems} problem(s) found` : "\nRESULT: OK, every column the frontend uses is defined by the migrations");

// ---------- 4. Verification SQL to run against the LIVE database ----------
if (process.argv.includes("--write")) {
  const rows = [];
  for (const [table, cols] of Object.entries(expected).sort()) for (const c of [...cols.keys()].sort()) rows.push(`    ('${table}', '${c}')`);
  const fnRows = RPC_FUNCTIONS.map((f) => `    ('${f}')`).join(",\n");
  const sql = `-- verify_schema.sql  (generated by scripts/schema-audit.mjs, do not edit by hand)
-- Run in the Supabase SQL Editor AFTER the migrations. Every result set should be EMPTY.
-- Anything listed is a column/table/function the website needs but your live database does not have.

-- 1) Missing columns or tables
with expected(table_name, column_name) as (values
${rows.join(",\n")}
)
select e.table_name, e.column_name, 'missing' as problem
from expected e
left join information_schema.columns c
  on c.table_schema = 'public' and c.table_name = e.table_name and c.column_name = e.column_name
where c.column_name is null
order by 1, 2;

-- 2) Missing functions
with expected(fn) as (values
${fnRows}
)
select e.fn as missing_function
from expected e
left join information_schema.routines r on r.routine_schema = 'public' and r.routine_name = e.fn
where r.routine_name is null;

-- 3) Tables that have Row Level Security switched OFF (should be empty)
select c.relname as table_without_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 4) Is your account an administrator? (should return one row for your email)
select u.email, p.role from auth.users u join public.profiles p on p.id = u.id;
`;
  fs.writeFileSync(path.join(root, "supabase", "verify_schema.sql"), sql);
  console.log("\nWrote supabase/verify_schema.sql");
}
process.exit(problems ? 1 : 0);
