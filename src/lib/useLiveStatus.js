import { useEffect, useState } from "react";
import { getLiveServiceSettings } from "../data/content";
import { getServiceOccurrence } from "./serviceSchedule";

export function useLiveStatus() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState("upcoming");

  useEffect(() => {
    getLiveServiceSettings().then(setConfig);
  }, []);

  useEffect(() => {
    if (!config) return;
    const tick = () => {
      const { status } = getServiceOccurrence(
        {
          day_of_week: config.day_of_week ?? 0,
          start_time: config.start_time ?? "10:00",
          end_time: config.end_time ?? "12:00",
          timezone: config.timezone ?? "Africa/Nairobi",
        },
        new Date()
      );
      setStatus(status);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [config]);

  const watchUrl = config?.youtube_url || config?.streaming_url || config?.facebook_url || null;

  return { isLive: status === "live", watchUrl, config };
}
