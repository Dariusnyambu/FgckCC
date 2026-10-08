import { useEffect, useState } from "react";
import { getServiceOccurrence } from "../lib/serviceSchedule";
import { getLiveServiceSettings } from "../data/content";
import ServiceCountdown from "../components/ServiceCountdown";
import SectionHeading from "../components/SectionHeading";
import { Radio } from "lucide-react";

export default function LiveService() {
  const [config, setConfig] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    getLiveServiceSettings().then(setConfig);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!config) return null;

  const { status } = getServiceOccurrence(
    {
      day_of_week: config.day_of_week ?? 0,
      start_time: config.start_time ?? "10:00",
      end_time: config.end_time ?? "12:00",
      timezone: config.timezone ?? "Africa/Nairobi",
    },
    now
  );

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Worship With Us" title="Live Service" align="center" />

      <div className="mt-12">
        {status === "live" && config.streaming_url ? (
          <div className="aspect-video overflow-hidden rounded-2xl bg-ink shadow-lg">
            <iframe
              src={config.streaming_url}
              title="Live Service Stream"
              className="h-full w-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : status === "live" ? (
          <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-2xl bg-ink text-cream">
            <Radio size={40} className="text-gold" />
            <p className="font-display text-xl font-extrabold">We're live. Stream link coming shortly</p>
          </div>
        ) : (
          <ServiceCountdown config={config} />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-ink/60">
        Services stream automatically every {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][config.day_of_week ?? 0]}{" "}
        at {config.start_time} ({config.timezone}). No need to refresh. The countdown resets itself each week.
      </p>
    </section>
  );
}
