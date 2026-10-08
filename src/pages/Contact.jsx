import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { submitContactMessage } from "../data/content";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await submitContactMessage(form);
    setStatus(result);
    setSubmitting(false);
    if (result.ok) setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Reach Out" title="Contact Us" align="center" />

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            [MapPin, "Address", "FGCK Christ Centre, Nairobi, Kenya"],
            [Phone, "Phone", "+254 700 000 000"],
            [Mail, "Email", "info@fgckchristcentre.org"],
            [Clock, "Service Hours", "Sundays · 10:00 AM"],
          ].map(([Icon, label, value]) => (
            <div key={label} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-crimson">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-clay">{label}</p>
                <p className="mt-0.5 text-sm text-ink/80">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Name</label>
            <input required value={form.name} onChange={update("name")} className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Email</label>
            <input required type="email" value={form.email} onChange={update("email")} className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Message</label>
            <textarea required rows={5} value={form.message} onChange={update("message")} className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson" />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crimson-dark disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
          {status && (
            <p className={`text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>
              {status.ok ? "Message sent. We'll be in touch soon." : status.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
