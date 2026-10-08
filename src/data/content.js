import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import * as sample from "./sampleContent";

// Every function below tries Supabase first (once connected + populated by
// the admin dashboard) and quietly falls back to local sample content
// otherwise. Components never need to know which source they got — this is
// the single seam to swap when the backend is wired up.

async function fromTable(table, { order, filterPublished = true } = {}) {
  if (!isSupabaseConfigured) return null;
  let query = supabase.from(table).select("*");
  if (filterPublished) query = query.eq("published", true);
  if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
  const { data, error } = await query;
  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[FGCK] Failed to load "${table}" from Supabase:`, error.message);
    return null;
  }
  return data;
}

export async function getSiteSettings() {
  if (!isSupabaseConfigured) return sample.siteSettings;
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return sample.siteSettings;
  return { ...sample.siteSettings, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== "")) };
}

export async function getLeaders() {
  const data = await fromTable("leaders", { order: { column: "order" } });
  return data ?? sample.leaders;
}

export async function getDepartments() {
  const data = await fromTable("departments", { order: { column: "display_order" } });
  return data ?? sample.departments;
}

export async function getSermons() {
  const data = await fromTable("sermons", { order: { column: "date", ascending: false } });
  return data ?? sample.sermons;
}

export async function getEvents() {
  const data = await fromTable("events", { order: { column: "start_date" } });
  return data ?? sample.events;
}

export async function getBlogPosts() {
  const data = await fromTable("blog_posts", { order: { column: "published_at", ascending: false } });
  return data ?? sample.blogPosts;
}

export async function getBlogPostBySlug(slug) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).single();
    if (!error && data) return data;
  }
  return sample.blogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getBlogCategories() {
  const data = await fromTable("blog_categories");
  return data ?? sample.blogCategories;
}

export async function getMiniChurches() {
  const data = await fromTable("mini_churches", { order: { column: "display_order" } });
  return data ?? sample.miniChurches;
}

export async function getServiceSectors() {
  const data = await fromTable("service_sectors", { order: { column: "display_order" } });
  return data ?? sample.serviceSectors;
}

export async function getGalleryAlbums() {
  const data = await fromTable("gallery_albums", { order: { column: "display_order" } });
  return data ?? sample.galleryAlbums;
}

export async function getLiveServiceSettings() {
  if (!isSupabaseConfigured) return sample.liveServiceSettings;
  const { data, error } = await supabase.from("live_service_settings").select("*").single();
  if (error || !data) return sample.liveServiceSettings;
  return data;
}

export async function submitPrayerRequest(payload) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Prayer requests will be enabled once the CMS is connected." };
  }
  const { error } = await supabase.from("prayer_requests").insert(payload);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function submitContactMessage(payload) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "The contact form will be enabled once the CMS is connected." };
  }
  const { error } = await supabase.from("contact_messages").insert(payload);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function getGivingSettings() {
  if (!isSupabaseConfigured) return sample.givingSettings;
  const { data } = await supabase.from("giving_settings").select("*").eq("id", 1).maybeSingle();
  return { ...sample.givingSettings, ...(data || {}) };
}
