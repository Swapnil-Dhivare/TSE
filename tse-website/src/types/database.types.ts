/**
 * Hand-written to match supabase/migrations. Regenerate once the project is linked:
 *   npx supabase gen types typescript --linked > src/types/database.types.ts
 */
export type EventStatus = "draft" | "published" | "sold_out" | "cancelled" | "completed";
export type OrderStatus =
  | "awaiting_payment" | "paid" | "failed" | "cancelled" | "expired" | "refunded";
export type TicketStatus = "issued" | "checked_in" | "cancelled" | "refunded";
export type AppRole = "customer" | "staff" | "admin";

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  category: string | null;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  is_online: boolean;
  online_url: string | null;
  starts_at: string;
  ends_at: string | null;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  status: EventStatus;
  created_at: string;
}

export interface TicketTypeRow {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_paise: number;
  quantity_total: number;
  quantity_reserved: number;
  quantity_sold: number;
  min_per_order: number;
  max_per_order: number;
  sales_start_at: string | null;
  sales_end_at: string | null;
  is_active: boolean;
  sort_order: number;
}

/** From the ticket_availability view — never expose raw counters to the client. */
export interface TicketAvailabilityRow {
  ticket_type_id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_paise: number;
  min_per_order: number;
  max_per_order: number;
  sort_order: number;
  quantity_available: number;
  on_sale: boolean;
}

export interface OrderRow {
  id: string;
  order_number: string;
  user_id: string;
  event_id: string;
  status: OrderStatus;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  subtotal_paise: number;
  total_paise: number;
  currency: string;
  hold_expires_at: string | null;
  razorpay_order_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface TicketRow {
  id: string;
  order_id: string;
  event_id: string;
  ticket_type_id: string;
  user_id: string;
  code: string;
  status: TicketStatus;
  attendee_name: string | null;
  checked_in_at: string | null;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

/** Minimal shape so createClient<Database> is typed without the generated file. */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow> };
      events: { Row: EventRow; Insert: Partial<EventRow>; Update: Partial<EventRow> };
      ticket_types: {
        Row: TicketTypeRow; Insert: Partial<TicketTypeRow>; Update: Partial<TicketTypeRow>;
      };
      orders: { Row: OrderRow; Insert: Partial<OrderRow>; Update: Partial<OrderRow> };
      tickets: { Row: TicketRow; Insert: Partial<TicketRow>; Update: Partial<TicketRow> };
    };
    Views: {
      ticket_availability: { Row: TicketAvailabilityRow };
    };
    Functions: Record<string, never>;
    Enums: {
      event_status: EventStatus;
      order_status: OrderStatus;
      ticket_status: TicketStatus;
      app_role: AppRole;
    };
  };
}

export interface EventWithTickets extends EventRow {
  ticket_types: TicketAvailabilityRow[];
}
