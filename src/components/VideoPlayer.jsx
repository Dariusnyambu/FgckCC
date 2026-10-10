import { useState } from "react";
import { Play, ExternalLink, Video } from "lucide-react";
import { youtubeId, youtubeThumb, youtubeEmbed, isVideoFile } from "../lib/youtube";

/**
 * Plays a video on the site. Paste a YouTube link (watch, youtu.be, live, shorts)
 * and it shows that video's own YouTube thumbnail; click to play right here.
 * Also handles uploaded video files and other embeddable stream URLs.
 */
export default function VideoPlayer({ url, title = "Video", thumbnail, autoPlay = false, className = "" }) {
  const [playing, setPlaying] = useState(autoPlay);
  const id = youtubeId(url);
  const box = `relative aspect-video w-full overflow-hidden rounded-2xl bg-ink ${className}`;

  if (!url) {
    return (
      <div className={`relative flex aspect-[16/7] w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-ink/90 text-cream/50 ${className}`}>
        <Video size={34} />
        <p className="text-xs font-semibold uppercase tracking-wide">Video coming soon</p>
      </div>
    );
  }

  if (id) {
    if (playing) {
      return (
        <div className={box}>
          <iframe
            src={youtubeEmbed(id, true)}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <button type="button" onClick={() => setPlaying(true)} className={`${box} group block text-left`} aria-label={`Play ${title}`}>
        <img src={thumbnail || youtubeThumb(id)} alt={title} loading="lazy" className="h-full w-full scale-[1.02] object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-crimson text-cream shadow-lg transition group-hover:scale-110">
          <Play size={26} fill="currentColor" className="ml-1" />
        </span>
      </button>
    );
  }

  if (isVideoFile(url)) {
    return (
      <div className={box}>
        <video src={url} poster={thumbnail || undefined} controls playsInline className="h-full w-full" />
      </div>
    );
  }

  if (/^https?:\/\//.test(url)) {
    // Other embeddable stream (Facebook, Vimeo, etc.)
    return (
      <div className={box}>
        <iframe src={url} title={title} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className={`${box} flex items-center justify-center gap-2 text-cream`}>
      <ExternalLink size={18} /> Open video
    </a>
  );
}
