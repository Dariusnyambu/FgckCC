import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
const About = lazy(() => import("./pages/About"));
const Leadership = lazy(() => import("./pages/Leadership"));
const Departments = lazy(() => import("./pages/Departments"));
const MiniChurches = lazy(() => import("./pages/MiniChurches"));
const ServiceSectors = lazy(() => import("./pages/ServiceSectors"));
const Sermons = lazy(() => import("./pages/Sermons"));
const LiveService = lazy(() => import("./pages/LiveService"));
const Events = lazy(() => import("./pages/Events"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Prayer = lazy(() => import("./pages/Prayer"));
const Giving = lazy(() => import("./pages/Giving"));
const Contact = lazy(() => import("./pages/Contact"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSiteSettings = lazy(() => import("./pages/admin/AdminSiteSettings"));
const AdminBlogList = lazy(() => import("./pages/admin/AdminBlogList"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminMiniChurches = lazy(() => import("./pages/admin/AdminMiniChurches"));
const AdminLiveServiceSettings = lazy(() => import("./pages/admin/AdminLiveServiceSettings"));
const CrudManager = lazy(() => import("./pages/admin/CrudManager"));
const ProtectedRoute = lazy(() => import("./pages/admin/ProtectedRoute"));
const SettingsForm = lazy(() => import("./pages/admin/SettingsForm"));
const AdminPrayerRequests = lazy(() => import("./pages/admin/AdminInboxes").then((m) => ({ default: m.AdminPrayerRequests })));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminInboxes").then((m) => ({ default: m.AdminContactMessages })));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
import { CRUD_SECTIONS } from "./pages/admin/crudSections";
import { SETTINGS_PAGES } from "./pages/admin/settingsPages";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider>
          <Suspense fallback={<div className="boot-loader" role="status" aria-live="polite"><span className="boot-loader__mark">FGCK</span><span className="boot-loader__spinner" aria-hidden="true" /><span>Loading FGCK Christ Centre…</span></div>}>
          <Routes>
            {/* Public site */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/leadership" element={<Layout><Leadership /></Layout>} />
            <Route path="/departments" element={<Layout><Departments /></Layout>} />
            <Route path="/mini-churches" element={<Layout><MiniChurches /></Layout>} />
            <Route path="/service-sectors" element={<Layout><ServiceSectors /></Layout>} />
            <Route path="/sermons" element={<Layout><Sermons /></Layout>} />
            <Route path="/live" element={<Layout><LiveService /></Layout>} />
            <Route path="/events" element={<Layout><Events /></Layout>} />
            <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
            <Route path="/blog" element={<Layout><Blog /></Layout>} />
            <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
            <Route path="/prayer" element={<Layout><Prayer /></Layout>} />
            <Route path="/giving" element={<Layout><Giving /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="settings" element={<AdminSiteSettings />} />
              <Route path="blogs" element={<AdminBlogList />} />
              <Route path="blogs/new" element={<AdminBlogEditor />} />
              <Route path="blogs/:id" element={<AdminBlogEditor />} />
              <Route path="mini-churches" element={<AdminMiniChurches />} />
              <Route path="live-service" element={<AdminLiveServiceSettings />} />
              {CRUD_SECTIONS.map((c) => (
                <Route key={c.path} path={c.path} element={<CrudManager key={c.path} {...c} />} />
              ))}
              {SETTINGS_PAGES.map((p) => (
                <Route key={p.path} path={p.path} element={<SettingsForm key={p.path} {...p} />} />
              ))}
              <Route path="prayer-requests" element={<AdminPrayerRequests />} />
              <Route path="messages" element={<AdminContactMessages />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="users" element={<AdminUsers />} />
              </Route>
          </Routes>
          </Suspense>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
