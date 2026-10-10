// Helpers for turning any pasted YouTube link into an on-site player + thumbnail.
const ID_PATTERN = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/;

export function youtubeId(url) {
  if (!url) return null;
  const match = String(url).match(ID_PATTERN);
  return match ? match[1] : null;
}

// hqdefault exists for every video (maxresdefault does not).
export const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const youtubeEmbed = (id, autoplay = false) =>
  `https://www.youtube.com/embed/${id}?${autoplay ? "autoplay=1&" : ""}rel=0&modestbranding=1&playsinline=1`;

export const isVideoFile = (url) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url || "");

// A sermon plays from its YouTube link, or an uploaded/other video link.
export const sermonVideo = (s) => s?.youtube_url || s?.video_url || "";
