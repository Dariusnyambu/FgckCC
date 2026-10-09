import { useEffect, useState } from "react";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { Compass, Eye, Heart } from "lucide-react";
import { getSiteSettings } from "../data/content";

function Paragraphs({ text, className = "" }) {
  return (text || "").split(/\n{2,}/).filter(Boolean).map((p, i) => (
    <p key={i} className={className}>{p}</p>
  ));
}

export default function About() {
  useSeo({ title: 'About Us', description: 'Learn the story, vision, mission and core values of FGCK Christ Centre (Light House) in Nairobi.' });
  const [s, setS] = useState(null);
  useEffect(() => { getSiteSettings().then(setS); }, []);
  if (!s) return null;

  const values = (s.core_values || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > -1 ? { title: l.slice(0, i).trim(), desc: l.slice(i + 1).trim() } : { title: l, desc: "" };
    });

  return (
    <>
      <section className="relative overflow-hidden bg-white py-16 lg:py-24">
        <div className="rays pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="eyebrow text-crimson">Our Story</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-ink sm:text-5xl">About {s.church_name}</h1>
          <Paragraphs text={s.about_intro} className="mt-5 text-lg leading-relaxed text-ink/70" />
        </div>
      </section>

      {s.about_history && (
        <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
          <SectionHeading eyebrow="Our History" title="How it all began" />
          <div className="mt-6 space-y-4 leading-relaxed text-ink/75">
            <Paragraphs text={s.about_history} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Eye, title: "Our Vision", desc: s.vision },
            { icon: Compass, title: "Our Mission", desc: s.mission },
            { icon: Heart, title: "Pastor's Welcome", desc: s.pastor_message },
          ].filter((c) => c.desc).map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-ink/10 bg-white p-8">
              <Icon className="text-crimson" size={28} />
              <p className="mt-4 font-display text-xl font-extrabold text-ink">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {values.length > 0 && (
        <section className="bg-ink py-16 text-cream lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading eyebrow="What We Value" title="Our Core Values" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <div key={v.title} className="rounded-2xl bg-cream/5 p-6 ring-1 ring-cream/10">
                  <p className="font-display text-3xl font-extrabold text-gold">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-3 font-bold">{v.title}</p>
                  {v.desc && <p className="mt-1 text-sm text-cream/60">{v.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {s.beliefs && (
        <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
          <SectionHeading eyebrow="What We Believe" title="Our Beliefs" />
          <div className="mt-6 space-y-4 leading-relaxed text-ink/75">
            <Paragraphs text={s.beliefs} />
          </div>
        </section>
      )}
    </>
  );
}
