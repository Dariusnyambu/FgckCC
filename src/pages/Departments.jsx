import { useEffect, useState } from "react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { Users } from "lucide-react";
import { getDepartments } from "../data/content";

export default function Departments() {
  useSeo({ title: 'Departments and Ministries', description: 'Explore the departments and ministries at FGCK Christ Centre: youth, children, women, worship and more.' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <SectionHeading
        eyebrow="Get Involved"
        title="Departments & Ministries"
        description="Find a place to serve, grow and belong."
        align="center"
      />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <div key={d.id} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-crimson/10 text-crimson">
              <Users size={20} />
            </div>
            <p className="mt-4 font-display text-xl font-extrabold text-ink">{d.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{d.description}</p>
            {d.meeting && <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-clay">{d.meeting}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
