import { useEffect, useState } from "react";
import { ExternalLink, Radio } from "lucide-react";
import { getServiceOccurrence } from "../lib/serviceSchedule";
import { getLiveServiceSettings, getSiteSettings } from "../data/content";
import ServiceCountdown from "../components/ServiceCountdown";
import SectionHeading from "../components/SectionHeading";
import VideoPlayer from "../components/VideoPlayer";
import { youtubeId } from "../lib/youtube";
import { useSeo } from "../lib/useSeo";
import { liveLink } from "../lib/serviceLinks";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function LiveService() {
  useSeo({
    title: "Live Service",
    description: "Join the FGCK Christ Centre service live online every Sunday, or watch the latest service any time, right on this page.",
  });
  const [config, setConfig] = useState(null);
  const [site, setSite] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    getLiveServiceSettings().then(setConfig);
    getSiteSettings().then(setSite);
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

  const link = liveLink(config);
  const isYoutube = !!youtubeId(link);
  const isLive = status === "live";

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Worship With Us" title="Live Service" align="center" />

      <div className="mt-12 space-y-6">
        {isLive ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-crimson px-6 py-4 text-cream">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
            </span>
            <p className="font-display text-lg font-extrabold uppercase tracking-wide">We are live: {config.title}</p>
          </div>
        ) : (
          <ServiceCountdown config={config} />
        )}

        <div>
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-ink/50">
            {isLive ? "Watch now" : link ? "Watch the latest service" : "Service video"}
          </p>
          <VideoPlayer key={`${link}-${isLive}`} url={link} title={config.title || "Church service"} thumbnail={config.thumbnail_url || undefined} autoPlay={isLive && isYoutube} />
          {!link && (
            <p className="mt-3 text-center text-sm text-ink/60">The service video will appear here as soon as it is added.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/70 hover:border-crimson hover:text-crimson">
              <ExternalLink size={15} /> Open in YouTube
            </a>
          )}
          {site?.youtube_url && (
            <a href={site.youtube_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark">
              <Radio size={15} /> Subscribe on YouTube
            </a>
          )}
        </div>

        {config.description && <p className="mx-auto max-w-2xl text-center text-sm text-ink/70">{config.description}</p>}
      </div>

      <p className="mt-8 text-center text-sm text-ink/60">
        Services stream every {DAYS[config.day_of_week ?? 0]} at {config.start_time} ({config.timezone}). The countdown resets itself every week, so there is no need to refresh.
      </p>
    </section>
  );
}
