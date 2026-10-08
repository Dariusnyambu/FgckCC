import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Loader2, Search, Copy, Trash2, FileText, Music, Film, Check } from "lucide-react";
import { friendlyError } from "../../lib/errors";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { uploadMedia, MEDIA_BUCKET } from "../../lib/storage";

const TYPES = [
  ["all", "All"],
  ["image", "Images"],
  ["video", "Videos"],
  ["audio", "Audio"],
  ["application", "Documents"],
];

const fmtSize = (b) => (!b ? "-" : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default function AdminMedia() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(null);
  const input = useRef(null);

  async function load() {
    if (!isSupabaseConfigured) return setLoading(false);
    setLoading(true);
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) setError(friendlyError(error.message));
    else setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const f of files) await uploadMedia(f, "library");
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
    e.target.value = "";
    load();
  };

  const remove = async (item) => {
    if (!confirm(`Delete "${item.file_name}"? Pages using it will show a broken file.`)) return;
    const marker = `/${MEDIA_BUCKET}/`;
    const path = item.file_url.split(marker)[1];
    if (path) await supabase.storage.from(MEDIA_BUCKET).remove([decodeURIComponent(path)]);
    const { error } = await supabase.from("media").delete().eq("id", item.id);
    if (error) setError(friendlyError(error.message));
    else setItems((r) => r.filter((x) => x.id !== item.id));
  };

  const copy = async (item) => {
    await navigator.clipboard?.writeText(item.file_url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const shown = useMemo(
    () =>
      items.filter((i) => {
        if (filter !== "all" && !(i.file_type || "").startsWith(filter)) return false;
        return !query.trim() || (i.file_name || "").toLowerCase().includes(query.trim().toLowerCase());
      }),
    [items, filter, query]
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-extrabold text-ink">Media Library</p>
          <p className="mt-1 text-sm text-ink/60">Upload once, reuse anywhere, copy a file's link into any page or post.</p>
        </div>
        <button
          onClick={() => (isSupabaseConfigured ? input.current?.click() : setError("Uploading isn't available yet, the database connection hasn't been set up."))}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload Files
        </button>
        <input ref={input} type="file" multiple accept="image/*,video/*,audio/*,application/pdf" className="hidden" onChange={onFiles} />
      </div>

      {error && <p className="mt-4 rounded-lg bg-crimson/10 px-4 py-2.5 text-sm text-crimson">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TYPES.map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${filter === k ? "bg-crimson text-cream" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-crimson"}`}>{l}</button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search files…" className="w-full rounded-full border border-ink/15 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-crimson" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>
      ) : shown.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white py-16 text-center text-sm text-ink/50 shadow-sm ring-1 ring-ink/5">
          {items.length === 0 ? "No files yet. Click “Upload Files” to add images, videos, audio or PDFs." : "No files match."}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((i) => {
            const t = i.file_type || "";
            const Icon = t.startsWith("video") ? Film : t.startsWith("audio") ? Music : FileText;
            return (
              <div key={i.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
                <div className="flex aspect-video items-center justify-center bg-ink/5">
                  {t.startsWith("image") ? <img src={i.file_url} alt={i.file_name} loading="lazy" className="h-full w-full object-cover" /> : <Icon size={34} className="text-ink/30" />}
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-bold text-ink" title={i.file_name}>{i.file_name}</p>
                  <p className="mt-0.5 text-xs text-ink/50">{(t.split("/")[1] || t || "file").toUpperCase()} · {fmtSize(i.file_size)} · {new Date(i.created_at).toLocaleDateString()}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => copy(i)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 py-1.5 text-xs font-bold text-ink/70 hover:border-crimson hover:text-crimson">
                      {copied === i.id ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy URL</>}
                    </button>
                    <button onClick={() => remove(i)} className="rounded-full border border-ink/15 px-3 text-ink/50 hover:border-crimson hover:text-crimson" aria-label="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
