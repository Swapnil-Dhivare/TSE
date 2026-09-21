import { createClient } from "jsr:@supabase/supabase-js@2";
import { hmacHex, timingSafeEqual } from "../_shared/razorpay.ts";

/**
 * Source of truth for payment confirmation.
 *
 * Two things that break this if you get them wrong:
 *  1. verify_jwt MUST be false (see supabase/config.toml) — Razorpay sends no JWT,
 *     so the default returns 401 and you get silent retry storms.
 *  2. The HMAC must be computed over the RAW body. JSON.parse + JSON.stringify does
 *     not round-trip byte-identically and the signature will never match.
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  const raw = await req.text();                       // raw FIRST, before any parsing
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const eventId = req.headers.get("x-razorpay-event-id") ?? crypto.randomUUID();
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;

  const expected = await hmacHex(secret, raw);
  if (!timingSafeEqual(expected, signature)) {
    console.error("webhook signature mismatch");
    return new Response("invalid signature", { status: 400 });
  }

  const payload = JSON.parse(raw);
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Idempotency gate: a duplicate delivery inserts zero rows and exits early.
  const { error: dupe } = await admin.from("webhook_events").insert({
    provider: "razorpay", provider_event_id: eventId,
    event_type: payload.event, payload,
  });
  if (dupe) return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });

  try {
    const entity = payload.payload?.payment?.entity;
    const orderId = entity?.notes?.order_id;

    switch (payload.event) {
      case "order.paid":
      case "payment.captured": {
        if (orderId) {
          await admin.rpc("confirm_order_paid", {
            p_order_id: orderId,
            p_payment_id: entity.id,
            p_amount_paise: entity.amount,
            p_method: entity.method ?? null,
            p_raw: { id: entity.id, method: entity.method, status: entity.status },
          });
        }
        break;
      }
      case "payment.authorized": {
        // Record it so expire_stale_orders won't release the hold mid-payment.
        if (orderId) {
          await admin.from("payments").insert({
            order_id: orderId, razorpay_payment_id: entity.id,
            razorpay_order_id: entity.order_id, status: "authorized",
            amount_paise: entity.amount, method: entity.method ?? null,
          });
        }
        break;
      }
      case "payment.failed": {
        if (orderId) {
          await admin.from("payments").insert({
            order_id: orderId, razorpay_payment_id: entity.id,
            razorpay_order_id: entity.order_id, status: "failed",
            amount_paise: entity.amount, method: entity.method ?? null,
            error_code: entity.error_code, error_description: entity.error_description,
          });
        }
        break;
      }
    }

    await admin.from("webhook_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("provider_event_id", eventId);
  } catch (err) {
    console.error("webhook processing failed", err);
    await admin.from("webhook_events").update({ status: "failed" }).eq("provider_event_id", eventId);
  }

  // Always 2xx on a valid signature; Razorpay retries non-2xx with backoff.
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
