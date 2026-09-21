import { Mail, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/marketing/PageHeader";
import { ContactForm } from "@/components/marketing/ContactForm";
import { SectionReveal } from "@/components/marketing/SectionReveal";

const NEXT_STEPS = [
  "We'll review your business and reply within a business day.",
  "A short call to understand your goals — no sales pitch.",
  "A simple, honest plan for what we'd actually recommend.",
];

export default function Contact() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" description="Tell us about your business." />

      <SectionReveal className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <ContactForm />
          </div>

          <div className="space-y-8 md:col-span-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">What happens next</h3>
              <ol className="mt-4 space-y-3">
                {NEXT_STEPS.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-forest">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-line bg-card p-6 shadow-sm shadow-ink/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Mail className="h-4 w-4 text-forest" />
                hello@tseagency.example
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <MessageCircle className="h-4 w-4 text-forest" />
                Response within one business day
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </>
  );
}
