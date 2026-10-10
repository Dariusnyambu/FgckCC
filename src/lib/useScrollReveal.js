import { useEffect } from "react";

// Cards, grid items and headings fade/slide in as they scroll into view.
// Elements are tagged by script, so if anything fails the content simply stays visible.
const SELECTOR = "main .grid > *, main [data-reveal], main article > *";

export function useScrollReveal(key) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const main = document.querySelector("main");
    if (!main) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            el.classList.add("reveal-in");
            io.unobserve(el);
            // Hand control back to the element's own hover styles once the entrance is done.
            setTimeout(() => {
              el.classList.remove("reveal", "reveal-in");
              el.style.removeProperty("--reveal-delay");
            }, 1100);
          }
        }),
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );

    const tag = () => {
      main.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.dataset.rv || el.closest("[data-no-reveal]")) return;
        el.dataset.rv = "1";
        el.classList.add("reveal");
        const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 70}ms`);
        io.observe(el);
      });
    };

    tag();
    const mo = new MutationObserver(tag);
    mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [key]);
}
