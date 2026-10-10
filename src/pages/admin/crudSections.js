// Configuration for every list-style admin screen (rendered by CrudManager).
// Mini-church groups have their own screen (AdminMiniChurches.jsx) because they need members and departments.
// `published: true` in emptyDefaults means new items are visible straight away.
import { LEADER_CATEGORY_OPTIONS } from "../../data/leadership.js";

const pub = { published: true };

export const CRUD_SECTIONS = [
  {
    path: "events", title: "Events", singular: "Event", table: "events", orderBy: "start_date", emptyDefaults: pub,
    columns: ["title", "start_date", "location"],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "location", label: "Location" },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "end_date", label: "End Date", type: "date" },
      { name: "start_time", label: "Start Time", type: "time" },
      { name: "organizer", label: "Organizer" },
      { name: "registration_link", label: "Registration Link" },
      { name: "contact_info", label: "Contact Information" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Event Image", type: "image" },
      { name: "featured", label: "Featured event", type: "checkbox" },
    ],
  },
  {
    path: "departments", title: "Departments", singular: "Department", table: "departments", orderBy: "display_order", orderAscending: true, emptyDefaults: pub,
    columns: ["name", "meeting_day", "meeting_time"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "URL Slug" },
      { name: "meeting_day", label: "Meeting Day" },
      { name: "meeting_time", label: "Meeting Time" },
      { name: "contact_email", label: "Contact Email", type: "email" },
      { name: "contact_phone", label: "Contact Phone" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Department Image", type: "image" },
    ],
  },
  {
    path: "service-sectors", title: "Service Sectors", singular: "Service Sector", table: "service_sectors", orderBy: "display_order", orderAscending: true, emptyDefaults: pub,
    columns: ["name", "coordinator_name", "meeting"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "coordinator_name", label: "Coordinator" },
      { name: "contact_phone", label: "Contact Phone" },
      { name: "meeting", label: "Meeting Time" },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    path: "sermons", title: "Sermons", singular: "Sermon", table: "sermons", orderBy: "date", emptyDefaults: pub,
    columns: ["title", "speaker", "date"],
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "speaker", label: "Speaker" },
      { name: "scripture", label: "Scripture" },
      { name: "date", label: "Date", type: "date" },
      { name: "category", label: "Category" },
      { name: "youtube_url", label: "YouTube Link", hint: "Paste the video link (youtube.com/watch, youtu.be or /live). It plays on the site with its own YouTube thumbnail." },
      { name: "video_url", label: "Video URL" },
      { name: "audio_url", label: "Audio URL" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "thumbnail_url", label: "Custom Thumbnail (optional)", type: "image", hint: "Leave empty to use the YouTube thumbnail automatically." },
      { name: "featured", label: "Featured sermon", type: "checkbox" },
    ],
  },
  {
    path: "gallery", title: "Gallery Albums", singular: "Album", table: "gallery_albums", orderBy: "display_order", orderAscending: true, emptyDefaults: pub,
    columns: ["title", "category", "display_order"],
    fields: [
      { name: "title", label: "Album Title", required: true },
      { name: "category", label: "Category", type: "select", options: ["Services", "Worship", "Conferences", "Youth", "Children", "Outreach", "Leadership", "Special Events"] },
      { name: "display_order", label: "Display Order", type: "number" },
      { name: "cover_image", label: "Cover Image", type: "image" },
    ],
  },
  {
    path: "leadership", title: "Leadership", singular: "Leader", table: "leaders", orderBy: "order", orderAscending: true, emptyDefaults: { ...pub, category: "pastoral_team" },
    columns: ["name", "position", "category", "order"],
    fields: [
      { name: "category", label: "Leadership tier", type: "select", options: LEADER_CATEGORY_OPTIONS, required: true, hint: "Decides where this person appears on the Leadership page." },
      { name: "name", label: "Full Name", required: true },
      { name: "position", label: "Position / Title", required: true },
      { name: "department", label: "Department, sector or group" },
      { name: "order", label: "Order within the tier", type: "number", hint: "1 appears first." },
      { name: "phone", label: "Phone" },
      { name: "email", label: "Email", type: "email" },
      { name: "facebook_url", label: "Facebook Link" },
      { name: "instagram_url", label: "Instagram Link" },
      { name: "bio", label: "Biography", type: "textarea" },
      { name: "image_url", label: "Profile Photo", type: "image" },
    ],
  },
  {
    path: "blog-categories", title: "Blog Categories", singular: "Category", table: "blog_categories", orderBy: "name", emptyDefaults: pub,
    columns: ["name", "slug"],
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "slug", label: "URL Slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_url", label: "Image", type: "image" },
    ],
  },
];
