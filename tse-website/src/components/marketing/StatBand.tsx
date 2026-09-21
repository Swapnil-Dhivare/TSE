import { Layers, Target, Users } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

const STATS = [
  {
    value: "3",
    label: "Core services, done properly",
    icon: Layers,
    accent: "text-lime",
    tint: "bg-lime/10",
  },
  {
    value: "100%",
    label: "Focus on results, not vanity metrics",
    icon: Target,
    accent: "text-coral",
    tint: "bg-coral/10",
  },
  {
    value: "1",
    label: "Dedicated team, no hand-offs",
    icon: Users,
    accent: "text-forest",
    tint: "bg-forest/10",
  },
];

export function StatBand() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl border border-line ${stat.tint} px-8 py-8 text-center shadow-sm shadow-ink/5`}
          >
            <Icon className={`mx-auto h-6 w-6 ${stat.accent}`} />
            <div className={`mt-3 font-display text-4xl font-bold ${stat.accent}`}>
              <AnimatedCounter value={stat.value} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}
