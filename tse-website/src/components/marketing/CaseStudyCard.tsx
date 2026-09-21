import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import type { CaseStudy } from "@/content/case-studies";
import { TiltCard } from "./TiltCard";

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <Link
      to={`/case-studies/${caseStudy.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-sm shadow-ink/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-void/10"
    >
      <TiltCard className="flex flex-col">
        <div
          className={`flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${caseStudy.gradient}`}
        >
          {caseStudy.image ? (
            <img
              src={caseStudy.image.src}
              alt={caseStudy.image.alt}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-paper/50 transition-transform duration-500 group-hover:scale-125" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold text-brand-lift">
            {caseStudy.serviceCategory}
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">
            {caseStudy.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {caseStudy.shortDescription}
          </p>
          <div className="mt-5 border-t border-line pt-4 text-xs text-muted-foreground">
            {caseStudy.clientName}
          </div>
        </div>
      </TiltCard>
    </Link>
  );
}
