import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Clock, Share2 } from "lucide-react";
import { getBlogPostBySlug } from "../data/content";
import { useSeo } from "../lib/useSeo";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    setPost(undefined);
    getBlogPostBySlug(slug).then(setPost);
  }, [slug]);

  useSeo({
    title: post ? post.seo_title || post.title : "Article",
    description: post ? post.seo_description || post.excerpt : undefined,
    image: post?.og_image || post?.cover_image || undefined,
    type: "article",
    canonical: post?.canonical_url || undefined,
    noindex: post === null,
    jsonLd: post && {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.seo_description || post.excerpt,
      image: post.og_image || post.cover_image || undefined,
      author: { "@type": "Person", name: post.author || "FGCK Christ Centre" },
      datePublished: post.published_at,
      publisher: { "@type": "Organization", name: "FGCK Christ Centre", logo: { "@type": "ImageObject", url: window.location.origin + "/images/logo.png" } },
      mainEntityOfPage: window.location.href,
    },
  });

  if (post === undefined) return null;

  if (post === null) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="font-display text-2xl font-extrabold text-ink">Article not found</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-crimson">
          <ChevronLeft size={16} /> Back to Blog
        </Link>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8 lg:py-24">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-ink/60 hover:text-crimson">
        <ChevronLeft size={16} /> Back to Blog
      </Link>

      <p className="eyebrow mt-6 text-crimson">{post.category}</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/60">
        <span>{post.author}</span>
        <span>·</span>
        <span>{post.published_at}</span>
        {post.reading_time && (
          <>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {post.reading_time} min read</span>
          </>
        )}
      </div>

      {post.cover_image && (
        <img src={post.cover_image} alt={post.title} className="mt-8 aspect-video w-full rounded-2xl object-cover" />
      )}

      <div className="prose-content mt-8" dangerouslySetInnerHTML={{ __html: post.content || "" }} />

      <div className="mt-10 flex items-center gap-3 border-t border-ink/10 pt-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Share</span>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-crimson hover:text-crimson"
        >
          <Share2 size={13} /> Copy Link
        </button>
      </div>
    </article>
  );
}
