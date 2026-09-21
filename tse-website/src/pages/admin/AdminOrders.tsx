import { useQuery } from "@tanstack/react-query";
import { adminListOrders } from "@/api/admin";
import { qk } from "@/lib/query-keys";
import { formatPaise } from "@/lib/format";

const STATUS: Record<string, string> = {
  paid: "bg-brand/15 text-brand-lift",
  awaiting_payment: "bg-surface-2 text-muted-foreground",
  expired: "bg-surface-2 text-muted-foreground",
  failed: "bg-heat/15 text-heat",
  refunded: "bg-heat/15 text-heat",
};

export default function AdminOrders() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: qk.admin.orders(), queryFn: adminListOrders,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="font-display text-4xl font-bold uppercase text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every booking, newest first.</p>

      {error && (
        <div className="mt-8 rounded-xl border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : orders?.length ? (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left font-mono text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4">Order</th><th className="p-4">Buyer</th>
                <th className="p-4">Total</th><th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-line bg-surface">
                  <td className="p-4 font-mono text-xs text-ink">{o.order_number}</td>
                  <td className="p-4 text-muted-foreground">{o.buyer_email}</td>
                  <td className="p-4 font-mono tabular-nums text-ink">{formatPaise(o.total_paise)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-12 text-center text-muted-foreground">
          No orders yet.
        </div>
      )}
    </div>
  );
}
