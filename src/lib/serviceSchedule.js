// Service schedule engine. Pure functions (no React) so they can be unit-tested.
//
// Two separate concepts:
//   * the WEEKLY TIMETABLE  - recurring entries ({day_of_week, start_time, end_time, recurrence, week_of_month, ...})
//   * the NEXT SERVICE      - the specific upcoming service. "auto" = soonest occurrence in the timetable,
//                             "manual" = a one-off event (service_date + times). It never edits the timetable.
//
// day_of_week: 0 = Sunday ... 6 = Saturday.  Times are wall-clock times in the entry's timezone (default Africa/Nairobi).
// recurrence 'weekly'       -> every week on that day
// recurrence 'monthly_nth'  -> only on the Nth (1..5) or last (-1) such weekday of each month, e.g. every third Wednesday.

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DEFAULT_TZ = "Africa/Nairobi";
const ORDINAL = { 1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth", [-1]: "last" };

// ---------- time zone helpers ----------
export function partsInZone(date, timeZone) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  const wk = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: +p.year, month: +p.month, day: +p.day,
    hour: p.hour === "24" ? 0 : +p.hour, minute: +p.minute, second: +p.second, weekday: wk[p.weekday],
  };
}

// Wall-clock time in an IANA zone -> the real instant (handles day overflow, e.g. day 32).
export function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const z = partsInZone(new Date(guess), timeZone);
  const asUtc = Date.UTC(z.year, z.month - 1, z.day, z.hour, z.minute, z.second);
  return new Date(guess - (asUtc - guess));
}

const hm = (t) => String(t || "00:00").split(":").map(Number);

// ---------- recurrence ----------
/** Does this calendar date (y, m, d) fall on one of the entry's occurrence days? */
export function matchesDate(entry, y, m, d) {
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (dow !== entry.day_of_week) return false;
  if (entry.recurrence !== "monthly_nth") return true;
  const n = entry.week_of_month;
  if (n === -1) return d + 7 > new Date(Date.UTC(y, m, 0)).getUTCDate(); // last such weekday of the month
  return Math.ceil(d / 7) === n;
}

/** All occurrences of one entry that have not finished yet and start within `horizonDays`. */
export function occurrencesOf(entry, now = new Date(), horizonDays = 75) {
  const zone = entry.timezone || DEFAULT_TZ;
  const today = partsInZone(now, zone);
  const [sh, sm] = hm(entry.start_time);
  const [eh, em] = hm(entry.end_time);
  const out = [];
  for (let i = 0; i <= horizonDays; i++) {
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + i));
    const y = day.getUTCFullYear(), m = day.getUTCMonth() + 1, d = day.getUTCDate();
    if (!matchesDate(entry, y, m, d)) continue;
    const start = zonedTimeToUtc(y, m, d, sh, sm, zone);
    const end = zonedTimeToUtc(y, m, d, eh, em, zone);
    if (end > now) out.push({ entry, start, end });
  }
  return out;
}

export function upcomingOccurrences(schedule, now = new Date(), horizonDays = 75) {
  return (schedule || [])
    .filter((e) => e.is_active !== false)
    .flatMap((e) => occurrencesOf(e, now, horizonDays))
    .sort((a, b) => a.start - b.start || (a.entry.display_order ?? 0) - (b.entry.display_order ?? 0));
}

// ---------- next service ----------
const hasStreamLink = (s) => !!(s?.youtube_url || s?.streaming_url || s?.facebook_url);

/**
 * Decide what the website calls "the next service".
 * status: 'live'       in progress AND streamed (or the admin forced live)
 *         'in_session' in progress but not marked as streamed - we do not claim a live stream
 *         'upcoming'   starts later
 *         'none'       nothing scheduled
 */
