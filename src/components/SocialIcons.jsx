// Brand icons (the icon library has none), drawn as simple outlined shapes.
const PATHS = {
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </>
  ),
  youtube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </>
  ),
  tiktok: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />,
  whatsapp: (
    <>
      <path d="M3 21l1.65-4.9A8.5 8.5 0 1 1 8 19.4z" />
      <path d="M9 10a5 5 0 0 0 5 5l1-1.5-2-1-.8.8a3.5 3.5 0 0 1-1.5-1.5l.8-.8-1-2z" />
    </>
  ),
};

export function SocialIcon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function socialLinks(s) {
  if (!s) return [];
  return [
    { name: "youtube", label: "YouTube", href: s.youtube_url },
    { name: "tiktok", label: "TikTok", href: s.tiktok_url },
    { name: "instagram", label: "Instagram", href: s.instagram_url },
    { name: "facebook", label: "Facebook", href: s.facebook_url },
    { name: "whatsapp", label: "WhatsApp", href: s.whatsapp_number ? `https://wa.me/${s.whatsapp_number}` : "" },
  ].filter((x) => x.href);
}

export function SocialRow({ settings, className = "", tone = "dark" }) {
  const base =
    tone === "light"
      ? "border-cream/20 text-cream/70 hover:border-gold hover:text-gold"
      : "border-ink/15 text-ink/70 hover:border-crimson hover:text-crimson";
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {socialLinks(settings).map(({ name, label, href }) => (
        <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className={`rounded-full border p-2.5 transition ${base}`}>
          <SocialIcon name={name} />
        </a>
      ))}
    </div>
  );
}
