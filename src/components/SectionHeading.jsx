export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  const centered = align === "center";
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div className={`mb-3 flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
          <p className="eyebrow text-crimson">{eyebrow}</p>
        </div>
      )}
      <h2 className="font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-ink/70">{description}</p>}
    </div>
  );
}
