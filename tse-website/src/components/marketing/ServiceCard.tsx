import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/content/services";
import { TiltCard } from "./TiltCard";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <Link
      to="/services"
      className="group block overflow-hidden rounded-2xl border border-line bg-card shadow-sm shadow-ink/5 transition-shadow duration-300 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-brand via-heat to-brand bg-[length:200%_100%] opacity-80 transition-[background-position] duration-700 group-hover:bg-[position:100%_0]" />
      <TiltCard className="flex flex-col p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-heat/10 text-void transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-display text-xl font-semibold text-ink">{service.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.tagline}</p>
        <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-void">
          Learn more
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </TiltCard>
    </Link>
  );
}
