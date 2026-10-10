import { Clock, Radio, Church } from "lucide-react";
import { Link } from "react-router-dom";
import { formatWhen, splitDuration } from "../lib/serviceSchedule";

/**
 * Shows the next service: a countdown, or "We are live" (streamed service in progress),
 * or "Service in progress" (running but not marked as streamed, so we make no live claim).
 * `service` comes from resolveNextService() via useServiceInfo().
 */
export default function ServiceCountdown({ service, now = new Date(), compact = false }) {
  const pad = compact ? "p-5" : "p-6 sm:p-8";

  if (!service) {
    // Reserve the space so the page does not jump when the data arrives.
    return <div className={`min-h-[230px] animate-pulse rounded-2xl bg-ink/90 ${pad}`} aria-hidden="true" />;
  }

  if (service.status === "none") {
    return (
      <div className={`rounded-2xl bg-ink text-cream shadow-lg ${pad}`}>
        <p className="eyebrow text-gold">Service Times</p>
        <p className="mt-2 font-display text-xl font-extrabold">Check the weekly schedule for upcoming services.</p>
      </div>
    );
  }

  if (service.status === "live") {
    return (
      <div className={`rounded-2xl bg-crimson text-cream shadow-lg ${pad}`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <p className="eyebrow text-gold">We Are Live</p>
        </div>
        <p className="mt-2 font-display text-2xl font-extrabold">{service.title}</p>
        <p className="mt-1 text-sm text-cream/80">Join the stream and worship with us right now.</p>
        <Link to="/live" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-gold-light">
          <Radio size={16} /> Watch Live
        </Link>
      </div>
    );
  }

  if (service.status === "in_session") {
    return (
      <div className={`rounded-2xl bg-navy-light text-cream shadow-lg ${pad}`}>
        <p className="eyebrow text-gold">In Session Now</p>
        <p className="mt-2 font-display text-2xl font-extrabold">{service.title}</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-cream/80">
          <Church size={15} /> {formatWhen(service.start, service.end)}
        </p>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = splitDuration(service.start - now);
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink text-cream shadow-lg ${pad}`}>
      <div className="rays pointer-events-none absolute inset-0" />
      <div className="relative">
        <p className="eyebrow text-gold">Next Service Starts In</p>
        <p className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{service.title}</p>
        <p className="mt-1 flex items-start gap-2 text-sm text-cream/70">
          <Clock size={15} className="mt-0.5 shrink-0" /> {formatWhen(service.start, service.end)}
        </p>
        <div className="mt-5 grid grid-cols-4 gap-3 text-center">
          {[["Days", days], ["Hours", hours], ["Min", minutes], ["Sec", seconds]].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-cream/10 py-3">
              <p className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{String(value).padStart(2, "0")}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-cream/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
