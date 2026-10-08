import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import { getServiceSectors } from "../data/content";

export default function ServiceSectors() {
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    getServiceSectors().then(setSectors);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Serving Together"
        title="Service Sectors"
        description="The behind-the-scenes teams that keep FGCK Christ Centre running smoothly."
        align="center"
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((s) => (
          <div key={s.id} className="rounded-2xl border border-ink/10 bg-white p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-clay">
              <ClipboardList size={20} />
            </div>
            <p className="mt-4 font-display text-xl font-extrabold text-ink">{s.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.description}</p>
            <p className="mt-4 text-xs font-semibold text-ink/60">Coordinator: {s.coordinator_name}</p>
            {s.meeting && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-clay">{s.meeting}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
