import { Compass, Hammer, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionReveal } from "@/components/marketing/SectionReveal";

const STEPS = [
  {
    icon: Compass,
    title: "Discover",
    description:
      "We start by understanding your business, your customers and what makes you different — not by pitching a package.",
  },
  {
    icon: Hammer,
    title: "Build",
    description:
      "Social presence, website or content — built specifically for how your customers actually find and choose you.",
  },
  {
    icon: TrendingUp,
    title: "Grow",
    description:
      "We track what matters, report in plain English, and keep refining instead of disappearing after launch.",
  },
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About TSE Agency"
        title="Built for growing businesses, not big-agency overhead."
      />

      <SectionReveal className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-5 text-lg leading-relaxed text-ink">
          <p>
            TSE Agency exists because most digital marketing is built for big brands with big
            budgets — leaving growing businesses stuck with generic templates and agencies that
            never really take the time to understand them.
          </p>
          <p>
            We work with businesses and individuals who want marketing built around them, not a
            template, which means every recommendation is grounded in your specific market and
            customers, not a one-size-fits-all playbook.
          </p>
          <p>
            No bloated retainers, no jargon-filled reports, no disappearing after the first
            invoice. Just social media, websites and content that are built to bring customers
            through your door.
          </p>
        </div>
      </SectionReveal>

      <SectionReveal className="bg-accent">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center font-display text-3xl font-bold text-ink">How we work</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl bg-card p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-lime">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      <CTASection title="Let's talk about your business" />
    </>
  );
}
