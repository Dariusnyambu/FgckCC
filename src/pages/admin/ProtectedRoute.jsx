import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session, loading, isSupabaseConfigured } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-ink text-cream">Loading…</div>;
  }

  // Without Supabase connected there is no real auth to protect against -
  // send to login so it's obvious the dashboard isn't live yet.
  if (!isSupabaseConfigured || !session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
