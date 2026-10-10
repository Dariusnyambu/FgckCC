import { Mail, Phone } from "lucide-react";

const initials = (name = "") => name.replace(/^(rev\.?|dr\.?|pst\.?|pastor|elder|bro\.?|sis\.?|mr\.?|mrs\.?|ms\.?)\s+/gi, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Contact({ leader, className = "" }) {
  if (!leader.phone && !leader.email) return null;
  return (
    <div className={`flex flex-col gap-1 text-xs text-ink/60 ${className}`}>
      {leader.phone && <a href={`tel:${leader.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-crimson"><Phone size={12} /> {leader.phone}</a>}
      {leader.email && <a href={`mailto:${leader.email}`} className="inline-flex items-center gap-1.5 break-all hover:text-crimson"><Mail size={12} /> {leader.email}</a>}
    </div>
  );
}

/** variant "featured": large portrait card (pastoral team). variant "compact": small card for the other tiers. */
export default function LeaderCard({ leader, variant = "featured" }) {
  if (variant === "compact") {
    return (
      <div className="flex items-start gap-3.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
        {leader.image_url ? (
          <img src={leader.image_url} alt={leader.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-full object-cover object-top" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-crimson/10 text-sm font-extrabold text-crimson" aria-hidden="true">{initials(leader.name)}</div>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-base font-extrabold leading-snug text-ink">{leader.name}</h3>
          <p className="text-sm font-medium text-crimson">{leader.position}</p>
          {leader.department && <p className="text-xs text-ink/55">{leader.department}</p>}
          <Contact leader={leader} className="mt-1.5" />
        </div>
      </div>
    );
  }
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-ink/5">
        {leader.image_url ? (
          <img src={leader.image_url} alt={leader.name} loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-5xl font-extrabold text-crimson/30" aria-hidden="true">{initials(leader.name)}</div>
        )}
      </div>
      <div className="p-5">
        <p className="eyebrow text-crimson">{leader.position}</p>
        <h3 className="mt-1 font-display text-xl font-extrabold text-ink">{leader.name}</h3>
        {leader.department && <p className="text-xs text-ink/55">{leader.department}</p>}
        {leader.bio && <p className="mt-2 text-sm leading-relaxed text-ink/70">{leader.bio}</p>}
        <Contact leader={leader} className="mt-3" />
      </div>
    </div>
  );
}
