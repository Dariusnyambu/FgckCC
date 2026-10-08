import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, CalendarDays, Images, Users, Layers, PlayCircle, HeartHandshake, Mail, MapPin, ClipboardList, Plus } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { getBlogPosts, getEvents, getGalleryAlbums, getLeaders, getDepartments, getSermons, getMiniChurches, getServiceSectors, getLiveServiceSettings } from "../../data/content";
import ServiceCountdown from "../../components/ServiceCountdown";

async function count(table, filter) {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter[0], filter[1]);
  const { count: c } = await q;
  return c ?? 0;
}

const QUICK = [
  { to: "/admin/blogs/new", label: "Write a blog post" },
  { to: "/admin/events", label: "Add an event" },
  { to: "/admin/sermons", label: "Add a sermon" },
  { to: "/admin/gallery", label: "Create an album" },
];

export default function AdminDashboard() {
  const [c, setC] = useState(null);
  const [live, setLive] = useState(null);

  useEffect(() => {
    getLiveServiceSettings().then(setLive);
    (async () => {
      if (isSupabaseConfigured) {
        const [blogs, published, events, albums, leaders, departments, sermons, mini, sectors, prayers, messages] = await Promise.all([
          count("blog_posts"), count("blog_posts", ["status", "published"]), count("events"), count("gallery_albums"),
          count("leaders"), count("departments"), count("sermons"), count("mini_churches"), count("service_sectors"),
          count("prayer_requests", ["status", "new"]), count("contact_messages", ["status", "unread"]),
        ]);
        return setC({ blogs, published, events, albums, leaders, departments, sermons, mini, sectors, prayers, messages });
      }
      const [b, e, g, l, d, s, m, sv] = await Promise.all([getBlogPosts(), getEvents(), getGalleryAlbums(), getLeaders(), getDepartments(), getSermons(), getMiniChurches(), getServiceSectors()]);
      setC({ blogs: b.length, published: b.filter((x) => x.status === "published").length, events: e.length, albums: g.length, leaders: l.length, departments: d.length, sermons: s.length, mini: m.length, sectors: sv.length, prayers: 0, messages: 0 });
    })();
  }, []);

  const cards = [
    { label: "Blog Posts", value: c?.blogs, sub: c && `${c.published} published · ${c.blogs - c.published} draft`, icon: Newspaper, to: "/admin/blogs" },
    { label: "Sermons", value: c?.sermons, icon: PlayCircle, to: "/admin/sermons" },
    { label: "Events", value: c?.events, icon: CalendarDays, to: "/admin/events" },
    { label: "Gallery Albums", value: c?.albums, icon: Images, to: "/admin/gallery" },
    { label: "Leaders", value: c?.leaders, icon: Users, to: "/admin/leadership" },
    { label: "Departments", value: c?.departments, icon: Layers, to: "/admin/departments" },
    { label: "Mini Churches", value: c?.mini, icon: MapPin, to: "/admin/mini-churches" },
    { label: "Service Sectors", value: c?.sectors, icon: ClipboardList, to: "/admin/service-sectors" },
    { label: "New Prayer Requests", value: c?.prayers, icon: HeartHandshake, to: "/admin/prayer-requests", alert: c?.prayers > 0 },
    { label: "Unread Messages", value: c?.messages, icon: Mail, to: "/admin/messages", alert: c?.messages > 0 },
  ];

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">Dashboard</p>
      <p className="mt-1 text-sm text-ink/60">Welcome back — here's what's happening on your website.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, sub, icon: Icon, to, alert }) => (
          <Link key={label} to={to} className={`rounded-2xl bg-white p-5 shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${alert ? "ring-crimson/40" : "ring-ink/5"}`}>
            <Icon className="text-crimson" size={22} />
            <p className="mt-4 font-display text-3xl font-extrabold text-ink">{value ?? "…"}</p>
            <p className="mt-1 text-sm text-ink/60">{label}</p>
            {sub && <p className="mt-1 text-xs text-ink/40">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <p className="font-display text-lg font-extrabold text-ink">Quick actions</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUICK.map((q) => (
              <Link key={q.to} to={q.to} className="flex items-center gap-2 rounded-xl border border-ink/10 px-4 py-3 text-sm font-semibold text-ink/80 hover:border-crimson hover:text-crimson">
                <Plus size={16} className="text-crimson" /> {q.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50">Upcoming service</p>
          {live && <ServiceCountdown config={live} compact />}
        </div>
      </div>
    </div>
  );
}
