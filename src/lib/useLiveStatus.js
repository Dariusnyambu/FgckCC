import { useServiceInfo } from "./useServiceInfo";

// Used by the header: is a streamed service live right now?
export function useLiveStatus() {
  const { next } = useServiceInfo(30000);
  return { isLive: next?.status === "live", inSession: next?.status === "in_session", next };
}
