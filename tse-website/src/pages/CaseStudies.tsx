import { useMemo, useState } from "react";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CaseStudyCard } from "@/components/marketing/CaseStudyCard";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionReveal } from "@/components/marketing/SectionReveal";
import { cn } from "@/lib/utils";
import { SERVICE_CATEGORIES } from "@/content/services";
import { CASE_STUDIES } from "@/content/case-studies";

const FILTERS = ["All", ...SERVICE_CATEGORIES] as const;

export default function CaseStudies() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? CASE_STUDIES
        : CASE_STUDIES.filter((caseStudy) => caseStudy.serviceCategory === filter),
    [filter],
  );

  return (
    <>
      <PageHeader eyebrow="Our work" title="Real results for real businesses" />

      <SectionReveal className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap justify-center gap-3">
          {FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(label)}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                filter === label
                  ? "border-void bg-void text-paper"
                  : "border-line bg-card text-ink hover:border-void/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {filtered.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-card p-16 text-center text-muted-foreground">
            No case studies in {filter} yet — try another filter.
          </div>
        )}
      </SectionReveal>

      <CTASection
        title="Want to be our next case study?"
        description="Let's talk about what growth could look like for your business."
      />
    </>
  );
}
