import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 font-display font-semibold", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-paper font-display font-bold text-lg">
        T
      </span>
      <span className={cn("text-lg tracking-tight", inverted ? "text-paper" : "text-ink")}>
        TSE <span className={inverted ? "text-brand" : "text-brand-lift"}>Agency</span>
      </span>
    </Link>
  );
}
