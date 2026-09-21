
import { PageTransition } from "@/components/motion/PageTransition";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { GrainOverlay } from "./GrainOverlay";
import { SmoothScroll } from "./SmoothScroll";
import { ScrollProgress } from "./ScrollProgress";
import { CustomCursor } from "@/components/marketing/CustomCursor";

export function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1"><PageTransition /></main>
      <SiteFooter />
    </div>
  );
}
