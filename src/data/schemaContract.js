// Columns the frontend reads or writes for screens that are NOT driven by the config files
// (crudSections.js / settingsPages.js, which declare their own columns).
// scripts/schema-audit.mjs checks every entry here against supabase/migrations, so a column
// can no longer be used by the app without also existing in the database.
// Writers should send only these columns (see pickColumns in lib/db.js).

export const CONTRACT = {
  blog_posts: [
    "id", "title", "slug", "excerpt", "content", "cover_image", "category", "author", "status",
    "scheduled_at", "published_at", "reading_time", "created_at", "updated_at",
    "seo_title", "seo_description", "focus_keyword", "canonical_url", "og_title", "og_description", "og_image",
  ],
  live_service_settings: [
    "id", "title", "thumbnail_url", "streaming_url", "youtube_url", "facebook_url", "description",
    "next_mode", "service_date", "start_time", "end_time", "timezone", "status", "force_live",
  ],
  service_schedule: [
    "id", "name", "day_of_week", "start_time", "end_time", "recurrence", "week_of_month", "timezone",
    "is_streamed", "stream_url", "description", "display_order", "is_active",
  ],
  mini_churches: [
    "id", "name", "group_label", "department_id", "description", "meeting_day", "meeting_time", "meeting",
    "leader_name", "contact_phone", "members_count", "image_url", "display_order", "published", "created_at",
  ],
  mini_church_members: ["id", "mini_church_id", "full_name", "role", "phone", "display_order"],
  departments: ["id", "name", "description", "meeting_day", "meeting_time", "image_url", "display_order", "published"],
  leaders: [
    "id", "name", "position", "department", "category", "phone", "email", "bio", "image_url",
    "order", "published", "facebook_url", "instagram_url",
  ],
  service_sectors: ["id", "name", "description", "coordinator_name", "meeting", "display_order", "published"],
  sermons: ["id", "title", "speaker", "date", "scripture", "description", "thumbnail_url", "video_url", "audio_url", "youtube_url", "category", "featured", "published"],
  events: ["id", "title", "description", "start_date", "start_time", "location", "image_url", "featured", "published"],
  gallery_albums: ["id", "title", "category", "cover_image", "display_order", "published"],
  blog_categories: ["id", "name", "slug", "description", "image_url", "published"],
  prayer_requests: ["id", "name", "email", "phone", "message", "anonymous", "status", "created_at"],
  contact_messages: ["id", "name", "email", "message", "status", "created_at"],
  media: ["id", "file_url", "file_type", "file_name", "file_size", "created_at"],
  profiles: ["id", "full_name", "role", "created_at"],
  site_settings: [
    "id", "church_name", "tagline", "logo_url", "address", "phone", "email", "service_summary",
    "primary_color", "primary_color_dark", "primary_color_light", "secondary_color",
    "accent_color", "accent_color_dark", "accent_color_light", "navy_color", "navy_color_light", "background_color",
    "hero_title", "hero_text", "hero_image_url",
    "show_about", "show_leadership", "show_departments", "show_sermons", "show_events", "show_cta",
  ],
  giving_settings: ["id"],
};

// Database functions called with supabase.rpc()
export const RPC_FUNCTIONS = ["public_mini_church_member_counts"];
