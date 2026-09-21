import { Link } from "react-router-dom";
import { MapPin, Video } from "lucide-react";
import type { EventWithTickets } from "@/types/database.types";
import { dateParts, formatEventTime, formatPaise } from "@/lib/format";

function priceLabel(event: EventWithTickets): string {
  const tiers = event.ticket_types;
  if (!tiers.length) return "";
  const min = Math.min(...tiers.map((t) => t.price_paise));
  if (min === 0) return "Free";
  return tiers.length > 1 ? `from ${formatPaise(min)}` : formatPaise(min);
}

/** At most one status pill. Priority: sold out > low stock > free. */
function StatusPill({ event }: { event: EventWithTickets }) {
  const total = event.ticket_types.reduce((n, t) => n + t.quantity_available, 0);
  const anyOnSale = event.ticket_types.some((t) => t.on_sale);
  if (!anyOnSale || total === 0) {
    return <span className="rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-paper">Sold out</span>;
  }
  if (total <= 10) {
    return <span className="rounded-full bg-heat px-2.5 py-1 text-xs font-semibold text-paper">{total} left</span>;
  }
  if (event.ticket_types.every((t) => t.price_paise === 0)) {
    return <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-paper">Free</span>;
  }
  return null;
}

export function EventCard({ event }: { event: EventWithTickets }) {
  const { day, month, weekday } = dateParts(event.starts_at);
  const soldOut = event.ticket_types.every((t) => !t.on_sale);

  return (
    <Link
      to={`/events/${event.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-sm shadow-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 ${soldOut ? "opacity-70" : ""}`}
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-void via-void to-brand">
        <div className="absolute left-4 top-4 rounded-lg bg-card/90 px-3 py-2 text-center leading-none backdrop-blur">
          <div className="font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">{weekday}</div>
          <div className="font-display text-xl font-bold text-ink">{day}</div>
          <div className="font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">{month}</div>
        </div>
        <div className="absolute right-4 top-4"><StatusPill event={event} /></div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {event.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">{event.category}</span>
        )}
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-ink">
          {event.title}
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          {event.is_online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
          <span className="truncate">
            {[
              formatEventTime(event.starts_at),
              event.is_online ? "Online" : [event.venue_name, event.city].filter(Boolean).join(", "),
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="font-mono text-sm font-semibold text-ink">{priceLabel(event)}</span>
          <span className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100">
            {soldOut ? "View" : "Book →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
