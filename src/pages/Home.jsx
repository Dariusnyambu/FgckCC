import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Gift, ArrowRight, MapPin, Layers, ClipboardList, Images } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import LeaderCard from "../components/LeaderCard";
import ServiceCountdown from "../components/ServiceCountdown";
import {
  getSiteSettings,
  getLeaders,
  getDepartments,
  getSermons,
  getEvents,
  getLiveServiceSettings,
} from "../data/content";

const QUICK_LINKS = [
  { to: "/departments", label: "Departments", icon: Layers },
  { to: "/mini-churches", label: "Mini Churches", icon: MapPin },
  { to: "/service-sectors", label: "Service Sectors", icon: ClipboardList },
  { to: "/gallery", label: "Gallery", icon: Images },
  { to: "/prayer", label: "Prayer", icon: HeartHandshake },
  { to: "/giving", label: "Giving", icon: Gift },
];

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [events, setEvents] = useState([]);
  const [liveConfig, setLiveConfig] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    getLeaders().then(setLeaders);
    getDepartments().then(setDepartments);
    getSermons().then(setSermons);
    getEvents().then(setEvents);
    getLiveServiceSettings().then(setLiveConfig);
  }, []);

  const show = (key) => settings?.[key] !== false;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="rays pointer-events-none absolute inset-0" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div className="relative">
            <div className="mb-5 flex items-center gap-3">
              <p className="eyebrow text-crimson">Welcome Home</p>
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              {settings?.hero_title || settings?.church_name || "FGCK Christ Centre"}
              <span className="block text-crimson">Light House</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/70">
              {settings?.hero_text ||
                "A place where the Power of the Gospel shapes the Kingdom Image in every believer through Servanthood Leadership. Come as you are. You belong here."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/live"
                className="rounded-full bg-crimson px-6 py-3 text-sm font-extrabold text-cream shadow-sm transition hover:bg-crimson-dark"
              >
                Join Us This Sunday
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-sm font-extrabold text-ink transition hover:border-crimson hover:text-crimson"
              >
                Our Story <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-ink/60">
              <MapPin size={16} className="text-crimson" /> {settings?.service_summary || "Sundays · 10:00 AM"}
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
              {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:text-crimson hover:ring-crimson/40"
                >
                  <Icon size={16} className="shrink-0 text-crimson" /> {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            {liveConfig && <ServiceCountdown config={liveConfig} />}
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      {show("show_about") && (
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Who We Are"
              title="A church family rooted in the gospel, grown in servanthood."
              description="FGCK Christ Centre exists to raise a community that reflects the image of God's Kingdom, through worship, discipleship and service to our city."
            />
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-crimson hover:text-crimson-dark">
              Read our full story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: HeartHandshake, label: "Pastoral Care", desc: "Walking with you through every season" },
              { icon: Gift, label: "Generosity", desc: "Giving that fuels Kingdom work" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
                <Icon className="text-crimson" size={28} />
                <p className="mt-4 font-display text-lg font-extrabold">{label}</p>
                <p className="mt-1 text-sm text-ink/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* LEADERSHIP PREVIEW */}
      {show("show_leadership") && (
        <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading eyebrow="Our Shepherds" title="Meet Our Leadership" align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {leaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/leadership" className="inline-flex items-center gap-2 text-sm font-extrabold text-crimson hover:text-crimson-dark">
              Meet the full team <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* DEPARTMENTS PREVIEW */}
      {show("show_departments") && (
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Get Involved" title="Departments & Ministries" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => (
            <div key={d.id} className="rounded-2xl border border-ink/10 p-6 transition hover:border-crimson/40 hover:shadow-sm">
              <p className="font-display text-lg font-extrabold text-ink">{d.name}</p>
              <p className="mt-2 text-sm text-ink/60">{d.description}</p>
              {d.meeting && <p className="mt-4 text-xs font-medium uppercase tracking-wide text-clay">{d.meeting}</p>}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/departments" className="inline-flex items-center gap-2 text-sm font-extrabold text-crimson hover:text-crimson-dark">
            View all departments <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      )}

      {/* SERMONS PREVIEW */}
      {show("show_sermons") && (
        <section className="bg-ink py-20 text-cream">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Latest Sermons" title="Recent Messages" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {sermons.map((s) => (
              <div key={s.id} className="rounded-2xl bg-cream/5 p-6 ring-1 ring-cream/10">
                <p className="eyebrow text-gold">{s.scripture}</p>
                <p className="mt-2 font-display text-xl font-extrabold">{s.title}</p>
                <p className="mt-1 text-sm text-cream/60">{s.speaker} · {s.date}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/sermons" className="inline-flex items-center gap-2 text-sm font-extrabold text-gold hover:text-gold-light">
              Browse all sermons <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* EVENTS PREVIEW */}
      {show("show_events") && (
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="What's On" title="Upcoming Events" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {events.map((e) => (
            <div key={e.id} className="flex gap-5 rounded-2xl border border-ink/10 p-6">
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-crimson text-cream">
                <span className="text-lg font-bold leading-none">{new Date(e.start_date).getDate()}</span>
                <span className="text-[10px] uppercase">{new Date(e.start_date).toLocaleString("en-US", { month: "short" })}</span>
              </div>
              <div>
                <p className="font-display text-lg font-extrabold text-ink">{e.title}</p>
                <p className="mt-1 text-sm text-ink/60">{e.description}</p>
                <p className="mt-2 text-xs font-medium text-clay">{e.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* PRAYER + GIVING CTA */}
      {show("show_cta") && (
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-gold/15 p-8">
            <HeartHandshake className="text-crimson" size={28} />
            <p className="mt-4 font-display text-2xl font-extrabold text-ink">Need Prayer?</p>
            <p className="mt-2 text-sm text-ink/70">Our prayer team is here for you. Submit a request in confidence.</p>
            <Link to="/prayer" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-crimson hover:text-crimson-dark">
              Request Prayer <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rounded-2xl bg-crimson p-8 text-cream">
            <Gift className="text-gold" size={28} />
            <p className="mt-4 font-display text-2xl font-extrabold">Give Online</p>
            <p className="mt-2 text-sm text-cream/80">Partner with us in Kingdom work through your tithe and offering.</p>
            <Link to="/giving" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-gold hover:text-gold-light">
              Give Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      )}
    </>
  );
}
