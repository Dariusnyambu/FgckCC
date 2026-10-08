// Local sample content. This mirrors the shape of the Supabase tables in
// /supabase/schema.sql exactly, so once VITE_SUPABASE_URL / ANON_KEY are set
// and the admin dashboard is populated, the same components render real
// CMS content with zero changes.

export const siteSettings = {
  church_name: "FGCK Christ Centre",
  tagline: "Power of the Gospel · Kingdom Image · Servanthood Leadership",
  logo_url: "/images/logo.png",
  address: "FGCK Christ Centre, Light House, Nairobi, Kenya",
  phone: "+254 700 000 000",
  email: "info@fgckchristcentre.org",
  service_summary: "Sundays · 10:00 AM · In person & Live Stream",
  // Theme — editable from Admin → Site Settings. These are the defaults
  // baked into index.css; saving new values here overrides them live.
  primary_color: "#C62828",
  primary_color_dark: "#8E1C1C",
  primary_color_light: "#E2574A",
  secondary_color: "#E86A1C",
  accent_color: "#EFA80A",
  accent_color_dark: "#B87F06",
  accent_color_light: "#F7CB63",
  navy_color: "#0B1F3A",
  navy_color_light: "#15335C",
  background_color: "#FFFFFF",
  // About page content
  about_intro:
    "FGCK Christ Centre, known as Light House, is a community gathered around one conviction: the gospel changes everything. From our beginnings as a small fellowship, we've grown into a church family committed to worship, discipleship and servanthood leadership in our city and beyond.",
  about_history: "",
  vision: "A generation transformed by the gospel, reflecting God's Kingdom image everywhere they go.",
  mission: "To preach Christ, disciple believers and raise servant leaders for the Kingdom.",
  pastor_message: "Whoever you are, wherever you're from — you are welcome at Christ Centre.",
  core_values:
    "The Gospel: Christ crucified and risen is the center of everything we do.\nKingdom Image: Every believer reflects God's character in word and deed.\nServanthood Leadership: We lead by serving, following the example of Christ.\nFamily: The church is a family — we grow, grieve and celebrate together.",
  beliefs: "",
  facebook_url: "",
  youtube_url: "",
  instagram_url: "",
  twitter_url: "",
  tiktok_url: "",
  whatsapp_number: "",
};

export const givingSettings = {
  message: "Your tithes and offerings fuel ministry, outreach and Kingdom work at FGCK Christ Centre.",
  instructions: "",
  mpesa_paybill: "",
  mpesa_account: "",
  mpesa_till: "",
  bank_name: "",
  bank_account_name: "",
  bank_account_number: "",
  bank_branch: "",
};

export const leaders = [
  {
    id: "l1",
    name: "Rev. Dr. John Kimani",
    position: "Senior Pastor",
    department: "Overall Leadership",
    bio: "Rev. Dr. John Kimani leads FGCK Christ Centre with a heart for the gospel and a vision for raising servant leaders who carry the Kingdom image into every sphere of life.",
    image_url: "/images/pastor-john-kimani.jpg",
    order: 1,
    published: true,
  },
  {
    id: "l2",
    name: "Pst. Jane Kimani",
    position: "Assistant Pastor",
    department: "Pastoral Care",
    bio: "Pst. Jane Kimani walks alongside the congregation in discipleship, pastoral care and women's ministry, shepherding the church family with grace and wisdom.",
    image_url: "/images/pastor-jane-kimani.jpg",
    order: 2,
    published: true,
  },
];

export const departments = [
  {
    id: "d1",
    name: "Worship Ministry",
    description: "Leading the congregation into God's presence through music and creative arts.",
    image_url: null,
    meeting: "Thursdays · 6:00 PM",
    published: true,
  },
  {
    id: "d2",
    name: "Youth Ministry",
    description: "Discipling the next generation to walk boldly in faith.",
    image_url: null,
    meeting: "Saturdays · 2:00 PM",
    published: true,
  },
  {
    id: "d3",
    name: "Children's Ministry",
    description: "Nurturing children in the love and word of God.",
    image_url: null,
    meeting: "Sundays · During Service",
    published: true,
  },
  {
    id: "d4",
    name: "Women's Ministry",
    description: "Building women of faith, purpose and community.",
    image_url: null,
    meeting: "2nd Saturday · 10:00 AM",
    published: true,
  },
];

