import { useEffect, useState } from "react";
import { MapPin, Users } from "lucide-react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { getMiniChurches } from "../data/content";

export default function MiniChurches() {
  useSeo({ title: 'Mini Churches', description: 'FGCK Christ Centre mini churches serving neighbourhoods across Nairobi and beyond.' });
  const [miniChurches, setMiniChurches] = useState([]);

  useEffect(() => {
    getMiniChurches().then(setMiniChurches);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Extending the Family"
        title="Mini Churches"
        description="FGCK Christ Centre congregations serving neighbourhoods across the city."
        align="center"
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {miniChurches.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson/10 text-crimson">
              <MapPin size={20} />
            </div>
            <p className="mt-4 font-display text-xl font-extrabold text-ink">{m.name}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-clay">{m.location}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{m.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-ink/60">
              <span>Led by {m.leader_name}</span>
              {m.members_count && (
                <span className="flex items-center gap-1"><Users size={13} /> {m.members_count}</span>
              )}
            </div>
            {m.meeting && <p className="mt-2 text-xs font-semibold text-ink/50">{m.meeting}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
