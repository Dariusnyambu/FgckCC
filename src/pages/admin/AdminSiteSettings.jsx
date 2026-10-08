import { useEffect, useState } from "react";
import { AlertCircle, Palette } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { getSiteSettings } from "../../data/content";
import { applyTheme } from "../../context/ThemeContext";
import ImageUpload from "../../components/admin/ImageUpload";

const COLOR_FIELDS = [
  ["primary_color", "Primary (Red)"],
  ["secondary_color", "Secondary (Orange)"],
  ["accent_color", "Accent (Gold)"],
  ["navy_color", "Navy"],
  ["background_color", "Background (White)"],
];

const CONTENT_FIELDS = [
  ["church_name", "Church Name"],
  ["tagline", "Tagline"],
  ["logo_url", "Logo URL"],
  ["service_summary", "Service Summary"],
  ["address", "Address"],
  ["phone", "Phone"],
  ["email", "Email"],
];

export default function AdminSiteSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setForm);
  }, []);

  const update = (key) => (e) => {
    const next = { ...form, [key]: e.target.value };
    setForm(next);
    // Live-preview color changes immediately as the admin edits them.
    if (key.endsWith("_color")) applyTheme({ [key]: e.target.value });
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setStatus({ ok: false, message: "Saving isn't available yet — the database connection hasn't been set up." });
      return;
    }
    setSaving(true);
    const keys = [...COLOR_FIELDS, ...CONTENT_FIELDS].map(([k]) => k).concat(["primary_color_dark", "primary_color_light", "accent_color_dark", "accent_color_light", "navy_color_light"]);
    const payload = Object.fromEntries(keys.map((k) => [k, form[k]]));
    const { error } = await supabase.from("site_settings").upsert({ ...payload, id: 1 });
    setSaving(false);
    setStatus(error ? { ok: false, message: error.message } : { ok: true, message: "Saved — changes are live on the public site." });
  };

  if (!form) return null;

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">Site Settings</p>
      <p className="mt-1 text-sm text-ink/60">
        Customize the site's colors, logo and contact details. Color changes preview instantly while you edit.
      </p>

      <form onSubmit={onSave} className="mt-6 space-y-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <p className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
            <Palette size={18} className="text-crimson" /> Theme Colors
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key] || "#000000"}
                    onChange={update(key)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-ink/15"
                  />
                  <input
                    type="text"
                    value={form[key] || ""}
                    onChange={update(key)}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2 text-sm outline-none focus:border-crimson"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <p className="font-display text-lg font-extrabold text-ink">Church Details</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {CONTENT_FIELDS.map(([key, label]) => (
              <div key={key} className={key === "logo_url" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">{label}</label>
                {key === "logo_url" ? (
                  <ImageUpload value={form[key]} onChange={(v) => setForm((f) => ({ ...f, logo_url: v }))} folder="site" />
                ) : (
                  <input
                    type="text"
                    value={form[key] || ""}
                    onChange={update(key)}
                    className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {status && (
            <p className={`text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>{status.message}</p>
          )}
        </div>
      </form>
    </div>
  );
}
