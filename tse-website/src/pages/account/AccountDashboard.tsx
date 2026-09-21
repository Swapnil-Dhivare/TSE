import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { listMyTickets } from "@/api/orders";
import { qk } from "@/lib/query-keys";
import { isPlatformConfigured } from "@/lib/env";

export default function AccountDashboard() {
  const { user, signOut } = useAuth();
  const uid = user?.id ?? "anon";
  const { data: tickets, isLoading } = useQuery({
    queryKey: qk.me.tickets(uid),
    queryFn: listMyTickets,
    enabled: isPlatformConfigured && Boolean(user),
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">My tickets</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email ?? user?.phone}</p>
        </div>
        <button
          type="button" onClick={() => void signOut()}
          className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-ink"
        >
          Sign out
        </button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading your tickets…</p>
      ) : tickets?.length ? (
        <div className="mt-8 space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id} to={`/account/tickets/${t.id}`}
              className="flex items-center justify-between rounded-2xl border border-line bg-card p-5 transition-colors hover:border-brand/40"
            >
              <div className="flex items-center gap-4">
                <Ticket className="h-5 w-5 text-brand" />
                <div>
                  <div className="font-mono text-sm font-semibold text-ink">{t.code}</div>
                  <div className="text-xs text-muted-foreground">{t.attendee_name}</div>
                </div>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-brand-lift">
                {t.status}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-card p-16 text-center">
          <p className="text-muted-foreground">No tickets yet.</p>
          <Link to="/events" className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-paper">
            Browse events
          </Link>
        </div>
      )}
    </div>
  );
}
