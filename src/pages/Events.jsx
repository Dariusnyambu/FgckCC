import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { getEvents } from "../data/content";

export default function Events() {
  useSeo({ title: 'Events', description: 'Upcoming events, conferences and gatherings at FGCK Christ Centre.' });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="What's On" title="Upcoming Events" align="center" />
      <div className="mt-14 space-y-5">
        {events.map((e) => (
          <div key={e.id} className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-crimson text-cream">
              <span className="text-2xl font-bold leading-none">{new Date(e.start_date).getDate()}</span>
              <span className="text-xs uppercase">{new Date(e.start_date).toLocaleString("en-US", { month: "short" })}</span>
            </div>
            <div className="flex-1">
              <p className="font-display text-xl font-extrabold text-ink">{e.title}</p>
              <p className="mt-1 text-sm text-ink/70">{e.description}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-clay">
                <span className="flex items-center gap-1"><Clock size={14} /> {e.start_time}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {e.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
