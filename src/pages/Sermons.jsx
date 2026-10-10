import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import VideoPlayer from "../components/VideoPlayer";
import { getSermons } from "../data/content";
import { useSeo } from "../lib/useSeo";
import { sermonVideo } from "../lib/youtube";


export default function Sermons() {
  useSeo({
    title: "Sermons",
    description: "Watch and listen to recent sermons from FGCK Christ Centre, Light House. Messages on faith, the Kingdom and servanthood leadership.",
  });
  const [sermons, setSermons] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    getSermons().then(setSermons);
  }, []);

  const categories = useMemo(() => ["All", ...new Set(sermons.map((s) => s.category).filter(Boolean))], [sermons]);

  const filtered = useMemo(
    () =>
      sermons
        .filter((s) => category === "All" || s.category === category)
        .filter((s) => `${s.title} ${s.speaker} ${s.scripture} ${s.category}`.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured)),
    [sermons, query, category]
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="The Word" title="Sermons" description="Watch right here on the site. No need to leave the page." />
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

      {categories.length > 2 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${category === c ? "bg-crimson text-cream" : "bg-white text-ink/60 ring-1 ring-ink/10 hover:text-crimson"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <article key={s.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:shadow-md">
            <VideoPlayer url={sermonVideo(s)} title={s.title} thumbnail={sermonVideo(s) ? s.thumbnail_url : undefined} className="rounded-none" />
            <div className="p-5">
              {s.scripture && <p className="eyebrow text-crimson">{s.scripture}</p>}
              <h3 className="mt-1 font-display text-lg font-extrabold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{[s.speaker, s.date && new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })].filter(Boolean).join(" · ")}</p>
              {s.description && <p className="mt-2 line-clamp-2 text-sm text-ink/70">{s.description}</p>}
              {s.audio_url && <audio controls preload="none" src={s.audio_url} className="mt-3 w-full" />}
            </div>
          </article>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-ink/50">No sermons match your search.</p>}
      </div>
    </section>
  );
}
