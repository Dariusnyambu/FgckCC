import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { SocialRow } from "../components/SocialIcons";
import { getSiteSettings, submitContactMessage } from "../data/content";
import { useSeo } from "../lib/useSeo";

export default function Contact() {
  useSeo({
    title: "Contact Us",
    description: "Find FGCK Christ Centre in Clay City, Nairobi. Get directions, call us or send a message.",
  });
  const [s, setS] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { getSiteSettings().then(setS); }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await submitContactMessage(form);
    setStatus(result);
    setSubmitting(false);
    if (result.ok) setForm({ name: "", email: "", message: "" });
  };

  const tel = (s?.phone || "").replace(/[^+\d]/g, "");
  const input = "w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson";

  const items = [
    { Icon: MapPin, label: "Address", value: s?.address },
    { Icon: Phone, label: "Phone", value: s?.phone, href: `tel:${tel}` },
    { Icon: Mail, label: "Email", value: s?.email, href: `mailto:${s?.email}` },
    { Icon: Clock, label: "Service Hours", value: s?.office_hours || s?.service_summary },
  ].filter((i) => i.value);

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Reach Out" title="Contact Us" align="center" />

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {items.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-crimson">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-clay">{label}</p>
                {href ? (
                  <a href={href} className="mt-0.5 block text-sm font-medium text-ink/80 hover:text-crimson">{value}</a>
                ) : (
                  <p className="mt-0.5 text-sm text-ink/80">{value}</p>
                )}
              </div>
            </div>
          ))}

          {s?.map_url && (
            <a
              href={s.map_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-crimson px-6 py-3.5 text-sm font-bold text-cream transition hover:bg-crimson-dark"
            >
              <Navigation size={16} /> Get Directions
            </a>
          )}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <p className="text-xs font-bold uppercase tracking-wide text-clay">Follow Us</p>
            <SocialRow settings={s} className="mt-3" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Name</label>
            <input required value={form.name} onChange={update("name")} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Email</label>
            <input required type="email" value={form.email} onChange={update("email")} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Message</label>
            <textarea required rows={5} value={form.message} onChange={update("message")} className={input} />
          </div>
          <button type="submit" disabled={submitting} className="w-full rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream transition hover:bg-crimson-dark disabled:opacity-60">
            {submitting ? "Sending..." : "Send Message"}
          </button>
          {status && (
            <p className={`text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>
              {status.ok ? "Message sent. We'll be in touch soon." : status.message}
            </p>
          )}
        </form>
      </div>

      {s?.map_embed_url && (
        <div className="mt-10 overflow-hidden rounded-2xl shadow-sm ring-1 ring-ink/10">
          <iframe src={s.map_embed_url} title="Church location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[360px] w-full border-0 sm:h-[420px]" allowFullScreen />
        </div>
      )}
    </section>
  );
}
