import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GlowOrbs } from "./GlowOrbs";
import { Magnetic } from "./Magnetic";

export function CTASection({
  title,
  description,
  ctaLabel = "Get a free consult",
  to = "/contact",
}: {
  title: string;
  description?: string;
  ctaLabel?: string;
  to?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-forest bg-dot-grid-dark">
      <GlowOrbs />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-paper sm:text-4xl">{title}</h2>
        {description && <p className="max-w-xl text-paper/70">{description}</p>}
        <Magnetic>
          <Link
            to={to}
            className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
