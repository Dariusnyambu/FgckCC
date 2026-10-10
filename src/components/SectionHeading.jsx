export default function SectionHeading({ eyebrow, title, description, align = "left", tone = "dark" }) {
  const centered = align === "center";
  const light = tone === "light";
  return (
    <div data-reveal className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className={`eyebrow mb-2 ${light ? "text-gold" : "text-crimson"}`}>{eyebrow}</p>}
      <h2 className={`font-display text-3xl font-extrabold leading-tight sm:text-4xl ${light ? "text-cream" : "text-ink"}`}>{title}</h2>
      {description && <p className={`mt-2.5 ${light ? "text-cream/70" : "text-ink/70"}`}>{description}</p>}
    </div>
  );
}
