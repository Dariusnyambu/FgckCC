import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { applyTheme } from "./context/ThemeContext";
import { peek } from "./data/content";

// Paint with the last known brand colours straight away, and warm the connection to the database.
applyTheme(peek("site_settings"));
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = supabaseUrl;
  link.crossOrigin = "";
  document.head.appendChild(link);
}

// Always open pages at the top, including on refresh and back/forward.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// Always open pages at the top, including on refresh and back/forward.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
