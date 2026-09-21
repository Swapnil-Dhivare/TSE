import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { Marquee } from "@/components/marketing/Marquee";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { StatBand } from "@/components/marketing/StatBand";
import { CaseStudyCard } from "@/components/marketing/CaseStudyCard";
import { EventCard } from "@/components/events/EventCard";
import { TestimonialCarousel } from "@/components/marketing/TestimonialCarousel";
import { CTASection } from "@/components/marketing/CTASection";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { StickyScene } from "@/components/motion/StickyScene";
import { useEvents } from "@/hooks/queries/useEvents";
import { SERVICES } from "@/content/services";
import { CASE_STUDIES } from "@/content/case-studies";

const HOW_IT_WORKS = [
  { label: "Discover", title: "We learn how you actually win",
    body: "Before anything gets designed we work out where your customers come from today, and what's quietly stopping more of them arriving." },
  { label: "Build", title: "We build the thing, properly",
    body: "Social presence, a website, content, an event — built around how people really find and choose you, not a template we reuse." },
  { label: "Grow", title: "We stay and make it compound",
    body: "We track what matters, report in plain English, and keep refining. No disappearing after the first invoice." },
];

export default function Home() {
  const { data: events } = useEvents();
  const upcoming = (events ?? []).filter((e) => new Date(e.starts_at) >= new Date()).slice(0, 3);

  return (
    <>
      <Hero />
      <Marquee />

      {/* Services — staggered children */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal direction="up">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-lift">What we do</p>
          <h2 className="mt-4 max-w-2xl font-display text-5xl font-bold uppercase leading-[0.9] text-ink sm:text-7xl">
            Three services, done properly
          </h2>
        </Reveal>
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {SERVICES.map((service) => (
            <RevealItem key={service.slug} direction="blur">
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Pinned sequence — content swaps while the section stays put */}
      <StickyScene eyebrow="How we work" scenes={HOW_IT_WORKS} />

      {/* Upcoming events — violet flood band */}
      {upcoming.length > 0 && (
        <section className="bg-brand py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal direction="left">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] text-paper sm:text-7xl">
                  What's on
                </h2>
                <Link to="/events" className="group inline-flex items-center gap-2 font-semibold text-paper">
                  All events <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09}>
              {upcoming.map((e) => (
                <RevealItem key={e.id} direction="up"><EventCard event={e} /></RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal direction="scale"><StatBand /></Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal direction="right">
          <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] text-ink sm:text-7xl">
            Recent work
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09}>
          {CASE_STUDIES.slice(0, 3).map((cs) => (
            <RevealItem key={cs.slug} direction="blur"><CaseStudyCard caseStudy={cs} /></RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="border-y border-line bg-surface py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal direction="up">
            <h2 className="text-center font-display text-4xl font-bold uppercase text-ink sm:text-6xl">
              What clients say
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.12}>
            <div className="mt-12"><TestimonialCarousel /></div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Ready to grow?"
        description="Tell us about your business and we'll put together a plan — no jargon, no obligation."
      />
    </>
  );
}
