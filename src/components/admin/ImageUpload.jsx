import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadMedia } from "../../lib/storage";

// URL field with an Upload button, pastes a link or uploads to Supabase Storage.
export default function ImageUpload({ value, onChange, folder }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadMedia(file, folder));
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL or upload"
          className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson"
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-ink/15 px-3 text-sm font-semibold text-ink/70 hover:border-crimson hover:text-crimson disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Upload
        </button>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
      {error && <p className="mt-1 text-xs text-crimson">{error}</p>}
      {value && <img src={value} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover ring-1 ring-ink/10" />}
    </div>
  );
}