export function resolveNextService({ settings, schedule, now = new Date() }) {
  const s = settings || {};
  const zone = s.timezone || DEFAULT_TZ;
  const globalStream = s.youtube_url || s.streaming_url || s.facebook_url || "";
  let pick = null; // { start, end, title, source, entry, streamUrl, streamed }

  if (s.next_mode === "manual" && s.service_date) {
    const [y, m, d] = String(s.service_date).slice(0, 10).split("-").map(Number);
    const [sh, sm] = hm(s.start_time);
    const [eh, em] = hm(s.end_time || s.start_time);
    const start = zonedTimeToUtc(y, m, d, sh, sm, zone);
    let end = zonedTimeToUtc(y, m, d, eh, em, zone);
    if (end <= start) end = new Date(start.getTime() + 2 * 3600 * 1000);
    if (end > now) {
      pick = { start, end, title: s.title || "Next service", source: "manual", entry: null, streamUrl: globalStream, streamed: hasStreamLink(s) };
    }
  }

  if (!pick) {
    const list = upcomingOccurrences(schedule, now);
    // Prefer something already in progress that is streamed, then anything in progress, then the soonest.
    const inProgress = list.filter((o) => o.start <= now);
    const chosen = inProgress.find((o) => o.entry.is_streamed) || inProgress[0] || list[0];
    if (chosen) {
      pick = {
        start: chosen.start, end: chosen.end, title: chosen.entry.name, source: "schedule", entry: chosen.entry,
        streamUrl: chosen.entry.stream_url || globalStream, streamed: !!chosen.entry.is_streamed,
      };
    }
  }

  if (!pick) return { status: "none", title: "", start: null, end: null, source: null, streamUrl: globalStream, entry: null, streamed: false };

  const inProgress = pick.start <= now && now < pick.end;
  let status = "upcoming";
  if (inProgress) status = pick.streamed || s.force_live ? "live" : "in_session";
  else if (s.force_live) status = "live";
  return { ...pick, status };
}

export function splitDuration(ms) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(t / 86400), hours: Math.floor((t % 86400) / 3600), minutes: Math.floor((t % 3600) / 60), seconds: t % 60 };
}

// ---------- display helpers ----------
export function formatWhen(start, end, timeZone = DEFAULT_TZ) {
  if (!start) return "";
  const date = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(start);
  const time = (d) => new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  return `${date}, ${time(start)}${end ? ` to ${time(end)}` : ""} (EAT)`;
}

export function recurrenceLabel(entry) {
  if (entry.recurrence === "monthly_nth") return `Every ${ORDINAL[entry.week_of_month]} ${DAY_NAMES[entry.day_of_week]} of the month`;
  return `Every ${DAY_NAMES[entry.day_of_week]}`;
}

const dayRank = (d) => (d === 0 ? 7 : d); // show Monday first, Sunday last

/** Public timetable: identical entries on several days (Daily Prayers Mon-Fri) are shown as one row. */
export function groupSchedule(schedule) {
  const map = new Map();
  for (const e of [...(schedule || [])].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))) {
    const key = [e.name, e.start_time, e.end_time, e.recurrence, e.week_of_month, e.is_streamed, e.stream_url].join("|");
    if (!map.has(key)) map.set(key, { ...e, days: [] });
    map.get(key).days.push(e.day_of_week);
  }
  return [...map.values()]
    .map((g) => ({ ...g, days: g.days.sort((a, b) => dayRank(a) - dayRank(b)) }))
    .sort((a, b) => dayRank(a.days[0]) - dayRank(b.days[0]) || String(a.start_time).localeCompare(String(b.start_time)));
}

export function describeDays(group) {
  const days = group.days;
  if (group.recurrence === "monthly_nth") return `${ORDINAL[group.week_of_month][0].toUpperCase()}${ORDINAL[group.week_of_month].slice(1)} ${DAY_NAMES[days[0]]} of the month`;
  if (days.length === 1) return DAY_NAMES[days[0]];
  const consecutive = days.every((d, i) => i === 0 || dayRank(d) === dayRank(days[i - 1]) + 1);
  if (consecutive && days.length > 2) return `${DAY_NAMES[days[0]]} to ${DAY_NAMES[days[days.length - 1]]}`;
  return days.map((d) => DAY_NAMES[d]).join(", ");
}

/** Pairs of active entries whose times overlap on the same day. Reported for review, never "fixed" automatically. */
export function findConflicts(schedule) {
  const active = (schedule || []).filter((e) => e.is_active !== false);
  const conflicts = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a.day_of_week !== b.day_of_week) continue;
      if (!(String(a.start_time) < String(b.end_time) && String(b.start_time) < String(a.end_time))) continue;
      const sometimes = a.recurrence === "monthly_nth" || b.recurrence === "monthly_nth";
      conflicts.push({ a, b, sometimes });
    }
  }
  return conflicts;
}
