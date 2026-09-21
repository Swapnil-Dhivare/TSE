import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { adminListEvents } from "@/api/admin";
import { qk } from "@/lib/query-keys";
import { formatEventDate } from "@/lib/format";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-brand/15 text-brand-lift",
  draft: "bg-surface-2 text-muted-foreground",
  cancelled: "bg-heat/15 text-heat",
  completed: "bg-surface-2 text-muted-foreground",
};

export default function AdminEventList() {
  const { data: events, isLoading, error } = useQuery({
    queryKey: qk.admin.events(), queryFn: adminListEvents,
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase text-ink">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage what's on.</p>
        </div>
        <Link to="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> New event
        </Link>
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line">
          {(events ?? []).map((e) => (
            <Link key={e.id} to={`/admin/events/${e.id}`}
              className="flex items-center justify-between gap-4 border-b border-line bg-surface p-5 last:border-b-0 hover:bg-surface-2">
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{e.title}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {formatEventDate(e.starts_at)} · /{e.slug}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[e.status] ?? ""}`}>
                  {e.status}
                </span>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
          {!events?.length && !error && (
            <div className="bg-surface p-12 text-center text-muted-foreground">
              No events yet. Create your first one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
