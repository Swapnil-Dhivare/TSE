import { useMemo, useState } from "react";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { EventCard } from "@/components/events/EventCard";
import { useEvents } from "@/hooks/queries/useEvents";
import { cn } from "@/lib/utils";

const FILTERS = ["Upcoming", "This month", "Past"] as const;
type Filter = (typeof FILTERS)[number];

function Skeleton() {
  return (
    <div className="h-80 animate-pulse rounded-2xl border border-line bg-card">
      <div className="h-40 rounded-t-2xl bg-muted" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function EventList() {
  const { data: events, isLoading, isError } = useEvents();
  const [filter, setFilter] = useState<Filter>("Upcoming");

  const filtered = useMemo(() => {
    const now = Date.now();
    const list = events ?? [];
    if (filter === "Past") return list.filter((e) => new Date(e.starts_at).getTime() < now);
    if (filter === "This month") {
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      return list.filter((e) => {
        const t = new Date(e.starts_at).getTime();
        return t >= now && t <= end.getTime();
      });
    }
    return list.filter((e) => new Date(e.starts_at).getTime() >= now);
  }, [events, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="What's on"
        description="Workshops, clinics and mixers we host. Small rooms, real takeaways."
      />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap justify-center gap-3">
          {FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(label)}
              className={cn(
                "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                filter === label
                  ? "border-brand bg-brand text-paper"
                  : "border-line bg-card text-ink hover:border-brand/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-card p-16 text-center text-muted-foreground">
            We couldn't load events just now. Please refresh.
          </div>
        ) : filtered.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-card p-16 text-center text-muted-foreground">
            No {filter.toLowerCase()} events right now — check back soon.
          </div>
        )}
      </section>

      <CTASection
        title="Want us to run an event for your team?"
        description="We design and run private workshops too."
      />
    </>
  );
}
