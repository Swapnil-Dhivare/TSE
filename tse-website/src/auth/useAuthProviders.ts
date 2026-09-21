import { useEffect, useState } from "react";
import { env, isPlatformConfigured } from "@/lib/env";

export interface EnabledProviders {
  loading: boolean;
  email: boolean;
  google: boolean;
  phone: boolean;
  any: boolean;
}

/**
 * Supabase exposes which auth methods a project has switched on. Reading it means
 * we only render methods that actually work — offering a disabled provider just
 * dead-ends the user on a raw 400 "provider is not enabled" JSON page.
 */
export function useAuthProviders(): EnabledProviders {
  const [state, setState] = useState<EnabledProviders>({
    loading: isPlatformConfigured, email: false, google: false, phone: false, any: false,
  });

  useEffect(() => {
    if (!isPlatformConfigured) return;
    let alive = true;
    fetch(`${env.supabaseUrl}/auth/v1/settings`, { headers: { apikey: env.supabaseAnonKey } })
      .then((r) => r.json())
      .then((d: { external?: Record<string, boolean> }) => {
        if (!alive) return;
        const e = d.external ?? {};
        setState({
          loading: false,
          email: Boolean(e.email), google: Boolean(e.google), phone: Boolean(e.phone),
          any: Boolean(e.email || e.google || e.phone),
        });
      })
      .catch(() => alive && setState((s) => ({ ...s, loading: false })));
    return () => { alive = false; };
  }, []);

  return state;
}
