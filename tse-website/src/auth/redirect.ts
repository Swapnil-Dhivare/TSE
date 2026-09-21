/** `next` comes from a URL, so it is attacker-controlled. Only allow same-origin paths. */
export function safeNext(raw: string | null, fallback = "/account"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
