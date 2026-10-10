import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { getBlogCategories, clearContentCache } from "../../data/content";
import { pickColumns } from "../../lib/db";
import { friendlyError, reportDbError } from "../../lib/errors";
import { useAuth } from "../../context/AuthContext";
import RichTextEditor from "../../components/admin/RichTextEditor";
import ImageUpload from "../../components/admin/ImageUpload";

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "",
  status: "draft",
  scheduled_at: "",
  seo_title: "",
  seo_description: "",
  focus_keyword: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
};

function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function wordsToReadingTime(html) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function AdminBlogEditor() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { session } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    getBlogCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])), scheduled_at: data.scheduled_at ? toLocalInput(data.scheduled_at) : "" });
        setLoading(false);
      });
  }, [id, isNew]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onTitleChange = (e) => {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
  };

  const save = async (publishNow = false) => {
    if (!isSupabaseConfigured) {
      setStatus({ ok: false, message: "Saving isn't available yet, the database connection hasn't been set up." });
      return;
    }
    setSaving(true);
    const publishing = publishNow || form.status === "published";
    const toIso = (v) => (v ? new Date(v).toISOString() : null);
    if (form.status === "scheduled" && !form.scheduled_at) { setSaving(false); return setStatus({ ok: false, message: "Choose the date and time to publish this post." }); }
    if (!form.title.trim() || !form.slug.trim()) { setSaving(false); return setStatus({ ok: false, message: "A title and URL slug are required." }); }
    const payload = pickColumns("blog_posts", {
      ...form,
      status: publishNow ? "published" : form.status,
      scheduled_at: form.status === "scheduled" && !publishNow ? toIso(form.scheduled_at) : null,
      published_at: publishing ? form.published_at || new Date().toISOString() : form.published_at || null,
      reading_time: wordsToReadingTime(form.content || ""),
      author: form.author || session?.user?.email?.split("@")[0],
    }, { nullable: ["scheduled_at", "published_at", "excerpt", "cover_image", "category", "seo_title", "seo_description", "focus_keyword", "canonical_url", "og_title", "og_description", "og_image"] });
    delete payload.id; delete payload.created_at; delete payload.updated_at;

    const { error } = isNew
      ? await supabase.from("blog_posts").insert(payload)
      : await supabase.from("blog_posts").update(payload).eq("id", id);

    setSaving(false);
    if (error) {
      reportDbError("save blog post", error);
      setStatus({ ok: false, message: friendlyError(error.message) });
      return;
    }
    clearContentCache();
    setStatus({ ok: true, message: publishNow ? "Published." : "Saved." });
    if (isNew) navigate("/admin/blogs");
  };

  if (loading) return null;

  return (
    <div>
      <Link to="/admin/blogs" className="inline-flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-crimson">
        <ChevronLeft size={16} /> Back to Blog Posts
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <p className="font-display text-2xl font-extrabold text-ink">{isNew ? "New Post" : "Edit Post"}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold text-ink/70 hover:border-crimson hover:text-crimson disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="rounded-full bg-crimson px-5 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>
      {status && (
        <p className={`mt-4 text-sm ${status.ok ? "text-forest" : "text-crimson"}`}>{status.message}</p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div>
            <input
              value={form.title}
              onChange={onTitleChange}
              placeholder="Post title"
              className="w-full rounded-xl border border-ink/15 px-4 py-3 font-display text-xl font-bold text-ink outline-none focus:border-crimson"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">URL Slug</label>
            <div className="flex items-center gap-1 text-sm text-ink/50">
              <span>/blog/</span>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                className="flex-1 rounded-lg border border-ink/15 px-3 py-1.5 text-sm text-ink outline-none focus:border-crimson"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Excerpt</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={update("excerpt")}
              className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-crimson"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Content</label>
            <RichTextEditor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
          </div>

          <section className="rounded-2xl border border-ink/10">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-display text-sm font-extrabold text-ink">SEO & Social</span>
              {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {seoOpen && (
              <div className="grid gap-4 border-t border-ink/10 p-5 sm:grid-cols-2">
                <TextField label="SEO Title" value={form.seo_title} onChange={update("seo_title")} />
                <TextField label="Focus Keyword" value={form.focus_keyword} onChange={update("focus_keyword")} />
                <TextField label="Meta Description" value={form.seo_description} onChange={update("seo_description")} full textarea />
                <TextField label="Canonical URL" value={form.canonical_url} onChange={update("canonical_url")} />
                <TextField label="Open Graph Title" value={form.og_title} onChange={update("og_title")} />
                <TextField label="Open Graph Description" value={form.og_description} onChange={update("og_description")} textarea />
                <TextField label="Social Share Image URL" value={form.og_image} onChange={update("og_image")} full />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Status</label>
            <select
              value={form.status}
              onChange={update("status")}
              className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>

            {form.status === "scheduled" && (
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Publish At</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={update("scheduled_at")}
                  className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Category</label>
            <select
              value={form.category}
              onChange={update("category")}
              className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Cover Image URL</label>
            <ImageUpload value={form.cover_image} onChange={(v) => setForm((f) => ({ ...f, cover_image: v }))} folder="blog" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, full, textarea }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</label>
      {textarea ? (
        <textarea rows={2} value={value || ""} onChange={onChange} className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson" />
      ) : (
        <input value={value || ""} onChange={onChange} className="w-full rounded-xl border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-crimson" />
      )}
    </div>
  );
}
