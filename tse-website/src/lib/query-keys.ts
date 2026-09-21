/** Single source of query keys. User-scoped keys embed userId so a sign-out/sign-in
 *  as a different user can never serve the previous user's data from cache. */
export const qk = {
  events: {
    all: ["events"] as const,
    list: (filters: Record<string, unknown>) => ["events", "list", filters] as const,
    detail: (slug: string) => ["events", "detail", slug] as const,
    availability: (eventId: string) => ["events", eventId, "availability"] as const,
  },
  me: {
    orders: (uid: string) => ["me", uid, "orders"] as const,
    order: (uid: string, id: string) => ["me", uid, "orders", id] as const,
    tickets: (uid: string) => ["me", uid, "tickets"] as const,
  },
  admin: {
    events: () => ["admin", "events"] as const,
    event: (id: string) => ["admin", "events", id] as const,
    orders: () => ["admin", "orders"] as const,
  },
} as const;
