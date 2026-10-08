import { createContext, useContext, useEffect, useState } from "react";
import { getSiteSettings } from "../data/content";

const ThemeContext = createContext(null);

// Maps site_settings columns to the CSS custom properties defined in
// index.css. Changing any of these in the admin Site Settings screen and
// saving updates the live site instantly, no redeploy needed. The CSS vars
// store "R G B" triplets (so Tailwind's opacity modifiers keep working),
// while the admin form works in familiar hex, convert on the way in.
const VAR_MAP = {
  primary_color: "--color-crimson-rgb",
  primary_color_dark: "--color-crimson-dark-rgb",
  primary_color_light: "--color-crimson-light-rgb",
  secondary_color: "--color-orange-rgb",
  accent_color: "--color-gold-rgb",
  accent_color_dark: "--color-gold-dark-rgb",
  accent_color_light: "--color-gold-light-rgb",
  navy_color: "--color-navy-rgb",
  navy_color_light: "--color-navy-light-rgb",
  background_color: "--color-cream-rgb",
};

function hexToRgbTriplet(hex) {
  const clean = hex.replace("#", "");
  if (![3, 6].includes(clean.length)) return null;
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return `${r} ${g} ${b}`;
}

export function applyTheme(settings) {
  if (!settings) return;
  const root = document.documentElement;
  Object.entries(VAR_MAP).forEach(([key, cssVar]) => {
    if (!settings[key]) return;
    const triplet = hexToRgbTriplet(settings[key]);
    if (triplet) root.style.setProperty(cssVar, triplet);
  });
}

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      applyTheme(s);
    });
  }, []);

  return <ThemeContext.Provider value={{ settings, refresh: () => getSiteSettings().then((s) => { setSettings(s); applyTheme(s); }) }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
