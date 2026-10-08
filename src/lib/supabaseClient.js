import { createClient } from "@supabase/supabase-js";

// Public "anon" key only, this is safe for the frontend because Row Level
// Security policies (see /supabase/schema.sql) control what it can read or
// write. The service-role key must NEVER be used or imported here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    "[FGCK] Supabase env vars are not set, the site is running on local sample content. " +
      "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local to connect the CMS."
  );
}
