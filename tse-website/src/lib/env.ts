/**
 * Client env. Everything here is PUBLIC — it ships in the JS bundle.
 * Never put a service-role key, Razorpay secret or webhook secret in a VITE_ var.
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";

export const env = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  formEndpoint: import.meta.env.VITE_FORM_ENDPOINT?.trim() ?? "",
  siteUrl: import.meta.env.VITE_SITE_URL?.trim() || window.location.origin,
};

/**
 * The platform (accounts, events, booking) needs Supabase. Until it's configured the
 * marketing site must still run, so every platform surface checks this instead of
 * throwing at import time.
 */
export const isPlatformConfigured = Boolean(url && anonKey);
