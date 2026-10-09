export const liveLink = (config) =>
  config?.youtube_url || config?.streaming_url || config?.facebook_url || "";

export const sermonVideo = (sermon) => sermon.youtube_url || sermon.video_url || "";
