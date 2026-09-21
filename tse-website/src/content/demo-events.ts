import type { EventWithTickets } from "@/types/database.types";

/**
 * Fallback data used only when Supabase isn't configured yet, so the events UI is
 * fully browsable in local dev. Real data replaces this automatically once
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set.
 */
const soon = (days: number, hour = 19) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const DEMO_EVENTS: EventWithTickets[] = [
  {
    id: "demo-1", slug: "brand-systems-workshop",
    title: "Building Your First Brand System",
    subtitle: "A hands-on workshop for founders and in-house marketers",
    description:
      "Spend an evening building the actual thing: a colour system, a type scale, and a set of rules your team can apply without you in the room. You'll leave with a working system, not a moodboard.",
    cover_image_url: null, category: "Workshop",
    venue_name: "Hub Studio", venue_address: "Baner Road", city: "Pune",
    is_online: false, online_url: null,
    starts_at: soon(9), ends_at: soon(9, 22),
    registration_opens_at: null, registration_closes_at: null,
    status: "published", created_at: soon(-20),
    ticket_types: [
      { ticket_type_id: "d1-t1", event_id: "demo-1", name: "Early Bird",
        description: "Entry + welcome drink", price_paise: 49900, min_per_order: 1,
        max_per_order: 4, sort_order: 0, quantity_available: 6, on_sale: true },
      { ticket_type_id: "d1-t2", event_id: "demo-1", name: "General",
        description: "Entry", price_paise: 89900, min_per_order: 1,
        max_per_order: 6, sort_order: 1, quantity_available: 40, on_sale: true },
    ],
  },
  {
    id: "demo-2", slug: "social-growth-clinic",
    title: "Social Growth Clinic: Reels That Actually Convert",
    subtitle: "Bring your account, leave with a 30-day plan",
    description:
      "We audit real accounts live and rebuild the content plan in front of you. Limited to 25 seats so everyone gets looked at.",
    cover_image_url: null, category: "Clinic",
    venue_name: null, venue_address: null, city: null,
    is_online: true, online_url: null,
    starts_at: soon(21, 18), ends_at: soon(21, 20),
    registration_opens_at: null, registration_closes_at: null,
    status: "published", created_at: soon(-8),
    ticket_types: [
      { ticket_type_id: "d2-t1", event_id: "demo-2", name: "Free seat",
        description: "Online, live only — not recorded", price_paise: 0,
        min_per_order: 1, max_per_order: 2, sort_order: 0,
        quantity_available: 25, on_sale: true },
    ],
  },
  {
    id: "demo-3", slug: "founders-mixer",
    title: "Founders Mixer",
    subtitle: "No pitches, no panels — just the people building things",
    description: "An evening of actual conversation. Limited capacity, and it always fills.",
    cover_image_url: null, category: "Networking",
    venue_name: "The Terrace", venue_address: "Koregaon Park", city: "Pune",
    is_online: false, online_url: null,
    starts_at: soon(3), ends_at: soon(3, 23),
    registration_opens_at: null, registration_closes_at: null,
    status: "published", created_at: soon(-30),
    ticket_types: [
      { ticket_type_id: "d3-t1", event_id: "demo-3", name: "Entry",
        description: "Includes one drink", price_paise: 29900, min_per_order: 1,
        max_per_order: 2, sort_order: 0, quantity_available: 0, on_sale: false },
    ],
  },
];
