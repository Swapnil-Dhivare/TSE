import { Compass, Hammer, TrendingUp } from "lucide-react";
import { SectionIntro } from "@/components/marketing/SectionIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

const STEPS = [
  { icon: Compass, title: "Discover", body: "We start by understanding your business, your customers and what makes you different — not by pitching a package." },
  { icon: Hammer, title: "Build", body: "Social presence, website or content — built specifically for how your customers actually find and choose you." },
  { icon: TrendingUp, title: "Grow", body: "We track what matters, report in plain English, and keep refining instead of disappearing after launch." },
];

export default function About() {
  return (
    <>
      <SectionIntro eyebrow="About" title="Built for growing businesses" />

      {/* Editorial two-column: copy left, a pulled statement right — replaces the
          old slab of three centred paragraphs with no visual. */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr]">
          <Reveal direction="up" className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              TSE exists because most digital marketing is built for big brands with big budgets —
              leaving growing businesses stuck with generic templates and agencies that never take
              the time to understand them.
            </p>
            <p>
              We work with businesses and individuals who want marketing built around them, not a
              template. Every recommendation is grounded in your specific market and customers.
            </p>
            <p>
              No bloated retainers, no jargon-filled reports, no disappearing after the first
              invoice. Just social media, websites, content and events built to bring customers
              through your door.
            </p>
          </Reveal>

          <Parallax strength={26}>
            <Reveal direction="left" className="rounded-2xl border border-line bg-surface p-8">
              <p className="font-display text-3xl font-bold uppercase leading-[0.95] text-ink">
                “The people who pitch you are the people who build it.”
              </p>
              <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-brand-lift">
                How we operate
              </p>
            </Reveal>
          </Parallax>
        </div>
      </section>

      <section className="border-y border-line bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal direction="up">
            <h2 className="font-display text-4xl font-bold uppercase text-ink sm:text-6xl">How we work</h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <RevealItem key={s.title} direction="blur"
                  className="rounded-2xl border border-line bg-void p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-brand-lift">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold uppercase text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <CTASection title="Let's talk about your business" />
    </>
  );
}
