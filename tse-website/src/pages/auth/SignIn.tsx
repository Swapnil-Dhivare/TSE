import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { isPlatformConfigured } from "@/lib/env";

export default function SignIn() {
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/account";
  const { signInWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePhone(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      if (!sent) { await sendPhoneOtp(phone); setSent(true); }
      else { await verifyPhoneOtp(phone, otp); window.location.assign(next); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="font-display text-3xl font-bold text-ink">Sign in</h1>
      <p className="mt-2 text-muted-foreground">To book tickets and see your bookings.</p>

      {!isPlatformConfigured && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          Accounts aren't connected yet. Add <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to <code className="font-mono">.env</code>.
        </div>
      )}

      <button
        type="button"
        onClick={() => signInWithGoogle(next)}
        disabled={!isPlatformConfigured}
        className="mt-8 rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink transition-colors hover:border-void/40 disabled:opacity-50"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handlePhone} className="space-y-3">
        <input
          value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210" inputMode="tel" required disabled={sent}
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        {sent && (
          <input
            value={otp} onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code" inputMode="numeric" autoComplete="one-time-code" required
            className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        )}
        {error && <p className="text-sm text-heat">{error}</p>}
        <button
          type="submit" disabled={busy || !isPlatformConfigured}
          className="w-full rounded-full bg-void px-6 py-3 font-semibold text-paper disabled:opacity-50"
        >
          {busy ? "Please wait…" : sent ? "Verify code" : "Send code"}
        </button>
      </form>
    </div>
  );
}
