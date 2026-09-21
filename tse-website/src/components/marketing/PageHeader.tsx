import type { ReactNode } from "react";
import { GlowOrbs } from "./GlowOrbs";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-void bg-dot-grid-dark text-paper">
      <GlowOrbs />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
        <span className="inline-block rounded-full bg-paper/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
          {eyebrow}
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-5 text-lg text-paper/75">{description}</p>}
        {children}
      </div>
    </section>
  );
}
