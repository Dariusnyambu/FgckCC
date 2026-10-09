import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Every navigation starts at the top of the page (instant, not animated).
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
