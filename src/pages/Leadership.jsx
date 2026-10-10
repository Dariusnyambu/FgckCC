import { useEffect, useState } from "react";
import SectionHeading from "../components/SectionHeading";
import LeaderCard from "../components/LeaderCard";
import { getLeaders } from "../data/content";
import { LEADER_CATEGORIES } from "../data/leadership";
import { useSeo } from "../lib/useSeo";

export default function Leadership() {
  useSeo({ title: "Our Leadership", description: "Meet the Pastoral Team, Church Council, Departmental Heads, Service Sector Leaders and Mini-Church Leaders of FGCK Christ Centre." });
  const [leaders, setLeaders] = useState(null);
  useEffect(() => { getLeaders().then(setLeaders); }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <SectionHeading eyebrow="Servanthood Leadership" title="Our Leadership" description="How leadership is organised at FGCK Christ Centre, from the pastoral team to the mini-church groups." align="center" />

      <ol className="mt-10 space-y-10">
        {LEADER_CATEGORIES.map((cat, i) => {
          const people = (leaders || []).filter((l) => l.category === cat.value);
          const pastoral = i === 0;
          return (
            <li key={cat.value} className="relative sm:pl-16">
              {/* tier number + connecting line: shows the structure, not just a grouping */}
              <span className="absolute left-0 top-0 hidden h-11 w-11 items-center justify-center rounded-full bg-crimson text-sm font-extrabold text-cream sm:flex" aria-hidden="true">{i + 1}</span>
              {i < LEADER_CATEGORIES.length - 1 && <span className="absolute bottom-[-2.5rem] left-[1.35rem] top-12 hidden w-px bg-ink/15 sm:block" aria-hidden="true" />}

              <div data-reveal>
                <p className="eyebrow text-crimson sm:hidden">Tier {i + 1}</p>
                <h2 className="font-display text-2xl font-extrabold text-ink">{cat.label}</h2>
                <p className="mt-1 text-sm text-ink/60">{cat.blurb}</p>
              </div>

              {leaders === null ? null : people.length ? (
                <div className={`mt-5 grid gap-4 ${pastoral ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {people.map((l) => <LeaderCard key={l.id} leader={l} variant={pastoral ? "featured" : "compact"} />)}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-ink/15 px-4 py-3 text-sm text-ink/50">Leaders in this tier will be listed here soon.</p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
