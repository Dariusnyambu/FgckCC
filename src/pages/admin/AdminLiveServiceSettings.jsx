import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { friendlyError, reportDbError } from "../../lib/errors";
import { pickColumns, toTimeInput, formatTime } from "../../lib/db";
import { clearContentCache, getLiveServiceSettings } from "../../data/content";
import { serviceSchedule as sampleSchedule } from "../../data/sampleContent";
import { DAY_NAMES, DEFAULT_TZ, describeDays, findConflicts, recurrenceLabel, resolveNextService } from "../../lib/serviceSchedule";
import { youtubeId, youtubeThumb } from "../../lib/youtube";
import ServiceCountdown from "../../components/ServiceCountdown";
import ImageUpload from "../../components/admin/ImageUpload";

const NOT_CONNECTED = "Saving isn't available yet. The database connection hasn't been set up.";
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const WEEKS = [[1, "First"], [2, "Second"], [3, "Third"], [4, "Fourth"], [5, "Fifth"], [-1, "Last"]];
const input = "w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson";
const label = "mb-1.5 block text-sm font-medium text-ink/70";
const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6";

const EMPTY_ENTRY = { name: "", days: [], start_time: "18:00", end_time: "19:00", recurrence: "weekly", week_of_month: 3, is_streamed: false, stream_url: "", is_active: true, description: "", display_order: "" };

