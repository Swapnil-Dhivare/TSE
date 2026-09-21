import { cn } from "@/lib/utils";

export function GlowOrbs({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-lime/25 blur-[90px]" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-coral/20 blur-[90px]" />
    </div>
  );
}
