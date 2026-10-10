import { Radio } from "lucide-react";
import { describeDays, groupSchedule } from "../lib/serviceSchedule";
import { formatTime } from "../lib/db";

/** The church's regular order of services. Streaming is only claimed for entries marked as streamed. */
export default function ServiceTimetable({ schedule, className = "" }) {
  const groups = groupSchedule(schedule);
  if (!groups.length) return null;
  const anyStreamed = groups.some((g) => g.is_streamed);

  return (
    <div className={className}>
      <p className="mb-3 text-sm text-ink/70">
        {anyStreamed
          ? "Services marked “Live online” are streamed on this website."
          : "Join us online for our worship services and prayer meetings. Check the schedule below for upcoming services and live-stream details."}
      </p>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
        <ul className="divide-y divide-ink/10">
          {groups.map((g) => (
            <li key={`${g.name}-${g.days.join("")}-${g.start_time}`} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-base font-extrabold text-ink">
                  {g.name}
                  {g.is_streamed && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-crimson/10 px-2 py-0.5 align-middle text-[11px] font-bold text-crimson">
                      <Radio size={11} /> Live online
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink/60">{describeDays(g)}</p>
              </div>
              <p className="text-sm font-bold text-clay sm:text-right">
                {formatTime(g.start_time)} to {formatTime(g.end_time)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
