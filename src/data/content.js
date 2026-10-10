import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { reportDbError } from "../lib/errors";
import { categoryIndex } from "./leadership";
import * as sample from "./sampleContent";

// All public reads go through this file.
// - When Supabase is configured, ONLY real database content is shown. A failed query is logged and
//   reported (never swallowed) and the page shows an empty state, not made-up sample content.
// - Local sample content is used only when Supabase is not configured (offline development).

// ---------- small cache (+ localStorage copy so the first paint is instant on repeat visits) ----------
const memory = new Map();
const LS = "fgck:cache:";

export function clearContentCache() {
  memory.clear();
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(LS)).forEach((k) => localStorage.removeItem(k));
  } catch { /* storage unavailable */ }
}

export function peek(key) {
  try {
    const raw = localStorage.getItem(LS + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cached(key, ttlMs, loader, persist = false) {
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise;
  const promise = loader().then((value) => {
    if (persist) {
      try { localStorage.setItem(LS + key, JSON.stringify(value)); } catch { /* ignore */ }
    }
    return value;
  });
  memory.set(key, { at: Date.now(), promise });
  promise.catch(() => memory.delete(key));
  return promise;
}

// ---------- generic table read ----------
async function fromTable(table, { order, ascending = true, filter } = {}) {
  if (!isSupabaseConfigured) return null;
  let query = supabase.from(table).select("*");
  if (filter) query = filter(query);
  if (order) query = query.order(order, { ascending });
  const { data, error } = await query;
  if (error) {
    reportDbError(`read ${table}`, error);
    return [];
  }
  return data;
}
const published = (q) => q.eq("published", true);

const dropNulls = (row) => Object.fromEntries(Object.entries(row || {}).filter(([, v]) => v !== null && v !== ""));

// ---------- site settings ----------
export function getSiteSettings() {
  return cached("site_settings", 60_000, async () => {
    if (!isSupabaseConfigured) return sample.siteSettings;
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) reportDbError("read site_settings", error);
    return { ...sample.siteSettings, ...dropNulls(data) };
  }, true);
}

export async function getGivingSettings() {
  if (!isSupabaseConfigured) return sample.givingSettings;
  const { data, error } = await supabase.from("giving_settings").select("*").eq("id", 1).maybeSingle();
  if (error) reportDbError("read giving_settings", error);
  return { ...sample.givingSettings, ...dropNulls(data) };
}

// ---------- people & ministries ----------
export async function getLeaders() {
  const data = await fromTable("leaders", { order: "order", filter: published });
  const rows = data ?? sample.leaders;
  return [...rows].sort((a, b) => categoryIndex(a.category) - categoryIndex(b.category) || (a.order ?? 0) - (b.order ?? 0));
}

export async function getDepartments() {
  return (await fromTable("departments", { order: "display_order", filter: published })) ?? sample.departments;
}

export async function getServiceSectors() {
  return (await fromTable("service_sectors", { order: "display_order", filter: published })) ?? sample.serviceSectors;
}

/** Mini-church groups with their leaders and member counts (member names stay private). */
export async function getMiniChurchGroups() {
  if (!isSupabaseConfigured) return sample.miniChurches;
  const [groups, leadersRes, countsRes] = await Promise.all([
    fromTable("mini_churches", { order: "display_order", filter: published }),
    supabase.from("mini_church_members").select("mini_church_id, full_name, phone, display_order").eq("role", "leader").order("display_order"),
    supabase.rpc("public_mini_church_member_counts"),
  ]);
  if (leadersRes.error) reportDbError("read mini_church_members", leadersRes.error);
  if (countsRes.error) reportDbError("rpc public_mini_church_member_counts", countsRes.error);
  const leaders = leadersRes.data || [];
  const counts = Object.fromEntries((countsRes.data || []).map((c) => [c.mini_church_id, c.member_count]));
  return groups.map((g) => {
    const own = leaders.filter((l) => l.mini_church_id === g.id);
    return {
      ...g,
      leaders: own.length ? own : g.leader_name ? [{ full_name: g.leader_name, phone: g.contact_phone }] : [],
      member_count: counts[g.id] ?? g.members_count ?? null,
    };
  });
}

// ---------- content ----------
export async function getSermons() {
  return (await fromTable("sermons", { order: "date", ascending: false, filter: published })) ?? sample.sermons;
}

export async function getEvents() {
  return (await fromTable("events", { order: "start_date", filter: published })) ?? sample.events;
}

export async function getGalleryAlbums() {
  return (await fromTable("gallery_albums", { order: "display_order", filter: published })) ?? sample.galleryAlbums;
}

// Blog posts have a status, not a "published" flag. Scheduled posts go public once their time has passed.
const visibleBlog = () => `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${new Date().toISOString()})`;

export async function getBlogPosts() {
  const data = await fromTable("blog_posts", {
    order: "published_at",
    ascending: false,
    filter: (q) => q.or(visibleBlog()),
  });
  return data ?? sample.blogPosts;
}

export async function getBlogPostBySlug(slug) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
    if (error) reportDbError("read blog post", error);
    return data ?? null;
  }
  return sample.blogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getBlogCategories() {
  return (await fromTable("blog_categories", { order: "name", filter: published })) ?? sample.blogCategories;
}

// ---------- services ----------
export function getLiveServiceSettings() {
  return cached("live_service", 30_000, async () => {
    if (!isSupabaseConfigured) return sample.liveServiceSettings;
    const { data, error } = await supabase.from("live_service_settings").select("*").eq("id", 1).maybeSingle();
    if (error) reportDbError("read live_service_settings", error);
    return { ...sample.liveServiceSettings, ...dropNulls(data) };
  }, true);
}

export function getServiceSchedule() {
  return cached("service_schedule", 30_000, async () => {
    if (!isSupabaseConfigured) return sample.serviceSchedule;
    const data = await fromTable("service_schedule", { order: "display_order", filter: (q) => q.eq("is_active", true) });
    return data;
  }, true);
}

// ---------- visitor submissions ----------
export async function submitPrayerRequest(payload) {
  if (!isSupabaseConfigured) return { ok: false, message: "Prayer requests will be enabled once the website is connected to its database." };
  const { error } = await supabase.from("prayer_requests").insert(payload);
  if (error) {
    reportDbError("submit prayer request", error);
    return { ok: false, message: "Sorry, we could not send this right now. Please try again in a moment." };
  }
  return { ok: true };
}

export async function submitContactMessage(payload) {
  if (!isSupabaseConfigured) return { ok: false, message: "The contact form will be enabled once the website is connected to its database." };
  const { error } = await supabase.from("contact_messages").insert(payload);
  if (error) {
    reportDbError("submit contact message", error);
    return { ok: false, message: "Sorry, we could not send your message right now. Please try again in a moment." };
  }
  return { ok: true };
}
