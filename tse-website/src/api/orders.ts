import { requireSupabase } from "@/lib/supabase";
import type { OrderRow, TicketRow } from "@/types/database.types";

export interface CreateOrderInput {
  eventId: string;
  items: { ticket_type_id: string; quantity: number }[];
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  idempotencyKey: string;
}

export interface OrderSummary {
  order_id: string;
  order_number: string;
  status: string;
  total_paise: number;
  currency: string;
  hold_expires_at: string | null;
  server_time: string;
}

/**
 * Reserves inventory and creates the order. Note what is NOT sent: any price.
 * The RPC recomputes every amount from ticket_types server-side.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderSummary> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc("create_order", {
    p_event_id: input.eventId,
    p_items: input.items,
    p_buyer_name: input.buyerName,
    p_buyer_email: input.buyerEmail,
    p_buyer_phone: input.buyerPhone ?? null,
    p_idempotency_key: input.idempotencyKey,
  });
  if (error) throw new Error(mapOrderError(error.message));
  return data as unknown as OrderSummary;
}

function mapOrderError(raw: string): string {
  if (raw.includes("SOLD_OUT")) return "Those tickets just sold out. Please pick again.";
  if (raw.includes("SALES_ENDED")) return "Sales for this event have closed.";
  if (raw.includes("SALES_NOT_STARTED")) return "Sales haven't opened yet.";
  if (raw.includes("QUANTITY_OUT_OF_RANGE")) return "That quantity isn't allowed for this ticket.";
  if (raw.includes("EVENT_NOT_ON_SALE")) return "This event isn't on sale.";
  if (raw.includes("AUTH_REQUIRED")) return "Please sign in to book.";
  return "We couldn't reserve those tickets. Please try again.";
}

export async function listMyOrders() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OrderRow[];
}

export async function listMyTickets() {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("tickets").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as TicketRow[];
}
