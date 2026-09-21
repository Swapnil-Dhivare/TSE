import { Outlet } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/**
 * Chrome for transactional surfaces. Deliberately excludes SmoothScroll,
 * CustomCursor and GrainOverlay: Lenis fights Razorpay's scroll lock, and a
 * mix-blend-difference cursor paints over the payment modal.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <SiteHeader />
      <main className="flex-1"><Outlet /></main>
      <SiteFooter />
    </div>
  );
}