export default function AdminLiveServiceSettings() {
  const [settings, setSettings] = useState(null);
  const [schedule, setSchedule] = useState(isSupabaseConfigured ? [] : sampleSchedule);
  const [loadingSchedule, setLoadingSchedule] = useState(isSupabaseConfigured);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState(null); // null = form closed
  const [editingId, setEditingId] = useState(null);
  const [entrySaving, setEntrySaving] = useState(false);
  const [entryError, setEntryError] = useState(null);

  useEffect(() => { getLiveServiceSettings().then(setSettings); loadSchedule(); }, []);

  async function loadSchedule() {
    if (!isSupabaseConfigured) return;
    setLoadingSchedule(true);
    const { data, error } = await supabase.from("service_schedule").select("*").order("display_order").order("day_of_week").order("start_time");
    if (error) { reportDbError("admin service_schedule list", error); setMsg({ ok: false, text: friendlyError(error.message) }); }
    else setSchedule(data || []);
    setLoadingSchedule(false);
  }

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));
  const conflicts = useMemo(() => findConflicts(schedule), [schedule]);
  const preview = useMemo(() => (settings ? resolveNextService({ settings, schedule: schedule.filter((e) => e.is_active) }) : null), [settings, schedule]);

  // ---------- next service + streaming ----------
  async function saveSettings(e) {
    e.preventDefault();
    setMsg(null);
    if (settings.next_mode === "manual") {
      if (!settings.title?.trim()) return setMsg({ ok: false, text: "Enter a name for the one-off service." });
      if (!settings.service_date) return setMsg({ ok: false, text: "Choose the date of the one-off service." });
      if (!settings.start_time) return setMsg({ ok: false, text: "Choose the start time of the one-off service." });
      if (settings.end_time && toTimeInput(settings.end_time) <= toTimeInput(settings.start_time)) return setMsg({ ok: false, text: "The end time must be after the start time." });
    }
    if (!isSupabaseConfigured) return setMsg({ ok: false, text: NOT_CONNECTED });
    setSaving(true);
    const payload = {
      id: 1,
      ...pickColumns("live_service_settings", {
        ...settings,
        start_time: toTimeInput(settings.start_time),
        end_time: toTimeInput(settings.end_time),
      }, { nullable: ["service_date", "youtube_url", "facebook_url", "streaming_url", "thumbnail_url", "description"] }),
    };
    delete payload.status;
    const { error } = await supabase.from("live_service_settings").upsert(payload);
    setSaving(false);
    if (error) { reportDbError("save live_service_settings", error); return setMsg({ ok: false, text: friendlyError(error.message) }); }
    clearContentCache();
    setMsg({ ok: true, text: "Saved. The website now shows this next service. The weekly timetable was not changed." });
  }

  // ---------- timetable ----------
  function openNew() { setEntry({ ...EMPTY_ENTRY }); setEditingId(null); setEntryError(null); }
  function openEdit(row) {
    setEntry({ ...row, days: [row.day_of_week], start_time: toTimeInput(row.start_time), end_time: toTimeInput(row.end_time), stream_url: row.stream_url || "", description: row.description || "", week_of_month: row.week_of_month ?? 3, display_order: row.display_order ?? "" });
    setEditingId(row.id); setEntryError(null);
    window.scrollTo({ top: document.getElementById("timetable")?.offsetTop - 80 || 0, behavior: "smooth" });
  }

  async function saveEntry(e) {
    e.preventDefault();
    setEntryError(null);
    if (!entry.name.trim()) return setEntryError("Enter the service name.");
    if (!entry.days.length) return setEntryError("Choose at least one day.");
    if (!entry.start_time || !entry.end_time) return setEntryError("Enter the start and end time.");
    if (entry.end_time <= entry.start_time) return setEntryError("The end time must be after the start time.");
    if (!isSupabaseConfigured) return setEntryError(NOT_CONNECTED);
    setEntrySaving(true);
    const monthly = entry.recurrence === "monthly_nth";
    const base = pickColumns("service_schedule", {
      name: entry.name.trim(), start_time: entry.start_time, end_time: entry.end_time, recurrence: entry.recurrence,
      week_of_month: monthly ? Number(entry.week_of_month) : null, timezone: DEFAULT_TZ,
      is_streamed: !!entry.is_streamed, stream_url: entry.stream_url.trim(), description: entry.description.trim(),
      is_active: !!entry.is_active, display_order: entry.display_order === "" ? undefined : Number(entry.display_order),
    }, { nullable: ["week_of_month", "stream_url", "description"] });
    const { error } = editingId
      ? await supabase.from("service_schedule").update({ ...base, day_of_week: entry.days[0] }).eq("id", editingId)
      : await supabase.from("service_schedule").insert(entry.days.map((d) => ({ ...base, day_of_week: d })));
    setEntrySaving(false);
    if (error) { reportDbError("save service_schedule", error); return setEntryError(friendlyError(error.message)); }
    clearContentCache();
    setEntry(null); setEditingId(null);
    loadSchedule();
  }

  async function removeEntry(row) {
    if (!isSupabaseConfigured) return setMsg({ ok: false, text: NOT_CONNECTED });
    if (!confirm(`Remove "${row.name}" on ${DAY_NAMES[row.day_of_week]} from the weekly timetable?`)) return;
    const { error } = await supabase.from("service_schedule").delete().eq("id", row.id);
    if (error) { reportDbError("delete service_schedule", error); return setMsg({ ok: false, text: friendlyError(error.message) }); }
    clearContentCache(); loadSchedule();
  }

  async function toggle(row, field) {
    if (!isSupabaseConfigured) return setMsg({ ok: false, text: NOT_CONNECTED });
    const { error } = await supabase.from("service_schedule").update({ [field]: !row[field] }).eq("id", row.id);
    if (error) { reportDbError("update service_schedule", error); return setMsg({ ok: false, text: friendlyError(error.message) }); }
    clearContentCache(); loadSchedule();
  }

  if (!settings) return <div className="flex items-center gap-2 py-12 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>;

  const sortedSchedule = [...schedule].sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week) || String(a.start_time).localeCompare(String(b.start_time)));
  const yt = youtubeId(settings.youtube_url);

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">Live Service & Schedule</p>
      <p className="mt-1 text-sm text-ink/60">The <b>next service</b> and the <b>weekly timetable</b> are separate. Changing the next service never changes the timetable.</p>
      {msg && <p className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${msg.ok ? "bg-forest/10 text-forest" : "bg-crimson/10 text-crimson"}`}>{msg.text}</p>}

      {/* ---------- 1. Next service + streaming ---------- */}
      <form onSubmit={saveSettings} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className={card}>
            <p className="font-display text-lg font-extrabold text-ink">1. Next service</p>
            <div className="mt-4 space-y-3">
              {[["auto", "Automatic", "Use the soonest service in the weekly timetable below."], ["manual", "One-off service", "Announce a specific service or event, e.g. a special Thursday prayer meeting."]].map(([value, title, hint]) => (
                <label key={value} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${settings.next_mode === value ? "border-crimson bg-crimson/5" : "border-ink/15"}`}>
                  <input type="radio" name="next_mode" checked={settings.next_mode === value} onChange={() => set("next_mode", value)} className="mt-1" />
                  <span><span className="block text-sm font-bold text-ink">{title}</span><span className="text-xs text-ink/60">{hint}</span></span>
                </label>
              ))}
            </div>
            {settings.next_mode === "manual" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className={label}>Service or event name *</label><input value={settings.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Thursday Prayer Meeting" className={input} /></div>
                <div><label className={label}>Date *</label><input type="date" value={settings.service_date || ""} onChange={(e) => set("service_date", e.target.value)} className={input} /></div>
                <div><label className={label}>Time zone</label><input value={settings.timezone || DEFAULT_TZ} onChange={(e) => set("timezone", e.target.value)} className={input} /></div>
                <div><label className={label}>Start time *</label><input type="time" value={toTimeInput(settings.start_time)} onChange={(e) => set("start_time", e.target.value)} className={input} /></div>
                <div><label className={label}>End time</label><input type="time" value={toTimeInput(settings.end_time)} onChange={(e) => set("end_time", e.target.value)} className={input} /></div>
              </div>
            )}
          </section>

          <section className={card}>
            <p className="font-display text-lg font-extrabold text-ink">2. Streaming</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label}>YouTube link (live or recorded)</label>
                <input value={settings.youtube_url || ""} onChange={(e) => set("youtube_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={input} />
                <p className="mt-1 text-xs text-ink/50">Paste a video link (not a channel link). It plays on the site with its YouTube thumbnail.</p>
                {yt && <img src={youtubeThumb(yt)} alt="Thumbnail preview" className="mt-2 aspect-video w-full max-w-xs rounded-lg object-cover" />}
              </div>
              <div><label className={label}>Facebook live link</label><input value={settings.facebook_url || ""} onChange={(e) => set("facebook_url", e.target.value)} className={input} /></div>
              <div><label className={label}>Other embeddable stream link</label><input value={settings.streaming_url || ""} onChange={(e) => set("streaming_url", e.target.value)} className={input} /></div>
              <div className="sm:col-span-2"><label className={label}>Custom thumbnail (optional)</label><ImageUpload value={settings.thumbnail_url} onChange={(v) => set("thumbnail_url", v)} folder="live" /></div>
              <div className="sm:col-span-2"><label className={label}>Description</label><textarea rows={3} value={settings.description || ""} onChange={(e) => set("description", e.target.value)} className={input} /></div>
              <label className="flex items-start gap-2.5 text-sm text-ink/80 sm:col-span-2">
                <input type="checkbox" checked={!!settings.force_live} onChange={(e) => set("force_live", e.target.checked)} className="mt-0.5 h-4 w-4" />
                <span><b>Show as live right now.</b> Use only when a stream has started. Switch it off afterwards.</span>
              </label>
            </div>
          </section>
          <button type="submit" disabled={saving} className="rounded-full bg-crimson px-7 py-3 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60">{saving ? "Saving…" : "Save next service & streaming"}</button>
        </div>

        <aside>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink/50">Preview of what visitors see</p>
          <ServiceCountdown service={preview} compact />
        </aside>
      </form>

      {/* ---------- 3. Weekly timetable ---------- */}
      <section id="timetable" className={`${card} mt-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-extrabold text-ink">3. Weekly timetable</p>
            <p className="text-sm text-ink/60">The regular order of services. Times are Nairobi time.</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark"><Plus size={16} /> Add service</button>
        </div>

        {entry && (
          <form onSubmit={saveEntry} className="mt-5 rounded-xl border border-ink/10 bg-cream/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-extrabold text-ink">{editingId ? "Edit service" : "New service"}</p>
              <button type="button" onClick={() => setEntry(null)} aria-label="Close"><X size={18} className="text-ink/40" /></button>
            </div>
            {entryError && <p className="mb-4 rounded-lg bg-crimson/10 px-3 py-2 text-sm text-crimson">{entryError}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className={label}>Service name *</label><input value={entry.name} onChange={(e) => setEntry({ ...entry, name: e.target.value })} className={input} placeholder="Daily Prayers" /></div>
              <div className="sm:col-span-2">
                <label className={label}>{editingId ? "Day *" : "Days * (choose one or several; one entry is created per day)"}</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_ORDER.map((d) => {
                    const on = entry.days.includes(d);
                    return (
                      <button type="button" key={d} onClick={() => setEntry({ ...entry, days: editingId ? [d] : on ? entry.days.filter((x) => x !== d) : [...entry.days, d] })}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold ${on ? "bg-crimson text-cream" : "bg-white text-ink/60 ring-1 ring-ink/15"}`}>{DAY_NAMES[d].slice(0, 3)}</button>
                    );
                  })}
                </div>
              </div>
              <div><label className={label}>Start time *</label><input type="time" value={entry.start_time} onChange={(e) => setEntry({ ...entry, start_time: e.target.value })} className={input} /></div>
              <div><label className={label}>End time *</label><input type="time" value={entry.end_time} onChange={(e) => setEntry({ ...entry, end_time: e.target.value })} className={input} /></div>
              <div>
                <label className={label}>Repeats</label>
                <select value={entry.recurrence} onChange={(e) => setEntry({ ...entry, recurrence: e.target.value })} className={input}>
                  <option value="weekly">Every week</option>
                  <option value="monthly_nth">One week each month</option>
                </select>
              </div>
              {entry.recurrence === "monthly_nth" && (
                <div>
                  <label className={label}>Which week of the month</label>
                  <select value={entry.week_of_month} onChange={(e) => setEntry({ ...entry, week_of_month: e.target.value })} className={input}>
                    {WEEKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2"><label className={label}>Stream link for this service (optional)</label><input value={entry.stream_url} onChange={(e) => setEntry({ ...entry, stream_url: e.target.value })} className={input} placeholder="Leave empty to use the church-wide link above" /></div>
              <div className="flex flex-wrap gap-6 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entry.is_streamed} onChange={(e) => setEntry({ ...entry, is_streamed: e.target.checked })} className="h-4 w-4" /> This service is streamed online</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={entry.is_active} onChange={(e) => setEntry({ ...entry, is_active: e.target.checked })} className="h-4 w-4" /> Active (shown on the website)</label>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={entrySaving} className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60">{entrySaving ? "Saving…" : editingId ? "Save changes" : "Add to timetable"}</button>
              <button type="button" onClick={() => setEntry(null)} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-bold text-ink/60">Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-5 overflow-x-auto rounded-xl ring-1 ring-ink/10">
          {loadingSchedule ? (
            <div className="flex items-center justify-center gap-2 py-10 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>
          ) : sortedSchedule.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/50">No services yet. Click “Add service”.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/40">
                <tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Day</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Streamed</th><th className="px-4 py-3">Active</th><th /></tr>
              </thead>
              <tbody>
                {sortedSchedule.map((r) => (
                  <tr key={r.id} className={`border-b border-ink/5 last:border-0 ${r.is_active ? "" : "opacity-50"}`}>
                    <td className="px-4 py-3 font-bold text-ink">{r.name}</td>
                    <td className="px-4 py-3 text-ink/70">{r.recurrence === "monthly_nth" ? recurrenceLabel(r) : DAY_NAMES[r.day_of_week]}</td>
                    <td className="px-4 py-3 text-ink/70">{formatTime(r.start_time)} to {formatTime(r.end_time)}</td>
                    <td className="px-4 py-3"><input type="checkbox" checked={!!r.is_streamed} onChange={() => toggle(r, "is_streamed")} aria-label="Streamed" className="h-4 w-4" /></td>
                    <td className="px-4 py-3"><input type="checkbox" checked={!!r.is_active} onChange={() => toggle(r, "is_active")} aria-label="Active" className="h-4 w-4" /></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-3 text-ink/40">
                      <button onClick={() => openEdit(r)} aria-label="Edit" className="hover:text-crimson"><Pencil size={16} /></button>
                      <button onClick={() => removeEntry(r)} aria-label="Delete" className="hover:text-crimson"><Trash2 size={16} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {conflicts.length > 0 && (
          <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-ink/80">
            <p className="flex items-center gap-2 font-bold text-ink"><AlertTriangle size={16} className="text-clay" /> Overlapping times to review</p>
            <p className="mt-1 text-xs text-ink/60">These are shown for your information only. Nothing was changed or removed.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {conflicts.map(({ a, b, sometimes }, i) => (
                <li key={i}>
                  <b>{a.name}</b> ({formatTime(a.start_time)} to {formatTime(a.end_time)}) and <b>{b.name}</b> ({formatTime(b.start_time)} to {formatTime(b.end_time)}) on {DAY_NAMES[a.day_of_week]}
                  {sometimes ? ", on the weeks the monthly service happens" : ""}.
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
