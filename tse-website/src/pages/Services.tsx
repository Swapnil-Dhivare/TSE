import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { SectionIntro } from "@/components/marketing/SectionIntro";
import { CTASection } from "@/components/marketing/CTASection";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { SERVICES } from "@/content/services";

export default function Services() {
  return (
    <>
      <SectionIntro
        eyebrow="Services"
        title="Three ways we grow your business"
        description="Social media growth, websites, and the content that fuels both. Pick what fits, or use all three together."
      />

      <div className="mx-auto max-w-6xl px-6 py-16">
        {SERVICES.map((service, i) => {
          const Icon = service.icon;
          const reversed = i % 2 === 1;
          return (
            <Reveal
              key={service.slug}
              direction={reversed ? "left" : "right"}
              className="border-t border-line py-16 first:border-t-0 first:pt-0"
            >
              <div className={`grid items-start gap-10 md:grid-cols-[0.8fr_1.2fr] ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
                  </div>
                  <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-brand-lift">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 font-display text-4xl font-bold uppercase leading-[0.9] text-ink sm:text-5xl">
                    {service.name}
                  </h2>
                  <p className="mt-3 text-lg font-medium text-brand-lift">{service.tagline}</p>
                </div>

                <div>
                  <p className="text-lg leading-relaxed text-muted-foreground">{service.description}</p>
                  <ul className="mt-8 divide-y divide-line border-y border-line">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 py-4 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-lift" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.name)}`}
                    className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-ink"
                  >
                    Ask about {service.name.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <RevealGroup className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-line bg-line px-0 sm:grid-cols-3">
        {[
          ["No retainers", "Scope it, ship it, see the result."],
          ["One team", "The people who pitch are the people who build."],
          ["Plain English", "Reports you can actually act on."],
        ].map(([t, d]) => (
          <RevealItem key={t} className="bg-surface p-8">
            <h3 className="font-display text-xl font-bold uppercase text-ink">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </RevealItem>
        ))}
      </RevealGroup>

      <CTASection title="Not sure which fits?" description="Tell us about your business and we'll recommend where to start." />
    </>
  );
}
