import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { friendlyError, reportDbError } from "../../lib/errors";
import { pickColumns, toTimeInput, formatTime } from "../../lib/db";
import { clearContentCache } from "../../data/content";
import { departments as sampleDepartments } from "../../data/sampleContent";
import { DAY_NAMES } from "../../lib/serviceSchedule";

const NOT_CONNECTED = "Saving isn't available yet. The database connection hasn't been set up.";
const input = "w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson";
const lbl = "mb-1.5 block text-sm font-medium text-ink/70";
const WEEKDAYS = [...DAY_NAMES.slice(1), DAY_NAMES[0]];
const EMPTY = { name: "", group_label: "", department_id: "", meeting_day: "", meeting_time: "", description: "", display_order: "", published: true };

export default function AdminMiniChurches() {
  const [departments, setDepartments] = useState(isSupabaseConfigured ? [] : sampleDepartments);
  const [groups, setGroups] = useState([]);
  const [people, setPeople] = useState([]); // all members + leaders
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(null); // group id with members panel open
  const [bulk, setBulk] = useState(null);

  async function load() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const [d, g, m] = await Promise.all([
      supabase.from("departments").select("id,name,display_order").order("display_order").order("name"),
      supabase.from("mini_churches").select("*").order("display_order").order("name"),
      supabase.from("mini_church_members").select("*").order("role").order("display_order").order("full_name"),
    ]);
    for (const [name, r] of [["departments", d], ["mini_churches", g], ["mini_church_members", m]]) if (r.error) { reportDbError(`admin read ${name}`, r.error); setMsg({ ok: false, text: friendlyError(r.error.message) }); }
    setDepartments(d.data || []); setGroups(g.data || []); setPeople(m.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const fail = (where, error) => { reportDbError(where, error); setMsg({ ok: false, text: friendlyError(error.message) }); };
  const needsDb = () => { if (!isSupabaseConfigured) { setMsg({ ok: false, text: NOT_CONNECTED }); return true; } return false; };

  const sections = useMemo(() => {
    const list = departments.map((d) => ({ id: d.id, name: d.name, groups: groups.filter((g) => g.department_id === d.id) }));
    list.push({ id: "none", name: "Not assigned to a department", groups: groups.filter((g) => !departments.some((d) => d.id === g.department_id)) });
    return list.filter((s) => (filter === "all" ? s.groups.length || s.id !== "none" : s.id === filter));
  }, [departments, groups, filter]);

  function openNew(departmentId = "") { setForm({ ...EMPTY, department_id: departmentId }); setEditingId(null); setMsg(null); }
  function openEdit(g) {
    setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v ?? ""])), meeting_time: toTimeInput(g.meeting_time) });
    setEditingId(g.id); setMsg(null); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim()) return setMsg({ ok: false, text: "Enter the group name." });
    if (needsDb()) return;
    setSaving(true);
    // Changing department only updates department_id: the group, its leaders and members are untouched.
    const payload = pickColumns("mini_churches", {
      ...form, name: form.name.trim(), department_id: form.department_id || null,
      display_order: form.display_order === "" ? undefined : Number(form.display_order),
    }, { nullable: ["department_id", "group_label", "meeting_day", "meeting_time", "description"] });
    delete payload.id; delete payload.created_at;
    const { error } = editingId ? await supabase.from("mini_churches").update(payload).eq("id", editingId) : await supabase.from("mini_churches").insert(payload);
    setSaving(false);
    if (error) return fail("save mini_churches", error);
    clearContentCache(); setForm(null); setEditingId(null); setMsg({ ok: true, text: "Group saved." }); load();
  }

  async function remove(g) {
    if (needsDb()) return;
    const n = people.filter((p) => p.mini_church_id === g.id).length;
    if (!confirm(`Delete "${g.name}"${n ? ` and its ${n} listed members and leaders` : ""}? This cannot be undone.`)) return;
    const { error } = await supabase.from("mini_churches").delete().eq("id", g.id);
    if (error) return fail("delete mini_churches", error);
    clearContentCache(); load();
  }

  async function togglePublished(g) {
    if (needsDb()) return;
    const { error } = await supabase.from("mini_churches").update({ published: !g.published }).eq("id", g.id);
    if (error) return fail("update mini_churches", error);
    clearContentCache(); load();
  }

  async function createBulk(e) {
    e.preventDefault();
    if (needsDb()) return;
    const count = Math.min(Math.max(Number(bulk.count) || 0, 1), 26);
    const start = (bulk.start || "A").toUpperCase().charCodeAt(0) - 65;
    const rows = Array.from({ length: count }, (_, i) => {
      const label = `Group ${String.fromCharCode(65 + ((start + i) % 26))}`;
      return pickColumns("mini_churches", { name: label, group_label: label, department_id: bulk.department_id || null, published: true, display_order: i + 1 }, { nullable: ["department_id"] });
    });
    setSaving(true);
    const { error } = await supabase.from("mini_churches").insert(rows);
    setSaving(false);
    if (error) return fail("bulk create mini_churches", error);
    clearContentCache(); setBulk(null); setMsg({ ok: true, text: `${count} groups created.` }); load();
  }

  // ----- members and leaders -----
  async function addPeople(group, role, text) {
    if (needsDb()) return false;
    const names = text.split("\n").map((n) => n.trim()).filter(Boolean);
    if (!names.length) return false;
    const rows = names.map((full_name, i) => pickColumns("mini_church_members", { mini_church_id: group.id, full_name, role, display_order: i }));
    const { error } = await supabase.from("mini_church_members").insert(rows);
    if (error) { fail("add mini_church_members", error); return false; }
    clearContentCache(); load(); return true;
  }
  async function removePerson(p) {
    if (needsDb()) return;
    const { error } = await supabase.from("mini_church_members").delete().eq("id", p.id);
    if (error) return fail("delete mini_church_members", error);
    clearContentCache(); setPeople((list) => list.filter((x) => x.id !== p.id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-extrabold text-ink">Mini-Church Groups</p>
          <p className="mt-1 max-w-2xl text-sm text-ink/60">Groups of members organised under a department. Each group has its own leaders, members and meeting time.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBulk({ department_id: "", count: 5, start: "A" })} className="rounded-full border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink/70 hover:border-crimson hover:text-crimson">Create several groups</button>
          <button onClick={() => openNew()} className="flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark"><Plus size={16} /> Add group</button>
        </div>
      </div>

      {msg && <p className={`mt-4 rounded-lg px-4 py-2.5 text-sm ${msg.ok ? "bg-forest/10 text-forest" : "bg-crimson/10 text-crimson"}`}>{msg.text}</p>}

      {bulk && (
        <form onSubmit={createBulk} className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <div className="mb-3 flex items-center justify-between"><p className="font-display font-extrabold text-ink">Create several groups</p><button type="button" onClick={() => setBulk(null)} aria-label="Close"><X size={18} className="text-ink/40" /></button></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className={lbl}>Department</label><select value={bulk.department_id} onChange={(e) => setBulk({ ...bulk, department_id: e.target.value })} className={input}><option value="">Not assigned</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className={lbl}>How many (1 to 26)</label><input type="number" min="1" max="26" value={bulk.count} onChange={(e) => setBulk({ ...bulk, count: e.target.value })} className={input} /></div>
            <div><label className={lbl}>Starting letter</label><input maxLength={1} value={bulk.start} onChange={(e) => setBulk({ ...bulk, start: e.target.value })} className={input} /></div>
          </div>
          <p className="mt-2 text-xs text-ink/50">Creates “Group A”, “Group B”, … You can rename, move or edit each one afterwards.</p>
          <button disabled={saving} className="mt-4 rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream disabled:opacity-60">{saving ? "Creating…" : "Create groups"}</button>
        </form>
      )}

      {form && (
        <form onSubmit={save} className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5 sm:p-6">
          <div className="mb-4 flex items-center justify-between"><p className="font-display text-lg font-extrabold text-ink">{editingId ? "Edit group" : "New group"}</p><button type="button" onClick={() => setForm(null)} aria-label="Close"><X size={18} className="text-ink/40" /></button></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={lbl}>Group name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} placeholder="Open Hearts" /></div>
            <div><label className={lbl}>Group label</label><input value={form.group_label} onChange={(e) => setForm({ ...form, group_label: e.target.value })} className={input} placeholder="Group A" /></div>
            <div className="sm:col-span-2">
              <label className={lbl}>Department</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className={input}>
                <option value="">Not assigned to a department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {editingId && <p className="mt-1 text-xs text-ink/50">Moving a group to another department keeps its leaders and members.</p>}
            </div>
            <div><label className={lbl}>Meeting day</label><select value={form.meeting_day} onChange={(e) => setForm({ ...form, meeting_day: e.target.value })} className={input}><option value="">Not set</option>{WEEKDAYS.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div><label className={lbl}>Meeting time</label><input type="time" value={form.meeting_time} onChange={(e) => setForm({ ...form, meeting_time: e.target.value })} className={input} /></div>
            <div className="sm:col-span-2"><label className={lbl}>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} /></div>
            <div><label className={lbl}>Display order</label><input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className={input} /></div>
            <label className="flex items-end gap-2 pb-3 text-sm text-ink/80"><input type="checkbox" checked={!!form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="h-4 w-4" /> Published on the website</label>
          </div>
          <div className="mt-5 flex gap-3">
            <button disabled={saving} className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60">{saving ? "Saving…" : editingId ? "Save changes" : "Add group"}</button>
            <button type="button" onClick={() => setForm(null)} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-bold text-ink/60">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {[["all", "All departments"], ...departments.map((d) => [d.id, d.name]), ["none", "Not assigned"]].map(([id, name]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === id ? "bg-crimson text-cream" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-crimson"}`}>{name}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-14 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>
      ) : (
        <div className="mt-5 space-y-5">
          {sections.map((s) => (
            <section key={s.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
                <p className="font-display font-extrabold text-ink">{s.name} <span className="ml-1 text-xs font-bold text-clay">{s.groups.length} {s.groups.length === 1 ? "group" : "groups"}</span></p>
                {s.id !== "none" && <button onClick={() => openNew(s.id)} className="text-xs font-bold text-crimson hover:underline">+ Add group here</button>}
              </div>
              {s.groups.length === 0 ? (
                <p className="px-5 py-5 text-sm text-ink/50">No groups in this department yet.</p>
              ) : (
                <ul className="divide-y divide-ink/5">
                  {s.groups.map((g) => {
                    const mine = people.filter((p) => p.mini_church_id === g.id);
                    const leaders = mine.filter((p) => p.role === "leader");
                    const isOpen = open === g.id;
                    return (
                      <li key={g.id} className={g.published ? "" : "bg-ink/[0.02]"}>
                        <div className="flex flex-wrap items-center gap-3 px-5 py-3">
                          <UsersRound size={18} className="shrink-0 text-crimson" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-ink">{g.name} {g.group_label && g.group_label !== g.name && <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] text-clay">{g.group_label}</span>} {!g.published && <span className="ml-1 text-xs font-bold text-ink/40">Hidden</span>}</p>
                            <p className="text-xs text-ink/60">
                              {leaders.length ? `Leader${leaders.length > 1 ? "s" : ""}: ${leaders.map((l) => l.full_name).join(", ")}` : "No leader assigned"} · {mine.length} {mine.length === 1 ? "person" : "people"}
                              {g.meeting_day ? ` · ${g.meeting_day}s${g.meeting_time ? ", " + formatTime(g.meeting_time) : ""}` : g.meeting ? ` · ${g.meeting}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-ink/40">
                            <button onClick={() => setOpen(isOpen ? null : g.id)} className="flex items-center gap-1 text-xs font-bold text-crimson">Members {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                            <button onClick={() => togglePublished(g)} aria-label={g.published ? "Hide" : "Publish"} className="hover:text-crimson">{g.published ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                            <button onClick={() => openEdit(g)} aria-label="Edit" className="hover:text-crimson"><Pencil size={16} /></button>
                            <button onClick={() => remove(g)} aria-label="Delete" className="hover:text-crimson"><Trash2 size={16} /></button>
                          </div>
                        </div>
                        {isOpen && <MembersPanel group={g} people={mine} onAdd={addPeople} onRemove={removePerson} />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersPanel({ group, people, onAdd, onRemove }) {
  const [role, setRole] = useState("member");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    if (await onAdd(group, role, text)) setText("");
    setBusy(false);
  };
  return (
    <div className="border-t border-ink/5 bg-cream/60 px-5 py-4">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          {["leader", "member"].map((r) => (
            <div key={r} className="mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{r === "leader" ? "Leaders" : "Members"}</p>
              <ul className="mt-1 space-y-1">
                {people.filter((p) => p.role === r).map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-sm"><span>{p.full_name}{p.phone ? <span className="ml-2 text-xs text-ink/50">{p.phone}</span> : null}</span><button onClick={() => onRemove(p)} aria-label={`Remove ${p.full_name}`} className="text-ink/40 hover:text-crimson"><X size={14} /></button></li>
                ))}
                {!people.some((p) => p.role === r) && <li className="text-xs text-ink/40">None yet</li>}
              </ul>
            </div>
          ))}
        </div>
        <form onSubmit={submit}>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">Add people (one name per line)</p>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={`${input} mt-1`} placeholder={"Jane Wanjiru\nPeter Otieno"} />
          <div className="mt-2 flex items-center gap-3">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-xl border border-ink/15 px-3 py-2 text-sm"><option value="member">Members</option><option value="leader">Leaders</option></select>
            <button disabled={busy || !text.trim()} className="rounded-full bg-crimson px-5 py-2 text-sm font-bold text-cream disabled:opacity-50">{busy ? "Adding…" : "Add"}</button>
          </div>
          <p className="mt-2 text-xs text-ink/50">Only leaders are shown to the public. Member names stay private; visitors see just the member count.</p>
        </form>
      </div>
    </div>
  );
}
