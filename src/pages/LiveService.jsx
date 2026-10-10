import { ExternalLink, Radio, Video } from "lucide-react";
import SectionHeading from "../components/SectionHeading";
import ServiceCountdown from "../components/ServiceCountdown";
import VideoPlayer from "../components/VideoPlayer";
import ServiceTimetable from "../components/ServiceTimetable";
import { useServiceInfo, streamLinkFor } from "../lib/useServiceInfo";
import { youtubeId } from "../lib/youtube";
import { getSiteSettings } from "../data/content";
import { useEffect, useState } from "react";
import { useSeo } from "../lib/useSeo";

export const liveLink = (c) => c?.youtube_url || c?.streaming_url || c?.facebook_url || "";

export default function LiveService() {
  useSeo({
    title: "Live Service",
    description: "See the next FGCK Christ Centre service, watch live or the latest service online, and view our weekly order of services.",
  });
  const { settings, schedule, next, now, ready } = useServiceInfo();
  const [site, setSite] = useState(null);
  useEffect(() => { getSiteSettings().then(setSite); }, []);

  const link = streamLinkFor(next, settings);
  const isLive = next?.status === "live";
  const isYoutube = !!youtubeId(link);

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <SectionHeading eyebrow="Worship With Us" title="Live Service" align="center" />

      <div className="mt-8 space-y-5">
        <ServiceCountdown service={next} now={now} />

        {next?.source === "manual" && (
          <p className="text-center text-sm text-ink/60">This is a special service. Our regular weekly schedule below continues as normal.</p>
        )}

        {link ? (
          <div>
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-ink/50">
              {isLive ? "Watch now" : "Watch the latest service"}
            </p>
            <VideoPlayer key={`${link}-${isLive}`} url={link} title={next?.title || "Church service"} thumbnail={settings?.thumbnail_url || undefined} autoPlay={isLive && isYoutube} />
          </div>
        ) : (
          ready && (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-8 text-sm text-ink/60 shadow-sm ring-1 ring-ink/5">
              <Video size={20} className="shrink-0 text-ink/30" />
              The service video will appear here when a stream link is added.
            </div>
          )
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/70 hover:border-crimson hover:text-crimson">
              <ExternalLink size={15} /> Open in a new tab
            </a>
          )}
          {site?.youtube_url && (
            <a href={site.youtube_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark">
              <Radio size={15} /> Our YouTube channel
            </a>
          )}
        </div>

        {settings?.description && <p className="mx-auto max-w-2xl text-center text-sm text-ink/70">{settings.description}</p>}
      </div>

      <div className="mt-10">
        <SectionHeading eyebrow="Order of Services" title="Weekly Timetable" description="Times are in East Africa Time (Nairobi)." />
        <ServiceTimetable schedule={schedule} className="mt-6" />
      </div>
    </section>
  );
}
