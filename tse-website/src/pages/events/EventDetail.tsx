import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, MapPin, Minus, Plus, Video } from "lucide-react";
import { CTASection } from "@/components/marketing/CTASection";
import { GlowOrbs } from "@/components/marketing/GlowOrbs";
import { useEvent } from "@/hooks/queries/useEvents";
import { formatEventDate, formatEventTime, formatPaise } from "@/lib/format";
import { serialiseSelection } from "@/lib/ticket-selection";

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, isError } = useEvent(slug);
  const [qty, setQty] = useState<Record<string, number>>({});

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-28 text-center text-muted-foreground">Loading event…</div>;
  }
  if (isError || !event) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Event not found</h1>
        <p className="mt-3 text-muted-foreground">This event doesn't exist or is no longer listed.</p>
        <Link to="/events" className="mt-8 inline-flex rounded-full bg-void px-6 py-3 font-semibold text-paper">
          Browse events
        </Link>
      </div>
    );
  }

  const total = event.ticket_types.reduce(
    (sum, t) => sum + (qty[t.ticket_type_id] ?? 0) * t.price_paise, 0,
  );
  const count = Object.values(qty).reduce((a, b) => a + b, 0);
  const selection = serialiseSelection(qty);

  function setQuantity(id: string, next: number, max: number) {
    setQty((prev) => ({ ...prev, [id]: Math.max(0, Math.min(next, max)) }));
  }

  return (
    <>
      <section className="relative overflow-hidden bg-void bg-dot-grid-dark text-paper">
        <GlowOrbs />
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
          <Link to="/events" className="flex w-fit items-center gap-1.5 text-sm text-paper/70 hover:text-paper">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>
          {event.category && (
            <span className="mt-6 inline-block w-fit rounded-full bg-paper/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
              {event.category}
            </span>
          )}
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{event.title}</h1>
          {event.subtitle && <p className="mt-4 max-w-2xl text-lg text-paper/75">{event.subtitle}</p>}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm text-paper/70">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatEventDate(event.starts_at)}</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{formatEventTime(event.starts_at)}</span>
            <span className="flex items-center gap-2">
              {event.is_online ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              {event.is_online ? "Online" : [event.venue_name, event.city].filter(Boolean).join(", ")}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-14 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">About this event</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm shadow-ink/5 lg:sticky lg:top-24">
          <h3 className="font-display text-lg font-semibold text-ink">Tickets</h3>
          <div className="mt-4 space-y-3">
            {event.ticket_types.map((tier) => {
              const selected = qty[tier.ticket_type_id] ?? 0;
              const max = Math.min(tier.max_per_order, tier.quantity_available);
              return (
                <div
                  key={tier.ticket_type_id}
                  className={`rounded-xl border p-4 transition-colors ${selected > 0 ? "border-brand bg-brand/5" : "border-line"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{tier.name}</div>
                      {tier.description && (
                        <div className="mt-0.5 text-xs text-muted-foreground">{tier.description}</div>
                      )}
                      {tier.on_sale && tier.quantity_available <= 10 && (
                        <div className="mt-1 text-xs font-semibold text-heat">
                          {tier.quantity_available} left
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 font-mono font-semibold text-ink">
                      {formatPaise(tier.price_paise)}
                    </div>
                  </div>

                  {tier.on_sale ? (
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <button
                        type="button" aria-label={`Remove one ${tier.name}`}
                        onClick={() => setQuantity(tier.ticket_type_id, selected - 1, max)}
                        disabled={selected === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"
                      ><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center font-mono font-semibold tabular-nums">{selected}</span>
                      <button
                        type="button" aria-label={`Add one ${tier.name}`}
                        onClick={() => setQuantity(tier.ticket_type_id, selected + 1, max)}
                        disabled={selected >= max}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"
                      ><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : (
                    <div className="mt-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sold out
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-mono text-xl font-bold tabular-nums text-ink">{formatPaise(total)}</span>
          </div>

          {count > 0 ? (
            <Link
              to={`/events/${event.slug}/checkout?t=${encodeURIComponent(selection)}`}
              className="mt-4 block rounded-full bg-brand px-6 py-3 text-center font-semibold text-paper transition-transform hover:-translate-y-0.5"
            >
              Continue
            </Link>
          ) : (
            <button
              type="button" disabled
              className="mt-4 w-full cursor-not-allowed rounded-full bg-muted px-6 py-3 font-semibold text-muted-foreground"
            >
              Select a ticket
            </button>
          )}
        </aside>
      </section>

      <CTASection title="Can't make this one?" description="We run events regularly — see what else is coming up." ctaLabel="Browse all events" to="/events" />
    </>
  );
}
