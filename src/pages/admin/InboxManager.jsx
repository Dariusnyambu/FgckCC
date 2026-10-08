import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Trash2, Archive, CheckCheck, Mail, MailOpen, HeartHandshake, EyeOff } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";

/**
 * Inbox for visitor submissions (prayer requests / contact messages).
 * `statuses` – ordered list; first is the "new" state.
 * `actions` – [{ status, label, icon }] buttons that move an item to a status.
 */
export default function InboxManager({ title, table, statuses, actions, subtitle }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  async function load() {
    if (!isSupabaseConfigured) return setLoading(false);
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [table]);

  const setStatus = async (id, status) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (error) setError(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const remove = async (id) => {
    if (!confirm("Permanently delete this message? This cannot be undone.")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) setError(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  };

  const open = async (row) => {
    setOpenId(openId === row.id ? null : row.id);
    if (row.status === statuses[0]) setStatus(row.id, statuses[1]);
  };

  const counts = useMemo(() => {
    const c = { all: rows.length };
    statuses.forEach((s) => (c[s] = rows.filter((r) => r.status === s).length));
    return c;
  }, [rows, statuses]);

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${r.name || ""} ${r.email || ""} ${r.message || ""}`.toLowerCase().includes(q);
  });

  const label = (s) => s.replace(/_/g, " ");

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
      {error && <p className="mt-4 rounded-lg bg-crimson/10 px-4 py-2.5 text-sm text-crimson">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", ...statuses].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition ${filter === s ? "bg-crimson text-cream" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-crimson"}`}
            >
              {label(s)} ({counts[s] ?? 0})
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-full rounded-full border border-ink/15 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-crimson" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl bg-white py-14 text-center text-sm text-ink/50 shadow-sm ring-1 ring-ink/5">
            {rows.length === 0 ? "Nothing here yet. New submissions from the website will appear in this inbox." : "No items match this filter."}
          </p>
        ) : (
          filtered.map((r) => {
            const isNew = r.status === statuses[0];
            const expanded = openId === r.id;
            return (
              <div key={r.id} className={`rounded-2xl bg-white shadow-sm ring-1 ${isNew ? "ring-crimson/30" : "ring-ink/5"}`}>
                <button onClick={() => open(r)} className="flex w-full items-start gap-4 p-5 text-left">
                  <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isNew ? "bg-crimson/10 text-crimson" : "bg-ink/5 text-ink/40"}`}>
                    {table === "prayer_requests" ? <HeartHandshake size={17} /> : isNew ? <Mail size={17} /> : <MailOpen size={17} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink">{r.anonymous ? "Anonymous" : r.name || "Unknown"}</p>
                      <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-[11px] font-bold capitalize text-ink/60">{label(r.status)}</span>
                      <span className="ml-auto text-xs text-ink/40">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <p className={`mt-1 text-sm text-ink/70 ${expanded ? "whitespace-pre-line" : "line-clamp-2"}`}>{r.message}</p>
                  </div>
                </button>
                {expanded && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 px-5 py-3">
                    {!r.anonymous && (r.email || r.phone) && (
                      <p className="mr-auto text-xs text-ink/60">{[r.email, r.phone].filter(Boolean).join(" · ")}</p>
                    )}
                    <div className="ml-auto flex flex-wrap gap-2">
                      {actions.filter((a) => a.status !== r.status).map(({ status, label: l, icon: Icon }) => (
                        <button key={status} onClick={() => setStatus(r.id, status)} className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-bold text-ink/70 hover:border-crimson hover:text-crimson">
                          <Icon size={13} /> {l}
                        </button>
                      ))}
                      <button onClick={() => remove(r.id)} className="flex items-center gap-1.5 rounded-full border border-crimson/30 px-3.5 py-1.5 text-xs font-bold text-crimson hover:bg-crimson/10">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export const PRAYER_ACTIONS = [
  { status: "new", label: "Mark as new", icon: EyeOff },
  { status: "read", label: "Mark read", icon: MailOpen },
  { status: "prayed_for", label: "Prayed for", icon: CheckCheck },
  { status: "archived", label: "Archive", icon: Archive },
];
export const MESSAGE_ACTIONS = [
  { status: "unread", label: "Mark unread", icon: EyeOff },
  { status: "read", label: "Mark read", icon: CheckCheck },
  { status: "archived", label: "Archive", icon: Archive },
];
