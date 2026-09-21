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
  sendMagicLink: (email: string, opts?: { next?: string; signUp?: boolean; fullName?: string }) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
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

  const userId = session?.user?.id;
  useEffect(() => {
    if (!supabase || !userId) { setRoles([]); return; }
    let alive = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (alive) setRoles((data ?? []).map((r: { role: string }) => r.role));
      });
    return () => { alive = false; };
  }, [userId]);

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      status,
      session,
      user,
      // Read from public.user_roles — the same table every RLS policy checks.
      // Using the JWT's app_metadata instead would let the UI and the database
      // disagree, and user_metadata is user-writable so it must never be used.
      isAdmin: roles.some((r) => r === "admin" || r === "staff"),
      async signInWithGoogle(next?: string) {
        if (!supabase) throw new Error("Auth is not configured");
        const target = next ? `?next=${encodeURIComponent(next)}` : "";
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback${target}` },
        });
      },
      async sendMagicLink(email, opts = {}) {
        if (!supabase) throw new Error("Auth is not configured");
        const { next, signUp = false, fullName } = opts;
        const target = next ? `?next=${encodeURIComponent(next)}` : "";
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback${target}`,
            // Sign-in must NOT silently create an account, otherwise a typo'd
            // address quietly makes a second empty account instead of erroring.
            shouldCreateUser: signUp,
            ...(signUp && fullName ? { data: { full_name: fullName } } : {}),
          },
        });
        if (error) {
          if (/signups not allowed|not allowed for otp|user not found/i.test(error.message)) {
            throw new Error("NO_ACCOUNT");
          }
          throw error;
        }
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
  }, [session, status, roles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
