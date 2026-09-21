import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { SERVICES } from "@/content/services";

export default function Services() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Three ways we grow your business"
        description="Social media growth, websites, and the content that fuels both. No bundled packages you don't need — pick what fits, or use all three together."
      />

      <div className="mx-auto max-w-6xl divide-y divide-line px-6">
        {SERVICES.map((service, index) => {
          const Icon = service.icon;
          const reversed = index % 2 === 1;
          return (
            <SectionReveal key={service.slug} className="py-16">
              <div
                className={`grid items-center gap-10 md:grid-cols-2 ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-forest">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-bold text-ink">{service.name}</h2>
                  <p className="mt-2 text-lg text-coral font-medium">{service.tagline}</p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{service.description}</p>
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.name)}`}
                    className="group mt-6 inline-flex items-center gap-1.5 font-semibold text-forest"
                  >
                    Ask about {service.name.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <ul className="space-y-3 rounded-2xl border border-line bg-card p-7">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
          );
        })}
      </div>

      <CTASection
        title="Not sure which service fits?"
        description="Tell us a bit about your business and we'll recommend where to start."
      />
    </>
  );
}
