import { requireSupabase } from "@/lib/supabase";
import type { EventRow, TicketTypeRow } from "@/types/database.types";

export interface EventInput {
  slug: string; title: string; subtitle?: string | null; description?: string | null;
  category?: string | null; venue_name?: string | null; city?: string | null;
  is_online: boolean; starts_at: string; ends_at?: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  cover_image_url?: string | null;
}

export interface TierInput {
  id?: string; name: string; description?: string | null;
  price_paise: number; quantity_total: number; max_per_order: number; sort_order: number;
}

export async function adminListEvents(): Promise<EventRow[]> {
  const sb = requireSupabase();
  const { data, error } = await sb.from("events").select("*")
    .is("deleted_at", null).order("starts_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as EventRow[];
}

export async function adminGetEvent(id: string) {
  const sb = requireSupabase();
  const [{ data: event, error }, { data: tiers }] = await Promise.all([
    sb.from("events").select("*").eq("id", id).single(),
    sb.from("ticket_types").select("*").eq("id", id).is("deleted_at", null),
  ]);
  if (error) throw error;
  const { data: realTiers } = await sb.from("ticket_types").select("*")
    .eq("event_id", id).is("deleted_at", null).order("sort_order");
  void tiers;
  return {
    event: event as unknown as EventRow,
    tiers: (realTiers ?? []) as unknown as TicketTypeRow[],
  };
}

export async function adminSaveEvent(input: EventInput, id?: string): Promise<EventRow> {
  const sb = requireSupabase();
  const q = id
    ? sb.from("events").update(input).eq("id", id).select().single()
    : sb.from("events").insert(input).select().single();
  const { data, error } = await q;
  if (error) throw new Error(friendly(error.message));
  return data as unknown as EventRow;
}

export async function adminSaveTier(eventId: string, tier: TierInput) {
  const sb = requireSupabase();
  const payload = { ...tier, event_id: eventId };
  const q = tier.id
    ? sb.from("ticket_types").update(payload).eq("id", tier.id).select().single()
    : sb.from("ticket_types").insert(payload).select().single();
  const { data, error } = await q;
  if (error) throw new Error(friendly(error.message));
  return data as unknown as TicketTypeRow;
}

export async function adminDeleteTier(tierId: string) {
  const sb = requireSupabase();
  // Soft delete: tickets reference tiers, so hard deletion would break history.
  const { error } = await sb.from("ticket_types")
    .update({ deleted_at: new Date().toISOString() }).eq("id", tierId);
  if (error) throw new Error(friendly(error.message));
}

export async function adminDeleteEvent(id: string) {
  const sb = requireSupabase();
  const { error } = await sb.from("events")
    .update({ deleted_at: new Date().toISOString(), status: "cancelled" }).eq("id", id);
  if (error) throw new Error(friendly(error.message));
}

export async function adminListOrders() {
  const sb = requireSupabase();
  const { data, error } = await sb.from("orders").select("*")
    .order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return data ?? [];
}

function friendly(raw: string): string {
  if (raw.includes("row-level security"))
    return "You don't have admin access. Add your user to user_roles with role 'admin'.";
  if (raw.includes("duplicate key") && raw.includes("slug"))
    return "That slug is already used by another event.";
  return raw;
}
