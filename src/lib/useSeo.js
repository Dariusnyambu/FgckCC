import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Sets title, description, canonical, Open Graph, Twitter and JSON-LD for the current page. */
export function useSeo({ title, description, image, type = "website", jsonLd, noindex = false, canonical } = {}) {
  const theme = useTheme();
  const site = theme?.settings;
  const siteName = site?.church_name || "FGCK Christ Centre";
  const jsonKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const origin = window.location.origin;
    const fullTitle = title ? `${title} | ${siteName}` : site?.seo_title || `${siteName} | Light House`;
    const desc = description || site?.seo_description || "";
    const img = image || site?.og_image || "/images/logo.png";
    const absImg = img.startsWith("http") ? img : origin + img;
    const url = canonical || origin + window.location.pathname;

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setMeta("name", "keywords", site?.seo_keywords);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setCanonical(url);
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:type", type);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", absImg);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", absImg);

    let script = document.getElementById("seo-jsonld");
    if (jsonKey) {
      if (!script) {
        script = document.createElement("script");
        script.id = "seo-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = jsonKey;
    } else {
      script?.remove();
    }
  }, [title, description, image, type, jsonKey, noindex, canonical, site, siteName]);
}
