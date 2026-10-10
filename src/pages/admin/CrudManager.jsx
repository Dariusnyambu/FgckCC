import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Loader2, Search, X, Eye, EyeOff } from "lucide-react";
import { friendlyError, reportDbError } from "../../lib/errors";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import ImageUpload from "../../components/admin/ImageUpload";

function cellText(value, field) {
  if (value === null || value === undefined || value === "") return "-";
  const opt = field?.options?.find((o) => typeof o === "object" && o.value === value);
  return opt ? opt.label : String(value);
}

const NOT_CONNECTED = "Saving isn't available yet, the database connection hasn't been set up.";

/**
 * Full list / search / add / edit / delete / publish-toggle screen for one table.
 * fields: [{ name, label, type: text|textarea|date|time|number|checkbox|image|select, options, required }]
 */
export default function CrudManager({ title, singular, table, fields, columns, emptyDefaults = {}, orderBy = "created_at", orderAscending = false, hasPublished = true }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyDefaults);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  const noun = singular || title.replace(/s$/, "");
  const displayColumns = columns || fields.filter((f) => f.type !== "textarea" && f.type !== "image").slice(0, 3).map((f) => f.name);

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending: orderAscending });
    if (error) { reportDbError(`admin ${table} list`, error); setError(friendlyError(error.message)); }
    else setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => displayColumns.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query]);

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const openNew = () => {
    setForm(emptyDefaults);
    setEditingId(null);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (row) => {
    const values = { ...emptyDefaults };
    fields.forEach((f) => (values[f.name] = row[f.name] ?? (f.type === "checkbox" ? false : "")));
    if (hasPublished) values.published = row.published;
    setForm(values);
    setEditingId(row.id);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return setError(NOT_CONNECTED);
    setSaving(true);
    setError(null);
    // Blank number/text fields are left out on insert so database defaults apply (a blank "Display Order"
    // used to be sent as null and rejected by the NOT NULL column). On edit, cleared text fields become NULL.
    const numberFields = new Set(fields.filter((f) => f.type === "number").map((f) => f.name));
    const payload = {};
    for (const [k, v] of Object.entries(form)) {
      if (v === "" || v === null || v === undefined) {
        if (editingId && !numberFields.has(k)) payload[k] = null;
        continue;
      }
      payload[k] = v;
    }
    const { error } = editingId
      ? await supabase.from(table).update(payload).eq("id", editingId)
      : await supabase.from(table).insert(payload);
    setSaving(false);
    if (error) return setError(friendlyError(error.message));
    setShowForm(false);
    setEditingId(null);
    load();
  };

  const onDelete = async (id) => {
    if (!isSupabaseConfigured) return setError(NOT_CONNECTED);
    if (!confirm(`Delete this ${noun.toLowerCase()}? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(friendlyError(error.message));
    else load();
  };

  const togglePublished = async (row) => {
    if (!isSupabaseConfigured) return setError(NOT_CONNECTED);
    const { error } = await supabase.from(table).update({ published: !row.published }).eq("id", row.id);
    if (error) setError(friendlyError(error.message));
    else load();
  };

  const input = "w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-extrabold text-ink">{title}</p>
          <p className="mt-1 text-sm text-ink/60">{rows.length} total</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark">
          <Plus size={16} /> Add {noun}
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-crimson/10 px-4 py-2.5 text-sm text-crimson">{error}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <div className="mb-5 flex items-center justify-between">
            <p className="font-display text-lg font-extrabold text-ink">{editingId ? `Edit ${noun}` : `New ${noun}`}</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-ink/40 hover:text-ink" aria-label="Close"><X size={18} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-sm font-medium text-ink/70">
                  {f.label}{f.required && <span className="text-crimson"> *</span>}
                </label>
                {f.hint && <p className="-mt-1 mb-1.5 text-xs text-ink/50">{f.hint}</p>}
                {f.type === "textarea" ? (
                  <textarea required={f.required} rows={4} value={form[f.name] ?? ""} onChange={(e) => setField(f.name, e.target.value)} className={input} />
                ) : f.type === "checkbox" ? (
                  <input type="checkbox" checked={!!form[f.name]} onChange={(e) => setField(f.name, e.target.checked)} className="h-4 w-4 rounded border-ink/30" />
                ) : f.type === "image" ? (
                  <ImageUpload value={form[f.name]} onChange={(v) => setField(f.name, v)} folder={table} />
                ) : f.type === "select" ? (
                  <select required={f.required} value={form[f.name] ?? ""} onChange={(e) => setField(f.name, e.target.value)} className={input}>
                    <option value="">Select…</option>
                    {f.options.map((o) => { const v = typeof o === "object" ? o.value : o; const l = typeof o === "object" ? o.label : o; return <option key={v} value={v}>{l}</option>; })}
                  </select>
                ) : (
                  <input type={f.type || "text"} required={f.required} value={form[f.name] ?? ""} onChange={(e) => setField(f.name, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} className={input} />
                )}
              </div>
            ))}
            {hasPublished && (
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70 sm:col-span-2">
                <input type="checkbox" checked={!!form.published} onChange={(e) => setField("published", e.target.checked)} className="h-4 w-4 rounded border-ink/30" />
                Published (visible on the public website)
              </label>
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={saving} className="rounded-full bg-crimson px-6 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60">
              {saving ? "Saving…" : editingId ? "Save Changes" : `Add ${noun}`}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-bold text-ink/60 hover:text-ink">Cancel</button>
          </div>
        </form>
      )}

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-crimson" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>
        ) : filtered.length === 0 ? (
          <p className="py-14 text-center text-sm text-ink/50">
            {rows.length === 0 ? `No ${title.toLowerCase()} yet. Click “Add ${noun}” to create the first one.` : "Nothing matches your search."}
          </p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/40">
              <tr>
                {displayColumns.map((c) => <th key={c} className="px-5 py-3 font-semibold">{c.replace(/_/g, " ")}</th>)}
                {hasPublished && <th className="px-5 py-3 font-semibold">Status</th>}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-ink/5 last:border-0">
                  {displayColumns.map((c) => <td key={c} className="max-w-[260px] truncate px-5 py-3 text-ink/80">{cellText(row[c], fields.find((f) => f.name === c))}</td>)}
                  {hasPublished && (
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.published ? "bg-forest/10 text-forest" : "bg-ink/10 text-ink/50"}`}>
                        {row.published ? "Published" : "Hidden"}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3 text-ink/40">
                      {hasPublished && (
                        <button onClick={() => togglePublished(row)} className="hover:text-crimson" aria-label={row.published ? "Unpublish" : "Publish"} title={row.published ? "Unpublish" : "Publish"}>
                          {row.published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                      <button onClick={() => openEdit(row)} className="hover:text-crimson" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={() => onDelete(row.id)} className="hover:text-crimson" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
