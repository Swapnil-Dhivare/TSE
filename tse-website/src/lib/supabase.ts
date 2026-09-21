import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isPlatformConfigured } from "./env";

/**
 * Exactly one client instance for the whole app. A second instance causes duplicate
 * onAuthStateChange listeners and token-refresh races that log users out.
 *
 * Intentionally untyped: run `npx supabase gen types typescript --linked` once the
 * project exists and add the <Database> generic. Until then, api/ casts to the
 * domain types in src/types/database.types.ts at the boundary.
 */
export const supabase: SupabaseClient | null = isPlatformConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "tse.auth",
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env",
    );
  }
  return supabase;
}
