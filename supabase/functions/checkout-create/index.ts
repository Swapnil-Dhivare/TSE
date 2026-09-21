import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { createRazorpayOrder } from "../_shared/razorpay.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "UNAUTHORIZED" }, 401, origin);

    // Identify the caller from their JWT.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "UNAUTHORIZED" }, 401, origin);

    const { order_id } = await req.json();
    if (!order_id) return json({ error: "order_id required" }, 400, origin);

    // Service role to read the authoritative order. The amount is NEVER taken
    // from the request body — it is re-read from the database here.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order, error } = await admin
      .from("orders").select("*").eq("id", order_id).single();
    if (error || !order) return json({ error: "ORDER_NOT_FOUND" }, 404, origin);
    if (order.user_id !== user.id) return json({ error: "FORBIDDEN" }, 403, origin);
    if (order.status !== "awaiting_payment") {
      return json({ error: "ORDER_NOT_PAYABLE", status: order.status }, 409, origin);
    }
    if (order.hold_expires_at && new Date(order.hold_expires_at) < new Date()) {
      return json({ error: "HOLD_EXPIRED" }, 409, origin);
    }

    const rzpOrder = await createRazorpayOrder({
      amountPaise: order.total_paise,
      receipt: order.order_number,
      notes: { order_id: order.id, user_id: user.id },
    });

    await admin.from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("id", order.id);

    return json({
      razorpay_order_id: rzpOrder.id,
      amount_paise: order.total_paise,
      currency: order.currency,
      key_id: Deno.env.get("RAZORPAY_KEY_ID"),
      order_number: order.order_number,
      hold_expires_at: order.hold_expires_at,
      server_time: new Date().toISOString(),
    }, 200, origin);
  } catch (err) {
    console.error("checkout-create failed", err);
    return json({ error: "INTERNAL" }, 500, origin);
  }
});
