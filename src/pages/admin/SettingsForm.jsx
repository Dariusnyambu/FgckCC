import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { friendlyError, reportDbError } from "../../lib/errors";
import { clearContentCache } from "../../data/content";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import ImageUpload from "../../components/admin/ImageUpload";

/**
 * Generic editor for a single-row settings table (site_settings / giving_settings).
 * sections: [{ title, description, fields: [{ name, label, type, hint }] }]
 */
export default function SettingsForm({ title, description, table, defaults = {}, sections, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (isSupabaseConfigured) {
        const { data } = await supabase.from(table).select("*").eq("id", 1).maybeSingle();
        if (alive) return setForm({ ...defaults, ...Object.fromEntries(Object.entries(data || {}).filter(([, v]) => v !== null)) });
      }
      if (alive) setForm({ ...defaults });
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const onSave = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return setStatus({ ok: false, message: "Saving isn't available yet, the database connection hasn't been set up." });
    setSaving(true);
    setStatus(null);
    // Only the columns this page edits are sent, so a problem with an unrelated column cannot block saving.
    const payload = { id: 1 };
    sections.forEach((sec) => sec.fields.forEach((f) => { if (form[f.name] !== undefined) payload[f.name] = form[f.name]; }));
    const { error } = await supabase.from(table).upsert(payload);
    if (error) reportDbError(`save ${table}`, error);
    setSaving(false);
    if (error) return setStatus({ ok: false, message: friendlyError(error.message) });
    setStatus({ ok: true, message: "Saved, changes are live on the website." });
    clearContentCache();
    onSaved?.(payload);
  };

  if (!form) return <div className="flex items-center gap-2 py-12 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>;

  const input = "w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson";

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">{title}</p>
      {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}

      <form onSubmit={onSave} className="mt-6 space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <p className="font-display text-lg font-extrabold text-ink">{section.title}</p>
            {section.description && <p className="mt-1 text-sm text-ink/60">{section.description}</p>}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {section.fields.map((f) => (
                <div key={f.name} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
                  {f.type === "checkbox" ? (
                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink/80">
                      <input type="checkbox" checked={form[f.name] !== false && !!(form[f.name] ?? true)} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4 rounded border-ink/30" />
                      {f.label}
                    </label>
                  ) : (
                    <>
                      <label className="mb-1.5 block text-sm font-medium text-ink/70">{f.label}</label>
                      {f.type === "textarea" ? (
                        <textarea rows={f.rows || 4} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} className={input} />
                      ) : f.type === "image" ? (
                        <ImageUpload value={form[f.name]} onChange={(v) => set(f.name, v)} folder="site" />
                      ) : (
                        <input type={f.type || "text"} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} className={input} />
                      )}
                      {f.hint && <p className="mt-1 text-xs text-ink/50">{f.hint}</p>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="rounded-full bg-crimson px-7 py-3 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {status && <p className={`text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>{status.message}</p>}
        </div>
      </form>
    </div>
  );
}
