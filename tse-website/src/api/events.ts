import { supabase } from "@/lib/supabase";
import { isPlatformConfigured } from "@/lib/env";
import { DEMO_EVENTS } from "@/content/demo-events";
import type { EventRow, EventWithTickets, TicketAvailabilityRow } from "@/types/database.types";

export async function listEvents(): Promise<EventWithTickets[]> {
  if (!supabase || !isPlatformConfigured) return DEMO_EVENTS;

  const { data: eventsRaw, error } = await supabase
    .from("events")
    .select("*")
    .in("status", ["published", "sold_out"])
    .is("deleted_at", null)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  const events = (eventsRaw ?? []) as unknown as EventRow[];
  if (!events.length) return [];

  const { data: tiersRaw, error: tierError } = await supabase
    .from("ticket_availability")
    .select("*")
    .in("event_id", events.map((e) => e.id));
  if (tierError) throw tierError;
  const tiers = (tiersRaw ?? []) as unknown as TicketAvailabilityRow[];

  return events.map((e) => ({
    ...e,
    ticket_types: tiers.filter((t) => t.event_id === e.id),
  }));
}

export async function getEvent(slug: string): Promise<EventWithTickets | null> {
  if (!supabase || !isPlatformConfigured) {
    return DEMO_EVENTS.find((e) => e.slug === slug) ?? null;
  }

  const { data: eventRaw, error } = await supabase
    .from("events").select("*").eq("slug", slug).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  if (!eventRaw) return null;
  const event = eventRaw as unknown as EventRow;

  const { data: detailTiers } = await supabase
    .from("ticket_availability").select("*").eq("event_id", event.id).order("sort_order");

  return { ...event, ticket_types: (detailTiers ?? []) as unknown as TicketAvailabilityRow[] };
}
