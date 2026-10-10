import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Info,
  Settings,
  Newspaper,
  Tags,
  PlayCircle,
  CalendarDays,
  Images,
  Users,
  Layers,
  MapPin,
  UsersRound,
  ClipboardList,
  Radio,
  HeartHandshake,
  Mail,
  Gift,
  FolderOpen,
  Share2,
  Search,
  ShieldCheck,
} from "lucide-react";

const GROUPS = [
  {
    label: "Website",
    items: [
      { to: "/admin/homepage", label: "Homepage", icon: Home },
      { to: "/admin/about", label: "About", icon: Info },
      { to: "/admin/settings", label: "Site Settings", icon: Settings },
      { to: "/admin/contact", label: "Contact & Location", icon: MapPin },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
      { to: "/admin/blog-categories", label: "Blog Categories", icon: Tags },
      { to: "/admin/sermons", label: "Sermons", icon: PlayCircle },
      { to: "/admin/events", label: "Events", icon: CalendarDays },
      { to: "/admin/gallery", label: "Gallery", icon: Images },
    ],
  },
  {
    label: "Church",
    items: [
      { to: "/admin/leadership", label: "Leadership", icon: Users },
      { to: "/admin/departments", label: "Departments", icon: Layers },
      { to: "/admin/mini-churches", label: "Mini-Church Groups", icon: UsersRound },
      { to: "/admin/service-sectors", label: "Service Sectors", icon: ClipboardList },
    ],
  },
  {
    label: "Live Service",
    items: [{ to: "/admin/live-service", label: "Live Service & Schedule", icon: Radio }],
  },
  {
    label: "Communication",
    items: [
      { to: "/admin/prayer-requests", label: "Prayer Requests", icon: HeartHandshake },
      { to: "/admin/messages", label: "Contact Messages", icon: Mail },
    ],
  },
  {
    label: "Giving",
    items: [{ to: "/admin/giving", label: "Giving Settings", icon: Gift }],
  },
  {
    label: "Media",
    items: [{ to: "/admin/media", label: "Media Library", icon: FolderOpen }],
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/social", label: "Social Media", icon: Share2 },
      { to: "/admin/seo", label: "SEO", icon: Search },
      { to: "/admin/users", label: "Admin Users", icon: ShieldCheck },
    ],
  },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
    {open && <div className="fixed inset-0 z-40 bg-ink/60 lg:hidden" onClick={onClose} />}
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 overflow-y-auto border-r border-cream/10 bg-ink px-4 py-6 text-cream transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <NavLink to="/admin" className="flex items-center gap-2 px-2 font-display text-lg font-extrabold">
        <img src="/images/favicon.png" alt="" className="h-8 w-8 rounded-full" /> Admin Panel
      </NavLink>

      <nav className="mt-8 space-y-6">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-cream/40">{group.label}</p>
            <div className="mt-2 space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                      isActive ? "bg-cream/10 text-gold" : "text-cream/70 hover:bg-cream/5 hover:text-cream"
                    }`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
    </>
  );
}
