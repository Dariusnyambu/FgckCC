// Field definitions for the single-row settings screens (rendered by SettingsForm).
import { siteSettings as siteDefaults, givingSettings as givingDefaults } from "../../data/sampleContent";

export const SETTINGS_PAGES = [
  {
    path: "homepage",
    title: "Homepage",
    description: "Control the hero and decide which sections appear on the homepage.",
    table: "site_settings",
    defaults: siteDefaults,
    sections: [
      {
        title: "Hero",
        fields: [
          { name: "hero_title", label: "Hero Heading", hint: "Defaults to the church name." },
          { name: "service_summary", label: "Service Summary Line" },
          { name: "hero_text", label: "Hero Text", type: "textarea" },
          { name: "hero_image_url", label: "Hero Image", type: "image" },
        ],
      },
      {
        title: "Homepage Sections",
        description: "Untick a section to hide it from the homepage.",
        fields: [
          { name: "show_about", label: "Who We Are", type: "checkbox" },
          { name: "show_leadership", label: "Leadership preview", type: "checkbox" },
          { name: "show_departments", label: "Departments preview", type: "checkbox" },
          { name: "show_sermons", label: "Latest sermons", type: "checkbox" },
          { name: "show_events", label: "Upcoming events", type: "checkbox" },
          { name: "show_cta", label: "Prayer & Giving call-to-action", type: "checkbox" },
        ],
      },
    ],
  },
  {
    path: "about",
    title: "About Page",
    description: "Edit everything visitors read on the About page.",
    table: "site_settings",
    defaults: siteDefaults,
    sections: [
      {
        title: "Our Story",
        fields: [
          { name: "about_intro", label: "Introduction", type: "textarea", rows: 5 },
          { name: "about_history", label: "Church History", type: "textarea", rows: 6 },
        ],
      },
      {
        title: "Vision, Mission & Welcome",
        fields: [
          { name: "vision", label: "Vision", type: "textarea" },
          { name: "mission", label: "Mission", type: "textarea" },
          { name: "pastor_message", label: "Pastor's Welcome Message", type: "textarea", rows: 5 },
          { name: "core_values", label: "Core Values", type: "textarea", rows: 5, hint: "One per line, written as Title: description" },
          { name: "beliefs", label: "What We Believe", type: "textarea", rows: 6 },
        ],
      },
    ],
  },
  {
    path: "social",
    title: "Social Media",
    description: "Links shown in the website footer and contact page.",
    table: "site_settings",
    defaults: siteDefaults,
    sections: [
      {
        title: "Social Links",
        fields: [
          { name: "facebook_url", label: "Facebook" },
          { name: "youtube_url", label: "YouTube" },
          { name: "instagram_url", label: "Instagram" },
          { name: "twitter_url", label: "X / Twitter" },
          { name: "tiktok_url", label: "TikTok" },
          { name: "whatsapp_number", label: "WhatsApp Number", hint: "Digits only, e.g. 254700000000" },
        ],
      },
    ],
  },
  {
    path: "seo",
    title: "Website SEO",
    description: "How the church website appears in Google and when shared on social media.",
    table: "site_settings",
    defaults: siteDefaults,
    sections: [
      {
        title: "Search & Sharing",
        fields: [
          { name: "seo_title", label: "Site Title" },
          { name: "seo_keywords", label: "Keywords", hint: "Comma separated" },
          { name: "seo_description", label: "Meta Description", type: "textarea" },
          { name: "og_image", label: "Social Share Image", type: "image" },
        ],
      },
    ],
  },
  {
    path: "giving",
    title: "Giving Settings",
    description: "Everything shown on the public Giving page.",
    table: "giving_settings",
    defaults: givingDefaults,
    sections: [
      {
        title: "Giving Message",
        fields: [
          { name: "message", label: "Message", type: "textarea" },
          { name: "instructions", label: "Giving Instructions", type: "textarea" },
        ],
      },
      {
        title: "Mobile Money",
        fields: [
          { name: "mpesa_paybill", label: "M-Pesa Paybill" },
          { name: "mpesa_account", label: "Account Name / Number" },
          { name: "mpesa_till", label: "Buy Goods Till" },
        ],
      },
      {
        title: "Bank Transfer",
        fields: [
          { name: "bank_name", label: "Bank Name" },
          { name: "bank_account_name", label: "Account Name" },
          { name: "bank_account_number", label: "Account Number" },
          { name: "bank_branch", label: "Branch" },
        ],
      },
    ],
  },
];
