import { useEffect, useState } from "react";
import { Radio, Clock } from "lucide-react";
import { getServiceOccurrence, splitDuration } from "../lib/serviceSchedule";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ServiceCountdown({ config, compact = false }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const { start, status } = getServiceOccurrence(
    {
      day_of_week: config.day_of_week ?? 0,
      start_time: config.start_time ?? "10:00",
      end_time: config.end_time ?? "12:00",
      timezone: config.timezone ?? "Africa/Nairobi",
    },
    now
  );

  const { days, hours, minutes, seconds } = splitDuration(start - now);
  const dayLabel = DAY_NAMES[config.day_of_week ?? 0];

  if (status === "live") {
    return (
      <div className={`rounded-2xl bg-crimson text-cream shadow-lg ${compact ? "p-5" : "p-8"}`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <p className="eyebrow text-gold">We Are Live</p>
        </div>
        <p className="mt-2 font-display text-2xl font-extrabold">{config.title || "Sunday Worship Service"}</p>
        <p className="mt-1 text-sm text-cream/80">Tap in and worship with us right now.</p>
        <div className="mt-5">
          <a
            href="/live"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-extrabold text-ink transition hover:bg-gold-light"
          >
            <Radio size={16} /> Watch Live
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink text-cream shadow-lg ${compact ? "p-5" : "p-8"}`}>
      <div className="rays pointer-events-none absolute inset-0" />
      <div className="relative">
        <p className="eyebrow text-gold">Next Service Starts In</p>
        <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">
          {dayLabel} · {config.title || "Sunday Worship Service"}
        </p>

        <div className="mt-6 grid grid-cols-4 gap-3 text-center">
          {[
            ["Days", days],
            ["Hours", hours],
            ["Min", minutes],
            ["Sec", seconds],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-cream/10 py-3">
              <p className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">
                {String(value).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-cream/60">{label}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 flex items-center gap-2 text-xs text-cream/60">
          <Clock size={14} /> {config.start_time || "10:00"} · {config.timezone || "Africa/Nairobi"}
        </p>
      </div>
    </div>
  );
}
