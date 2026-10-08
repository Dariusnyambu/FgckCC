import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import About from "./pages/About";
import Leadership from "./pages/Leadership";
import Departments from "./pages/Departments";
import MiniChurches from "./pages/MiniChurches";
import ServiceSectors from "./pages/ServiceSectors";
import Sermons from "./pages/Sermons";
import LiveService from "./pages/LiveService";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Prayer from "./pages/Prayer";
import Giving from "./pages/Giving";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSiteSettings from "./pages/admin/AdminSiteSettings";
import AdminBlogList from "./pages/admin/AdminBlogList";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminLiveServiceSettings from "./pages/admin/AdminLiveServiceSettings";
import CrudManager from "./pages/admin/CrudManager";
import ProtectedRoute from "./pages/admin/ProtectedRoute";
import SettingsForm from "./pages/admin/SettingsForm";
import InboxManager, { PRAYER_ACTIONS, MESSAGE_ACTIONS } from "./pages/admin/InboxManager";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminUsers from "./pages/admin/AdminUsers";
import { CRUD_SECTIONS } from "./pages/admin/crudSections";
import { SETTINGS_PAGES } from "./pages/admin/settingsPages";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
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
              <Route path="live-service" element={<AdminLiveServiceSettings />} />
              {CRUD_SECTIONS.map((c) => (
                <Route key={c.path} path={c.path} element={<CrudManager key={c.path} {...c} />} />
              ))}
              {SETTINGS_PAGES.map((p) => (
                <Route key={p.path} path={p.path} element={<SettingsForm key={p.path} {...p} />} />
              ))}
              <Route
                path="prayer-requests"
                element={<InboxManager title="Prayer Requests" subtitle="Requests submitted by visitors. Keep them private and pray over them." table="prayer_requests" statuses={["new", "read", "prayed_for", "archived"]} actions={PRAYER_ACTIONS} />}
              />
              <Route
                path="messages"
                element={<InboxManager title="Contact Messages" subtitle="Messages sent through the website contact form." table="contact_messages" statuses={["unread", "read", "archived"]} actions={MESSAGE_ACTIONS} />}
              />
              <Route path="media" element={<AdminMedia />} />
              <Route path="users" element={<AdminUsers />} />
              </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
