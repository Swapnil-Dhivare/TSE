import { AnimatedCounter } from "./AnimatedCounter";

const STATS = [
  { value: "3", label: "Core services, done properly" },
  { value: "100%", label: "Focus on results, not vanity metrics" },
  { value: "1", label: "Dedicated team, no hand-offs" },
];

export function StatBand() {
  return (
    <div className="grid grid-cols-1 divide-y divide-line rounded-2xl border border-line bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {STATS.map((stat) => (
        <div key={stat.label} className="px-8 py-8 text-center">
          <div className="font-display text-4xl font-bold text-forest">
            <AnimatedCounter value={stat.value} />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
