import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus } from "lucide-react";
import {
  adminDeleteTier, adminGetEvent, adminSaveEvent, adminSaveTier,
  type EventInput, type TierInput,
} from "@/api/admin";
import { qk } from "@/lib/query-keys";

const EMPTY: EventInput = {
  slug: "", title: "", subtitle: "", description: "", category: "",
  venue_name: "", city: "", is_online: false,
  starts_at: "", ends_at: null, status: "draft", cover_image_url: "",
};

const input = "w-full rounded-lg border border-line bg-void px-4 py-2.5 text-sm text-ink outline-none focus:border-brand";
const label = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/** datetime-local needs `YYYY-MM-DDTHH:mm` in LOCAL time, not an ISO UTC string. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminEventEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<EventInput>(EMPTY);
  const [tiers, setTiers] = useState<TierInput[]>([]);
  const [error, setError] = useState("");

  const { data } = useQuery({
    queryKey: qk.admin.event(id ?? ""), queryFn: () => adminGetEvent(id!), enabled: !isNew,
  });

  useEffect(() => {
    if (!data) return;
    const e = data.event;
    setForm({
      slug: e.slug, title: e.title, subtitle: e.subtitle, description: e.description,
      category: e.category, venue_name: e.venue_name, city: e.city,
      is_online: e.is_online, starts_at: e.starts_at, ends_at: e.ends_at,
      status: e.status as EventInput["status"], cover_image_url: e.cover_image_url,
    });
    setTiers(data.tiers.map((t) => ({
      id: t.id, name: t.name, description: t.description, price_paise: t.price_paise,
      quantity_total: t.quantity_total, max_per_order: t.max_per_order, sort_order: t.sort_order,
    })));
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const saved = await adminSaveEvent(
        { ...form, slug: form.slug || slugify(form.title) }, isNew ? undefined : id,
      );
      for (const t of tiers) await adminSaveTier(saved.id, t);
      return saved;
    },
    onSuccess: (saved) => {
      void qc.invalidateQueries({ queryKey: qk.admin.events() });
      void qc.invalidateQueries({ queryKey: ["events"] });
      navigate(`/admin/events/${saved.id}`);
    },
    onError: (e) => setError((e as Error).message),
  });

  function set<K extends keyof EventInput>(k: K, v: EventInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-display text-4xl font-bold uppercase text-ink">
        {isNew ? "New event" : "Edit event"}
      </h1>

      {error && (
        <div className="mt-6 rounded-xl border border-heat/30 bg-heat/10 p-4 text-sm text-ink">{error}</div>
      )}

      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => { e.preventDefault(); setError(""); save.mutate(); }}
      >
        <div className="space-y-1.5">
          <label className={label} htmlFor="title">Title</label>
          <input id="title" required className={input} value={form.title}
            onChange={(e) => set("title", e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label} htmlFor="slug">Slug</label>
            <input id="slug" className={input} value={form.slug}
              placeholder={slugify(form.title) || "auto-from-title"}
              onChange={(e) => set("slug", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="category">Category</label>
            <input id="category" className={input} value={form.category ?? ""}
              placeholder="Workshop" onChange={(e) => set("category", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={label} htmlFor="subtitle">Subtitle</label>
          <input id="subtitle" className={input} value={form.subtitle ?? ""}
            onChange={(e) => set("subtitle", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className={label} htmlFor="description">Description</label>
          <textarea id="description" rows={5} className={input} value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={label} htmlFor="starts">Starts</label>
            <input id="starts" type="datetime-local" required className={input}
              value={toLocalInput(form.starts_at)}
              onChange={(e) => set("starts_at", fromLocalInput(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="ends">Ends</label>
            <input id="ends" type="datetime-local" className={input}
              value={toLocalInput(form.ends_at)}
              onChange={(e) => set("ends_at", fromLocalInput(e.target.value) || null)} />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-ink">
          <input type="checkbox" checked={form.is_online}
            onChange={(e) => set("is_online", e.target.checked)} />
          This is an online event
        </label>

        {!form.is_online && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className={label} htmlFor="venue">Venue</label>
              <input id="venue" className={input} value={form.venue_name ?? ""}
                onChange={(e) => set("venue_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className={label} htmlFor="city">City</label>
              <input id="city" className={input} value={form.city ?? ""}
                onChange={(e) => set("city", e.target.value)} />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className={label} htmlFor="status">Status</label>
          <select id="status" className={input} value={form.status}
            onChange={(e) => set("status", e.target.value as EventInput["status"])}>
            <option value="draft">Draft — hidden from the public site</option>
            <option value="published">Published — live and bookable</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Ticket tiers */}
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold uppercase text-ink">Ticket tiers</h2>
            <button type="button"
              onClick={() => setTiers((t) => [...t, {
                name: "", description: "", price_paise: 0, quantity_total: 50,
                max_per_order: 4, sort_order: t.length,
              }])}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink">
              <Plus className="h-3.5 w-3.5" /> Add tier
            </button>
          </div>

          {tiers.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No tiers yet — an event needs at least one to be bookable. Price 0 makes it free.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {tiers.map((t, i) => (
              <div key={t.id ?? i} className="rounded-xl border border-line p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={input} placeholder="Tier name (e.g. Early Bird)" value={t.name}
                    onChange={(e) => setTiers((a) => a.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  <input className={input} placeholder="Description" value={t.description ?? ""}
                    onChange={(e) => setTiers((a) => a.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className={label}>Price (₹)</label>
                    <input type="number" min={0} className={input}
                      value={t.price_paise / 100}
                      onChange={(e) => setTiers((a) => a.map((x, j) => j === i
                        ? { ...x, price_paise: Math.round(Number(e.target.value) * 100) } : x))} />
                  </div>
                  <div>
                    <label className={label}>Quantity</label>
                    <input type="number" min={0} className={input} value={t.quantity_total}
                      onChange={(e) => setTiers((a) => a.map((x, j) => j === i
                        ? { ...x, quantity_total: Number(e.target.value) } : x))} />
                  </div>
                  <div>
                    <label className={label}>Max / order</label>
                    <input type="number" min={1} className={input} value={t.max_per_order}
                      onChange={(e) => setTiers((a) => a.map((x, j) => j === i
                        ? { ...x, max_per_order: Number(e.target.value) } : x))} />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button"
                    onClick={async () => {
                      if (t.id) await adminDeleteTier(t.id);
                      setTiers((a) => a.filter((_, j) => j !== i));
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-heat">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={save.isPending}
            className="rounded-full bg-brand px-7 py-3 font-semibold text-primary-foreground disabled:opacity-60">
            {save.isPending ? "Saving…" : isNew ? "Create event" : "Save changes"}
          </button>
          <button type="button" onClick={() => navigate("/admin/events")}
            className="rounded-full border border-line px-7 py-3 font-semibold text-ink">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
