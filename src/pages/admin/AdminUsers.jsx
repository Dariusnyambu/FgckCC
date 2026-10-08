import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    if (!isSupabaseConfigured) return setLoading(false);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at");
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) setError(error.message);
    else setRows((r) => r.map((x) => (x.id === id ? { ...x, role } : x)));
  };

  const remove = async (id) => {
    if (!confirm("Remove this person's admin access? They will no longer be able to manage the website.")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) setError(error.message);
    else setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div>
      <p className="font-display text-2xl font-extrabold text-ink">Admin Users</p>
      <p className="mt-1 text-sm text-ink/60">People who can sign in and manage the website.</p>
      {error && <p className="mt-4 rounded-lg bg-crimson/10 px-4 py-2.5 text-sm text-crimson">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-ink/5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-ink/50"><Loader2 className="animate-spin" size={18} /> Loading…</div>
        ) : rows.length === 0 ? (
          <p className="py-14 text-center text-sm text-ink/50">No admin users found.</p>
        ) : (
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/40">
              <tr><th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Added</th><th className="px-5 py-3" /></tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const me = u.id === session?.user?.id;
                return (
                  <tr key={u.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{u.full_name || "—"} {me && <span className="ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-clay">You</span>}</td>
                    <td className="px-5 py-3">
                      <select value={u.role} disabled={me} onChange={(e) => changeRole(u.id, e.target.value)} className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm outline-none focus:border-crimson disabled:opacity-60">
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-ink/60">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-right">{!me && <button onClick={() => remove(u.id)} className="text-xs font-bold text-crimson hover:underline">Remove access</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex gap-3 rounded-2xl bg-gold/10 p-5 text-sm text-ink/80">
        <ShieldCheck className="mt-0.5 shrink-0 text-clay" size={18} />
        <p>
          To add a new administrator, create their account under <b>Authentication → Users</b> in your Supabase project, then add their
          user ID to the <code className="rounded bg-ink/5 px-1">profiles</code> table. They can then sign in at <code className="rounded bg-ink/5 px-1">/admin/login</code>.
        </p>
      </div>
    </div>
  );
}
