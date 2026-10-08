export default function LeaderCard({ leader, featured = false }) {
  return (
    <div className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:shadow-md ${featured ? "sm:col-span-2" : ""}`}>
      <div className={`overflow-hidden ${featured ? "aspect-[16/10] sm:aspect-[21/9]" : "aspect-[4/5]"}`}>
        <img
          src={leader.image_url}
          alt={leader.name}
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <p className="eyebrow text-crimson">{leader.position}</p>
        <h3 className="mt-1 font-display text-xl font-extrabold text-ink">{leader.name}</h3>
        {leader.bio && <p className="mt-2 text-sm leading-relaxed text-ink/70">{leader.bio}</p>}
      </div>
    </div>
  );
}
