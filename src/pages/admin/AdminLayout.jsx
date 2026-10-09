import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LogOut, Menu, ExternalLink } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useSeo } from "../../lib/useSeo";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  useSeo({ title: "Admin", noindex: true });
  const { session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink/10 bg-white px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-md p-1.5 text-ink lg:hidden" aria-label="Open menu"><Menu size={22} /></button>
            <p className="hidden truncate text-sm text-ink/60 sm:block">Signed in as <span className="font-medium text-ink">{session?.user?.email}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:border-crimson hover:text-crimson">
              <ExternalLink size={14} /> <span className="hidden sm:inline">View Site</span>
            </Link>
            <button onClick={signOut} className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:border-crimson hover:text-crimson">
              <LogOut size={15} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
