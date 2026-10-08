import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { session, signIn, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (session) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
    else navigate("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-crimson/10 text-crimson">
          <LockKeyhole size={22} />
        </div>
        <p className="mt-4 text-center font-display text-xl font-extrabold text-ink">Admin Sign In</p>
        <p className="mt-1 text-center text-sm text-ink/60">FGCK Christ Centre content management</p>

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg bg-gold/15 px-3 py-2 text-xs text-clay">
            Supabase isn't connected yet — add your project keys to <code>.env.local</code> to enable login.
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-3 text-sm outline-none focus:border-crimson"
          />
          {error && <p className="text-sm text-crimson">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-crimson px-6 py-3 text-sm font-extrabold text-cream transition hover:bg-crimson-dark disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
