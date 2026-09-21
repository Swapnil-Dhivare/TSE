import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useAuthProviders } from "@/auth/useAuthProviders";
import { isPlatformConfigured } from "@/lib/env";

const input =
  "w-full rounded-lg border border-line bg-void px-4 py-3 text-sm text-ink outline-none focus:border-brand";

export default function SignIn() {
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/account";
  const { signInWithGoogle, sendMagicLink, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const providers = useAuthProviders();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setError("");
    try { await fn(); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  if (linkSent) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-brand-lift" />
        <h1 className="mt-5 font-display text-3xl font-bold uppercase text-ink">Check your email</h1>
        <p className="mt-3 text-muted-foreground">
          We sent a sign-in link to <span className="text-ink">{email}</span>. Open it on this
          device to finish signing in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] text-ink">Sign in</h1>
      <p className="mt-3 text-muted-foreground">To book tickets and see your bookings.</p>

      {!isPlatformConfigured && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          Accounts aren't connected. Set <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> (in Vercel for the deployed
          site), then redeploy.
        </div>
      )}

      {isPlatformConfigured && !providers.loading && !providers.any && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          No sign-in method is enabled on this Supabase project. Enable one under
          Authentication → Providers.
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">{error}</div>
      )}

      {providers.google && (
        <button
          type="button" disabled={busy}
          onClick={() => void run(() => signInWithGoogle(next))}
          className="mt-8 w-full rounded-full border border-line bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-brand/50 disabled:opacity-50"
        >
          Continue with Google
        </button>
      )}

      {providers.google && providers.email && (
        <div className="my-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
      )}

      {providers.email && (
        <form className="mt-8 space-y-3" onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void run(async () => { await sendMagicLink(email, next); setLinkSent(true); });
        }}>
          <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground" htmlFor="email">
            Email
          </label>
          <input id="email" type="email" required value={email} placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)} className={input} />
          <button type="submit" disabled={busy}
            className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      {providers.phone && (
        <form className="mt-6 space-y-3" onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void run(async () => {
            if (!otpSent) { await sendPhoneOtp(phone); setOtpSent(true); }
            else { await verifyPhoneOtp(phone, otp); window.location.assign(next); }
          });
        }}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={otpSent}
            placeholder="+91 98765 43210" inputMode="tel" required className={input} />
          {otpSent && (
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code"
              inputMode="numeric" autoComplete="one-time-code" required className={input} />
          )}
          <button type="submit" disabled={busy}
            className="w-full rounded-full border border-line px-6 py-3 font-semibold text-ink disabled:opacity-50">
            {otpSent ? "Verify code" : "Send code by SMS"}
          </button>
        </form>
      )}
    </div>
  );
}
