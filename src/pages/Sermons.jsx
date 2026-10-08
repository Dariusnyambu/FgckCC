import { useEffect, useMemo, useState } from "react";
import { Search, PlayCircle } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { getSermons } from "../data/content";

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getSermons().then(setSermons);
  }, []);

  const filtered = useMemo(
    () =>
      sermons.filter((s) =>
        `${s.title} ${s.speaker} ${s.scripture}`.toLowerCase().includes(query.toLowerCase())
      ),
    [sermons, query]
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="The Word" title="Sermons" description="Catch up on recent messages." />
        <div className="relative sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sermons..."
            className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-crimson"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
            <div className="flex aspect-video items-center justify-center bg-ink text-cream/40">
              <PlayCircle size={40} />
            </div>
            <div className="p-5">
              <p className="eyebrow text-crimson">{s.scripture}</p>
              <p className="mt-1 font-display text-lg font-extrabold text-ink">{s.title}</p>
              <p className="mt-1 text-sm text-ink/60">{s.speaker} · {s.date}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-ink/50">No sermons match your search.</p>
        )}
      </div>
    </section>
  );
}
