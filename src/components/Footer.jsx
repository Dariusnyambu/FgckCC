import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSiteSettings } from "../data/content";
import { Share2, Video, Camera, MessageCircle, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [s, setS] = useState(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);
  const socials = [
    { Icon: Share2, label: "Facebook", href: s?.facebook_url },
    { Icon: Video, label: "YouTube", href: s?.youtube_url },
    { Icon: Camera, label: "Instagram", href: s?.instagram_url },
    { Icon: MessageCircle, label: "WhatsApp", href: s?.whatsapp_number ? `https://wa.me/${s.whatsapp_number}` : "" },
  ].filter((x) => x.href);
  return (
    <footer className="bg-ink text-cream/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="FGCK Christ Centre logo" className="h-12 w-12 rounded-full object-cover" />
            <span className="font-display text-xl font-extrabold text-cream">FGCK Christ Centre</span>
          </div>
          <p className="mt-4 text-sm text-cream/60">
            Power of the Gospel. Kingdom Image. Servanthood Leadership.
          </p>
          <div className="mt-5 flex gap-3">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-cream/20 p-2 text-cream/70 transition hover:border-gold hover:text-gold"
                aria-label={label}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/leadership" className="hover:text-gold">Leadership</Link></li>
            <li><Link to="/mini-churches" className="hover:text-gold">Mini Churches</Link></li>
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
            <li className="flex items-center gap-2"><Phone size={16} className="shrink-0" /> {s?.phone || "+254 700 000 000"}</li>
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
