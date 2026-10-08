import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { getBlogPosts } from "../../data/content";

const STATUS_STYLES = {
  published: "bg-forest/10 text-forest",
  draft: "bg-ink/10 text-ink/60",
  scheduled: "bg-gold/15 text-clay",
  archived: "bg-crimson/10 text-crimson",
};

export default function AdminBlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getBlogPosts();
    setPosts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!isSupabaseConfigured) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-extrabold text-ink">Blog Posts</p>
          <p className="mt-1 text-sm text-ink/60">Write, edit and publish Christian articles.</p>
        </div>
        <Link
          to="/admin/blogs/new"
          className="flex items-center gap-2 rounded-full bg-crimson px-4 py-2.5 text-sm font-bold text-cream hover:bg-crimson-dark"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-ink/50">
            <Loader2 className="animate-spin" size={18} /> Loading…
          </div>
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink/50">No posts yet. Create your first one.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink">{p.title}</td>
                  <td className="px-5 py-3 text-ink/60">{p.category || "-"}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[p.status] || STATUS_STYLES.draft}`}>
                      {p.status || "draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink/60">{p.published_at || "-"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/admin/blogs/${p.id}`} className="text-ink/40 hover:text-crimson" aria-label="Edit">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => onDelete(p.id)} className="text-ink/40 hover:text-crimson" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
