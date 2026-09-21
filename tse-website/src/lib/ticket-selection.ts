/**
 * Ticket selection lives in the URL (`?t=tierId:2,tierId:1`) so it survives the
 * full-page OAuth redirect. React state and context are destroyed by that
 * navigation; the URL is what lets a user land back in checkout with their
 * quantities intact. It is user-editable, so parse defensively.
 */
export type Selection = Record<string, number>;

export function serialiseSelection(sel: Selection): string {
  return Object.entries(sel)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => `${id}:${q}`)
    .join(",");
}

export function parseSelection(raw: string | null): Selection {
  if (!raw) return {};
  const out: Selection = {};
  for (const part of raw.split(",")) {
    const [id, rawQty] = part.split(":");
    if (!id) continue;
    const qty = Number(rawQty);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 50) continue;
    out[id] = qty;
  }
  return out;
}
