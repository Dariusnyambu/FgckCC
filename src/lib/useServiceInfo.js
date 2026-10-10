import { useEffect, useMemo, useState } from "react";
import { getLiveServiceSettings, getServiceSchedule, peek } from "../data/content";
import { resolveNextService } from "./serviceSchedule";

/**
 * Everything the public site needs to know about services, in one place:
 *   next     - the next (or current) service: { title, start, end, status, streamUrl, ... }
 *   settings - live_service_settings row (stream links, next-service mode)
 *   schedule - the weekly timetable
 * Starts from the last known values (localStorage) so the hero paints immediately, then refreshes.
 */
export function useServiceInfo(tickMs = 1000) {
  const [data, setData] = useState(() => ({ settings: peek("live_service"), schedule: peek("service_schedule") }));
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let alive = true;
    Promise.all([getLiveServiceSettings(), getServiceSchedule()]).then(([settings, schedule]) => {
      if (alive) setData({ settings, schedule });
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const ready = !!(data.settings || data.schedule);
  const next = useMemo(
    () => (ready ? resolveNextService({ settings: data.settings, schedule: data.schedule, now }) : null),
    [ready, data, now]
  );
  return { ...data, next, now, ready };
}

/** Best stream link for a service: its own link first, then the church-wide live link. */
export const streamLinkFor = (next, settings) => next?.streamUrl || settings?.youtube_url || settings?.streaming_url || settings?.facebook_url || "";
