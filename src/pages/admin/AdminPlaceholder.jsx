import { Hammer } from "lucide-react";

export default function AdminPlaceholder({ title, table }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">{title}</p>
      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/20 bg-white py-20 text-center">
        <Hammer className="text-ink/30" size={32} />
        <p className="mt-4 max-w-sm text-sm text-ink/60">
          Full create / edit / delete management for <span className="font-medium text-ink">{title}</span> wires up
          to the <code className="rounded bg-ink/5 px-1.5 py-0.5">{table}</code> table next. The public pages
          already read from this table via <code className="rounded bg-ink/5 px-1.5 py-0.5">src/data/content.js</code>,
          so once this admin form is built, changes here appear on the live site immediately.
        </p>
      </div>
    </div>
  );
}
