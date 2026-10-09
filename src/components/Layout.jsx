import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useScrollReveal } from "../lib/useScrollReveal";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  useScrollReveal(pathname);
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main key={pathname} className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