export const sermons = [
  {
    id: "s1",
    title: "Walking in the Kingdom Image",
    speaker: "Rev. Dr. John Kimani",
    date: "2026-07-27",
    scripture: "Genesis 1:26–28",
    thumbnail_url: null,
    youtube_url: "",
    featured: true,
  },
  {
    id: "s2",
    title: "Servanthood Leadership",
    speaker: "Pst. Jane Kimani",
    date: "2026-07-20",
    scripture: "Mark 10:42–45",
    thumbnail_url: null,
    youtube_url: "",
    featured: false,
  },
];

export const events = [
  {
    id: "e1",
    title: "Sunday Worship Service",
    description: "Join us for a Spirit-filled time of worship and the Word.",
    start_date: "2026-08-09",
    start_time: "10:00",
    location: "FGCK Christ Centre Main Sanctuary",
    featured: true,
  },
  {
    id: "e2",
    title: "Youth Conference 2026",
    description: "A weekend of worship, teaching and fellowship for the youth.",
    start_date: "2026-08-22",
    start_time: "09:00",
    location: "FGCK Christ Centre Grounds",
    featured: true,
  },
];

export const blogCategories = [
  { id: "c1", name: "Faith", slug: "faith" },
  { id: "c2", name: "Bible Study", slug: "bible-study" },
  { id: "c3", name: "Prayer", slug: "prayer" },
  { id: "c4", name: "Christian Living", slug: "christian-living" },
  { id: "c5", name: "Family", slug: "family" },
  { id: "c6", name: "Youth", slug: "youth" },
];

export const blogPosts = [
  {
    id: "b1",
    title: "How to Grow in Faith",
    slug: "how-to-grow-in-faith",
    excerpt: "Practical, Scripture-rooted steps for a deeper walk with God.",
    content:
      "<h2>Start with the Word</h2><p>Faith grows where the Word of God is planted daily. Begin each morning with a few verses rather than a chapter — consistency matters more than volume.</p><blockquote class=\"scripture-block\"><p>So then faith cometh by hearing, and hearing by the word of God.</p><cite>— Romans 10:17</cite></blockquote><h2>Build a Rhythm of Prayer</h2><p>Faith is sustained in conversation with God. Set a fixed time, even five minutes, and protect it.</p>",
    cover_image: null,
    category: "Faith",
    author: "Rev. Dr. John Kimani",
    status: "published",
    published_at: "2026-07-15",
    reading_time: 5,
  },
];

export const miniChurches = [
  {
    id: "m1",
    name: "Kasarani Mini Church",
    location: "Kasarani, Nairobi",
    leader_name: "Elder Peter Mwangi",
    meeting: "Sundays · 9:00 AM",
    members_count: 45,
    description: "A growing fellowship serving the Kasarani neighbourhood under FGCK Christ Centre.",
    published: true,
  },
  {
    id: "m2",
    name: "Ruaka Mini Church",
    location: "Ruaka, Kiambu",
    leader_name: "Elder Grace Wambui",
    meeting: "Sundays · 9:30 AM",
    members_count: 30,
    description: "A home-grown congregation extending the Christ Centre family into Ruaka.",
    published: true,
  },
];

export const serviceSectors = [
  {
    id: "sv1",
    name: "Ushering & Protocol",
    description: "Welcoming guests and coordinating order during services and events.",
    coordinator_name: "Deacon Samuel Otieno",
    meeting: "Fridays · 5:00 PM",
    published: true,
  },
  {
    id: "sv2",
    name: "Media & Technical",
    description: "Sound, livestream, lighting and visuals for every service.",
    coordinator_name: "Bro. Kevin Mutua",
    meeting: "Saturdays · 4:00 PM",
    published: true,
  },
  {
    id: "sv3",
    name: "Security & Logistics",
    description: "Safety, parking and logistics for services and church events.",
    coordinator_name: "Bro. Dennis Kiprop",
    meeting: "As scheduled",
    published: true,
  },
];

export const galleryAlbums = [
  { id: "g1", title: "Sunday Service", cover_image: null, image_count: 12 },
  { id: "g2", title: "Youth Activities", cover_image: null, image_count: 8 },
];

export const liveServiceSettings = {
  title: "Sunday Worship Service",
  day_of_week: 0, // 0 = Sunday
  start_time: "10:00",
  end_time: "12:30",
  timezone: "Africa/Nairobi",
  streaming_url: "",
  status: "scheduled",
};
