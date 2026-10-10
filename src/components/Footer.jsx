import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSiteSettings } from "../data/content";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { SocialRow } from "./SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();
  const [s, setS] = useState(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);

  return (
    <footer className="bg-ink text-cream/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/logo-sm.png" width="48" height="48" decoding="async" alt="FGCK Christ Centre logo" className="h-12 w-12 rounded-full object-cover" />
            <span className="font-display text-xl font-extrabold text-cream">FGCK Christ Centre</span>
          </div>
          <p className="mt-4 text-sm text-cream/60">
            Power of the Gospel. Kingdom Image. Servanthood Leadership.
          </p>
          <SocialRow settings={s} tone="light" className="mt-5" />
        </div>

        <div>
          <p className="eyebrow text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/leadership" className="hover:text-gold">Leadership</Link></li>
            <li><Link to="/mini-churches" className="hover:text-gold">Mini-Churches</Link></li>
            <li><Link to="/service-sectors" className="hover:text-gold">Service Sectors</Link></li>
            <li><Link to="/sermons" className="hover:text-gold">Sermons</Link></li>
            <li><Link to="/blog" className="hover:text-gold">Christian Blogs</Link></li>
            <li><Link to="/events" className="hover:text-gold">Events</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">Connect</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li><Link to="/prayer" className="hover:text-gold">Prayer Requests</Link></li>
            <li><Link to="/giving" className="hover:text-gold">Give Online</Link></li>
            <li><Link to="/live" className="hover:text-gold">Live Service</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-gold">Visit</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0" /> {s?.address || "FGCK Christ Centre, Nairobi, Kenya"}</li>
            <li className="flex items-center gap-2"><Phone size={16} className="shrink-0" /> <a href={`tel:${(s?.phone || "").replace(/[^+\d]/g, "")}`} className="hover:text-gold">{s?.phone}</a></li>
            {s?.map_url && (
              <li>
                <a href={s.map_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2 text-xs font-bold text-cream hover:border-gold hover:text-gold">
                  <Navigation size={14} /> Get Directions
                </a>
              </li>
            )}
            <li className="flex items-center gap-2"><Mail size={16} className="shrink-0" /> {s?.email || "info@fgckchristcentre.org"}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/50">
        © {year} FGCK Christ Centre. All rights reserved.
      </div>
    </footer>
  );
}
