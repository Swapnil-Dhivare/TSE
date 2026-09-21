import { useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useEvent } from "@/hooks/queries/useEvents";
import { useAuth } from "@/auth/AuthProvider";
import { parseSelection } from "@/lib/ticket-selection";
import { formatPaise } from "@/lib/format";
import { createOrder } from "@/api/orders";
import { isPlatformConfigured } from "@/lib/env";

type Phase = "review" | "creating" | "paying" | "error";

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const { data: event, isLoading } = useEvent(slug);
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("review");
  const [error, setError] = useState("");
  // Generated once per checkout session. This — not the disabled button — is what
  // actually prevents a duplicate order from two tabs or a fast double-tap.
  const idempotencyKey = useRef(crypto.randomUUID());

  const selection = useMemo(() => parseSelection(params.get("t")), [params]);

  const lines = useMemo(() => {
    if (!event) return [];
    return event.ticket_types
      .filter((t) => selection[t.ticket_type_id])
      .map((t) => ({
        tier: t,
        qty: Math.min(selection[t.ticket_type_id] ?? 0, t.quantity_available),
      }));
  }, [event, selection]);

  const total = lines.reduce((sum, l) => sum + l.qty * l.tier.price_paise, 0);

  async function handlePay() {
    if (!event) return;
    setPhase("creating"); setError("");
    try {
      const result = await createOrder({
        eventId: event.id,
        items: lines.map((l) => ({ ticket_type_id: l.tier.ticket_type_id, quantity: l.qty })),
        buyerName: user?.user_metadata?.full_name ?? user?.email ?? "Guest",
        buyerEmail: user?.email ?? "",
        buyerPhone: user?.phone ?? null,
        idempotencyKey: idempotencyKey.current,
      });
      if (result.status === "paid") {
        window.location.assign(`/account/orders/${result.order_id}`);
        return;
      }
      setPhase("paying");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setPhase("error");
    }
  }

  if (isLoading) return <div className="mx-auto max-w-2xl px-6 py-28 text-center text-muted-foreground">Loading…</div>;
  if (!event) return <div className="mx-auto max-w-2xl px-6 py-28 text-center">Event not found.</div>;

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">No tickets selected</h1>
        <Link to={`/events/${event.slug}`} className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-paper">
          Back to event
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Checkout</h1>
        <p className="mt-2 text-muted-foreground">{event.title}</p>

        {!isPlatformConfigured && (
          <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
            Payments aren't connected yet. Configure Supabase + Razorpay to take real bookings.
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">{error}</div>
        )}

        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Your details</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="text-ink">{user?.user_metadata?.full_name ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-ink">{user?.email ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-brand" />
          Card details are handled by Razorpay and never touch our servers.
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          {lines.map((l) => (
            <div key={l.tier.ticket_type_id} className="flex justify-between">
              <span className="text-muted-foreground">{l.qty} × {l.tier.name}</span>
              <span className="font-mono tabular-nums text-ink">{formatPaise(l.qty * l.tier.price_paise)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <span className="font-semibold text-ink">Total</span>
          <span className="font-mono text-xl font-bold tabular-nums text-ink">{formatPaise(total)}</span>
        </div>
        <button
          type="button"
          onClick={handlePay}
          disabled={phase === "creating" || phase === "paying"}
          className="mt-5 w-full rounded-full bg-brand px-6 py-3 font-semibold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {phase === "creating" ? "Reserving your tickets…"
            : phase === "paying" ? "Opening payment…"
            : total === 0 ? "Confirm free booking" : `Pay ${formatPaise(total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Tickets are held for 15 minutes while you pay.
        </p>
      </aside>
    </div>
  );
}
