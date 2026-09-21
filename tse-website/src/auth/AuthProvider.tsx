import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isPlatformConfigured } from "@/lib/env";
import { queryClient } from "@/lib/query-client";

/** Three states, not two. Redirecting while 'loading' bounces a signed-in user off
 *  protected routes on every hard refresh, because getSession() is async. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  signInWithGoogle: (next?: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isPlatformConfigured ? "loading" : "unauthenticated",
  );

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      // Never await a Supabase call in here — the client holds a lock and it deadlocks.
      setSession(next);
      setStatus(next ? "authenticated" : "unauthenticated");
      if (event === "SIGNED_OUT") queueMicrotask(() => queryClient.clear());
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      status,
      session,
      user,
      // Role comes from app_metadata (server-controlled). user_metadata is
      // user-writable via updateUser() and must never be trusted for this.
      isAdmin: ["admin", "staff"].includes(String(user?.app_metadata?.role ?? "")),
      async signInWithGoogle(next?: string) {
        if (!supabase) throw new Error("Auth is not configured");
        const target = next ? `?next=${encodeURIComponent(next)}` : "";
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback${target}` },
        });
      },
      async sendPhoneOtp(phone: string) {
        if (!supabase) throw new Error("Auth is not configured");
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
      },
      async verifyPhoneOtp(phone: string, token: string) {
        if (!supabase) throw new Error("Auth is not configured");
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
        if (error) throw error;
      },
      async signOut() {
        await supabase?.auth.signOut();
      },
    };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
