import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/content/services";

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;

type Status = "idle" | "submitting" | "success" | "error" | "not-configured";

const inputClass =
  "w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-void";
const labelClass = "text-sm font-medium text-ink";

export function ContactForm() {
  const [searchParams] = useSearchParams();
  const presetService = searchParams.get("service") ?? "";
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!FORM_ENDPOINT) {
      setStatus("not-configured");
      return;
    }

    setStatus("submitting");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-accent p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-brand-lift" />
        <h3 className="font-display text-xl font-semibold text-ink">Message sent</h3>
        <p className="text-sm text-muted-foreground">
          Thanks for reaching out — we'll get back to you within a business day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-line bg-card p-7 shadow-sm shadow-ink/5"
    >
      {status === "not-configured" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-heat" />
          <span>
            This form isn't connected yet — set <code className="font-mono">VITE_FORM_ENDPOINT</code>{" "}
            in your <code className="font-mono">.env</code> file to a Formspree (or similar) endpoint.
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-heat/30 bg-heat/10 p-4 text-sm text-ink">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-heat" />
          <span>Something went wrong sending your message. Please try again.</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="name">
            Full name
          </label>
          <input id="name" name="name" required className={inputClass} placeholder="Jane Doe" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="jane@business.com"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" required className={inputClass} placeholder="+91 98765 43210" />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="businessName">
            Business name
          </label>
          <input id="businessName" name="businessName" required className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="serviceInterested">
          Service interested in
        </label>
        <select
          id="serviceInterested"
          name="serviceInterested"
          defaultValue={presetService}
          required
          className={inputClass}
        >
          <option value="" disabled>
            Select a service
          </option>
          {SERVICE_CATEGORIES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
          <option value="Multiple">Multiple</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="message">
          Tell us about your business
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className={inputClass}
          placeholder="What are you hoping to achieve?"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 font-semibold text-paper transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
