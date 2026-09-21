import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

/** Big compressed page opener. Replaces the identical PageHeader band on every page. */
export function SectionIntro({
  eyebrow, title, description, align = "left", children,
}: {
  eyebrow?: string; title: string; description?: string;
  align?: "left" | "center"; children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <section className={`mx-auto max-w-6xl px-6 pb-4 pt-20 md:pt-28 ${centered ? "text-center" : ""}`}>
      <Reveal direction="up">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-lift">{eyebrow}</p>
        )}
        <h1 className="mt-4 font-display text-[clamp(2.75rem,9vw,6.5rem)] font-extrabold uppercase leading-[0.85] tracking-tight text-ink">
          {title}
        </h1>
        {description && (
          <p className={`mt-6 text-lg leading-relaxed text-muted-foreground ${centered ? "mx-auto max-w-2xl" : "max-w-xl"}`}>
            {description}
          </p>
        )}
        {children}
      </Reveal>
    </section>
  );
}
