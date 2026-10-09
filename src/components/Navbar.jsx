import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Radio } from "lucide-react";
import { useLiveStatus } from "../lib/useLiveStatus";

// Primary header links, kept short so the header stays airy. Everything else
// is reachable from the hero quick-links on the homepage, the footer, and the
// full mobile menu.
const MAIN_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/leadership", label: "Leadership" },
  { to: "/sermons", label: "Sermons" },
  { to: "/live", label: "Live Service" },
  { to: "/events", label: "Events" },
  { to: "/blog", label: "Blogs" },
  { to: "/contact", label: "Contact" },
];

const MORE_LINKS = [
  { to: "/departments", label: "Departments" },
  { to: "/mini-churches", label: "Mini Churches" },
  { to: "/service-sectors", label: "Service Sectors" },
  { to: "/gallery", label: "Gallery" },
  { to: "/prayer", label: "Prayer" },
  { to: "/giving", label: "Giving" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLive } = useLiveStatus();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cta = (
    <NavLink
      to="/live"
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream shadow-sm transition hover:bg-crimson-dark"
    >
      {isLive ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          Watch Live
        </>
      ) : (
        <>
          <Radio size={15} className="shrink-0" /> Join Us This Sunday
        </>
      )}
    </NavLink>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/95 shadow-sm backdrop-blur" : "bg-cream/90 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4 lg:px-10">
        <NavLink to="/" className="flex shrink-0 items-center gap-3.5" onClick={() => setOpen(false)}>
          <img
            src="/images/logo.png"
            alt="FGCK Christ Centre logo"
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-ink/10"
          />
          <div className="leading-tight">
            <p className="whitespace-nowrap text-lg font-extrabold text-ink">FGCK Christ Centre</p>
            <p className="eyebrow text-clay">Light House</p>
          </div>
        </NavLink>

        <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">
          {MAIN_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-medium transition-colors hover:text-crimson ${
                  isActive ? "text-crimson" : "text-ink/80"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 xl:block">{cta}</div>

        <button
          className="rounded-md p-2 text-ink xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <nav className="max-h-[80vh] overflow-y-auto border-t border-ink/10 bg-cream px-6 pb-6 pt-3 xl:hidden">
          <div className="flex flex-col gap-1">
            {[...MAIN_LINKS, ...MORE_LINKS].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-base font-medium ${
                    isActive ? "bg-gold/15 text-crimson" : "text-ink/80"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex" onClick={() => setOpen(false)}>
              <div className="w-full [&>*]:flex [&>*]:w-full [&>*]:justify-center">{cta}</div>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
