import { supabase, isSupabaseConfigured } from "./supabaseClient";

export const MEDIA_BUCKET = "media";

// Uploads a file to the public "media" Supabase Storage bucket, records it in
// the `media` table (so it shows in the Media Library) and returns its URL.
export async function uploadMedia(file, folder = "uploads") {
  if (!isSupabaseConfigured) throw new Error("Database is not connected yet.");
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  await supabase.from("media").insert({
    file_url: data.publicUrl,
    file_type: file.type,
    file_name: file.name,
    file_size: file.size,
  });
  return data.publicUrl;
}
