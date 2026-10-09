import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { submitPrayerRequest } from "../data/content";

export default function Prayer() {
  useSeo({ title: 'Prayer Requests', description: 'Submit a prayer request to the FGCK Christ Centre prayer team. Requests are handled in confidence.' });
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", anonymous: false });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await submitPrayerRequest({
      name: form.anonymous ? null : form.name,
      email: form.anonymous ? null : form.email,
      phone: form.anonymous ? null : form.phone,
      message: form.message,
      anonymous: form.anonymous,
    });
    setStatus(result);
    setSubmitting(false);
    if (result.ok) setForm({ name: "", email: "", phone: "", message: "", anonymous: false });
  };

  return (
    <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="We're Praying With You"
        title="Submit a Prayer Request"
        description="Your request is handled with care and confidentiality by our prayer team."
        align="center"
      />

      <form onSubmit={onSubmit} className="mt-12 space-y-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-ink/5">
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.anonymous} onChange={update("anonymous")} className="rounded border-ink/30" />
          Submit anonymously
        </label>

        {!form.anonymous && (
          <>
            <Field label="Full Name" value={form.name} onChange={update("name")} />
            <Field label="Email" type="email" value={form.email} onChange={update("email")} />
            <Field label="Phone (optional)" value={form.phone} onChange={update("phone")} required={false} />
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/70">Prayer Request</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={update("message")}
            className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-crimson px-6 py-3 text-sm font-semibold text-cream transition hover:bg-crimson-dark disabled:opacity-60"
        >
          <HeartHandshake size={16} /> {submitting ? "Sending..." : "Send Prayer Request"}
        </button>

        {status && (
          <p className={`text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>
            {status.ok ? "Your request has been received. We are praying with you." : status.message}
          </p>
        )}
      </form>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = true }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink/70">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson"
      />
    </div>
  );
}
