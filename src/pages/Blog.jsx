import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSeo } from "../lib/useSeo";
import SectionHeading from "../components/SectionHeading";
import { getBlogPosts } from "../data/content";

export default function Blog() {
  useSeo({ title: 'Christian Blog and Articles', description: 'Christian articles on faith, prayer, family, leadership and spiritual growth from FGCK Christ Centre.' });
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getBlogPosts().then(setPosts);
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeading eyebrow="Christian Living" title="Blogs & Articles" align="center" />
      <div className="mt-14 space-y-6">
        {posts.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.slug}`}
            className="block rounded-2xl bg-white p-7 shadow-sm ring-1 ring-ink/5 transition hover:shadow-md"
          >
            <p className="eyebrow text-crimson">{p.category}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink">{p.title}</p>
            <p className="mt-2 text-sm text-ink/70">{p.excerpt}</p>
            <p className="mt-4 text-xs text-ink/50">
              {p.author} · {p.published_at} · {p.reading_time} min read
            </p>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-center text-ink/50">No articles published yet.</p>}
      </div>
    </section>
  );
}
