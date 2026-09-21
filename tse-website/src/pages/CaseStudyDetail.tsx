import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, TrendingUp } from "lucide-react";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { CASE_STUDIES } from "@/content/case-studies";

export default function CaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const caseStudy = CASE_STUDIES.find((item) => item.slug === slug);

  if (!caseStudy) {
    return <Navigate to="/case-studies" replace />;
  }

  return (
    <>
      <section className="bg-forest text-paper">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link
            to="/case-studies"
            className="flex w-fit items-center gap-1.5 text-sm text-paper/70 hover:text-paper"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to case studies
          </Link>
          <span className="mt-6 inline-block w-fit rounded-full bg-paper/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-lime">
            {caseStudy.serviceCategory}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {caseStudy.title}
          </h1>
          <div className="mt-5 text-sm text-paper/70">{caseStudy.clientName}</div>
        </div>
      </section>

      <SectionReveal className="mx-auto max-w-4xl px-6 py-14">
        <div
          className={`flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br sm:h-96 ${caseStudy.gradient}`}
        >
          <ImageIcon className="h-14 w-14 text-paper/50" />
        </div>

        <p className="mt-10 text-lg leading-relaxed text-ink">{caseStudy.shortDescription}</p>

        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-line bg-accent p-7">
          <TrendingUp className="mt-0.5 h-6 w-6 shrink-0 text-forest" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-forest">Results</div>
            <p className="mt-1 font-display text-lg font-semibold text-ink">{caseStudy.results}</p>
          </div>
        </div>
      </SectionReveal>

      <CTASection
        title="Want results like this?"
        description="Let's talk about what's possible for your business."
      />
    </>
  );
}
