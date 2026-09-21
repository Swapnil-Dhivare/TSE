import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useAuthProviders } from "@/auth/useAuthProviders";
import { isPlatformConfigured } from "@/lib/env";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-lg border border-line bg-void px-4 py-3 text-sm text-ink outline-none focus:border-brand";
const labelCls = "font-mono text-[11px] uppercase tracking-widest text-muted-foreground";

type Mode = "signin" | "signup";

export default function SignIn() {
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/account";
  const { signInWithGoogle, sendMagicLink, signInWithPassword, signUpWithPassword,
          sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const providers = useAuthProviders();

  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [noAccount, setNoAccount] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(""); setNoAccount(false);
    try { await fn(); }
    catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      if (msg === "NO_ACCOUNT") setNoAccount(true);
      else setError(msg);
    } finally { setBusy(false); }
  }

  if (sentTo) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-brand-lift" />
        <h1 className="mt-5 font-display text-3xl font-bold uppercase text-ink">Check your email</h1>
        <p className="mt-3 text-muted-foreground">
          We sent a sign-in link to <span className="text-ink">{sentTo}</span>. Open it on this
          device to finish.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Nothing after a minute? Check spam, then{" "}
          <button type="button" onClick={() => setSentTo("")} className="text-brand-lift underline">
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  const isSignUp = mode === "signup";

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] text-ink">
        {isSignUp ? "Create account" : "Sign in"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {isSignUp ? "To book tickets and keep them in one place." : "Welcome back."}
      </p>

      {/* Mode switch */}
      <div className="mt-8 grid grid-cols-2 gap-1 rounded-full border border-line p-1">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m} type="button"
            onClick={() => { setMode(m); setError(""); setNoAccount(false); }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              mode === m ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-ink",
            )}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      {!isPlatformConfigured && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          Accounts aren't connected. Set <code className="font-mono">VITE_SUPABASE_URL</code> and{" "}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in Vercel, then redeploy.
        </div>
      )}

      {isPlatformConfigured && !providers.loading && !providers.any && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          No sign-in method is enabled on this Supabase project. Enable one under
          Authentication → Providers.
        </div>
      )}

      {noAccount && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          No account found for that email.{" "}
          <button type="button" onClick={() => { setMode("signup"); setNoAccount(false); }}
            className="font-semibold text-brand-lift underline">
            Create one instead
          </button>
          .
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">{error}</div>
      )}

      {providers.google && (
        <button type="button" disabled={busy}
          onClick={() => void run(() => signInWithGoogle(next))}
          className="mt-6 w-full rounded-full border border-line bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-brand/50 disabled:opacity-50">
          Continue with Google
        </button>
      )}

      {providers.google && providers.email && (
        <div className="my-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
        </div>
      )}

      {providers.email && usePassword && (
        <form className="mt-6 space-y-4" onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void run(async () => {
            if (isSignUp) await signUpWithPassword(email, password, fullName);
            else await signInWithPassword(email, password);
            window.location.assign(next);
          });
        }}>
          {isSignUp && (
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="name">Your name</label>
              <input id="name" required value={fullName} placeholder="Jane Doe"
                onChange={(e) => setFullName(e.target.value)} className={field} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} placeholder="you@company.com"
              autoComplete="email" onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} value={password}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)} className={field} />
          </div>
          <button type="submit" disabled={busy}
            className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </button>
          <button type="button" onClick={() => setUsePassword(false)}
            className="w-full text-center text-xs text-muted-foreground hover:text-ink">
            Email me a sign-in link instead
          </button>
        </form>
      )}

      {providers.email && !usePassword && (
        <form className="mt-6 space-y-4" onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void run(async () => {
            await sendMagicLink(email, { next, signUp: isSignUp, fullName });
            setSentTo(email);
          });
        }}>
          {isSignUp && (
            <div className="space-y-1.5">
              <label className={labelCls} htmlFor="name2">Your name</label>
              <input id="name2" required value={fullName} placeholder="Jane Doe"
                onChange={(e) => setFullName(e.target.value)} className={field} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className={labelCls} htmlFor="email2">Email</label>
            <input id="email2" type="email" required value={email} placeholder="you@company.com"
              onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <button type="submit" disabled={busy}
            className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
          <button type="button" onClick={() => setUsePassword(true)}
            className="w-full text-center text-xs text-muted-foreground hover:text-ink">
            Use a password instead
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
            placeholder="+91 98765 43210" inputMode="tel" required className={field} />
          {otpSent && (
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code"
              inputMode="numeric" autoComplete="one-time-code" required className={field} />
          )}
          <button type="submit" disabled={busy}
            className="w-full rounded-full border border-line px-6 py-3 font-semibold text-ink disabled:opacity-50">
            {otpSent ? "Verify code" : "Send code by SMS"}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/events" className="hover:text-ink">Browse events without an account →</Link>
      </p>
    </div>
  );
}
