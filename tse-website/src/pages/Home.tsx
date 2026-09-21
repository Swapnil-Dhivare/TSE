import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { Marquee } from "@/components/marketing/Marquee";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { StatBand } from "@/components/marketing/StatBand";
import { CaseStudyCard } from "@/components/marketing/CaseStudyCard";
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { SERVICES } from "@/content/services";
import { CASE_STUDIES } from "@/content/case-studies";

export default function Home() {
  return (
    <>
      <Hero />

      <Marquee />

      <div className="bg-accent">
        <SectionReveal className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">What we do</h2>
            <p className="mt-3 text-muted-foreground">
              Social media growth, websites and the content that fuels both — done properly, not
              spread thin.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </SectionReveal>
      </div>

      <SectionReveal className="mx-auto max-w-6xl px-6 py-14">
        <StatBand />
      </SectionReveal>

      <SectionReveal className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Recent work</h2>
            <p className="mt-2 text-muted-foreground">Real results for real businesses.</p>
          </div>
          <Link
            to="/case-studies"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-forest"
          >
            View all work
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CASE_STUDIES.slice(0, 3).map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </div>
      </SectionReveal>

      <div className="bg-accent">
        <SectionReveal className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center font-display text-3xl font-bold text-ink sm:text-4xl">
            What our clients say
          </h2>
          <div className="mt-10">
            <TestimonialCarousel />
          </div>
        </SectionReveal>
      </div>

      <CTASection
        title="Ready to grow your business?"
        description="Tell us about your business and we'll put together a plan — no jargon, no obligation."
      />
    </>
  );
}
