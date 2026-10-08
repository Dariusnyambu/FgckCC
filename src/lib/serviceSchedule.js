// Computes the next occurrence of a recurring weekly service from a
// {day_of_week, start_time, end_time, timezone} config, so the admin never
// has to manually reset the countdown, it always recalculates from "now".
//
// day_of_week: 0 (Sunday) – 6 (Saturday), matches JS Date#getDay()
// start_time / end_time: "HH:MM" 24h
// timezone: IANA zone, e.g. "Africa/Nairobi"

function partsInZone(date, timeZone) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === "24" ? "0" : parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: weekdayMap[parts.weekday],
  };
}

// Convert a wall-clock time *in a given IANA zone* to a real UTC instant,
// by measuring the zone's current offset and applying it.
function zonedTimeToUtc(year, month, day, hour, minute, timeZone) {
  const guessUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const zoned = partsInZone(new Date(guessUtc), timeZone);
  const zonedAsUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  const offset = zonedAsUtc - guessUtc;
  return new Date(guessUtc - offset);
}

export function getServiceOccurrence(config, now = new Date()) {
  const { day_of_week, start_time, end_time, timezone } = config;
  const [startH, startM] = (start_time || "10:00").split(":").map(Number);
  const [endH, endM] = (end_time || "12:00").split(":").map(Number);
  const zone = timezone || "Africa/Nairobi";

  const nowInZone = partsInZone(now, zone);
  let daysAhead = (day_of_week - nowInZone.weekday + 7) % 7;

  let start = zonedTimeToUtc(
    nowInZone.year,
    nowInZone.month,
    nowInZone.day + daysAhead,
    startH,
    startM,
    zone
  );
  let end = zonedTimeToUtc(
    nowInZone.year,
    nowInZone.month,
    nowInZone.day + daysAhead,
    endH,
    endM,
    zone
  );

  // If today is service day but the service has already ended, jump to next week.
  if (end.getTime() <= now.getTime()) {
    daysAhead += 7;
    start = zonedTimeToUtc(nowInZone.year, nowInZone.month, nowInZone.day + daysAhead, startH, startM, zone);
    end = zonedTimeToUtc(nowInZone.year, nowInZone.month, nowInZone.day + daysAhead, endH, endM, zone);
  }

  const status = now >= start && now < end ? "live" : now < start ? "upcoming" : "ended";
  return { start, end, status };
}

export function splitDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}
