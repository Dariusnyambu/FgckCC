import { useEffect, useState } from "react";
import { AlertCircle, Radio } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { getLiveServiceSettings } from "../../data/content";
import { getServiceOccurrence } from "../../lib/serviceSchedule";
import ServiceCountdown from "../../components/ServiceCountdown";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminLiveServiceSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getLiveServiceSettings().then(setForm);
  }, []);

  const update = (key) => (e) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setStatus({ ok: false, message: "Saving isn't available yet, the database connection hasn't been set up." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("live_service_settings").update(form).eq("id", 1);
    setSaving(false);
    setStatus(error ? { ok: false, message: error.message } : { ok: true, message: "Saved. The countdown recalculates automatically, nothing else to reset." });
  };

  if (!form) return null;

  const { status: liveStatus } = getServiceOccurrence(
    {
      day_of_week: form.day_of_week ?? 0,
      start_time: form.start_time ?? "10:00",
      end_time: form.end_time ?? "12:00",
      timezone: form.timezone ?? "Africa/Nairobi",
    },
    new Date()
  );

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">Live Service Settings</p>
      <p className="mt-1 text-sm text-ink/60">
        Set the recurring weekly schedule once, the public countdown and "Watch Live" button recalculate
        automatically every week. No manual reset needed.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={onSave} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Service Title</label>
            <input value={form.title || ""} onChange={update("title")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">Day of Week</label>
              <select
                value={form.day_of_week ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, day_of_week: Number(e.target.value) }))}
                className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson"
              >
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">Timezone</label>
              <input value={form.timezone || ""} onChange={update("timezone")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" placeholder="Africa/Nairobi" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">Start Time</label>
              <input type="time" value={form.start_time || ""} onChange={update("start_time")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">End Time</label>
              <input type="time" value={form.end_time || ""} onChange={update("end_time")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Streaming URL (embeddable)</label>
            <input value={form.streaming_url || ""} onChange={update("streaming_url")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" placeholder="https://..." />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">YouTube Live URL</label>
              <input value={form.youtube_url || ""} onChange={update("youtube_url")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/70">Facebook Live URL</label>
              <input value={form.facebook_url || ""} onChange={update("facebook_url")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">Description</label>
            <textarea rows={3} value={form.description || ""} onChange={update("description")} className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson" />
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="rounded-full bg-crimson px-6 py-3 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60">
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {status && <p className={`text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>{status.message}</p>}
          </div>
        </form>

        <aside>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink/50">
            <Radio size={14} /> Live Preview, currently {liveStatus}
          </p>
          <ServiceCountdown config={form} compact />
        </aside>
      </div>
    </div>
  );
}
