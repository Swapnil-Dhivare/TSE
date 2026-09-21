-- Booking logic. Everything price- or inventory-related happens here, server-side,
-- in one transaction. The client never supplies a price anywhere in the system.

-- Opaque 160-bit ticket code. Deliberately NOT a signed JWT: a signature proves
-- authenticity but cannot express "already used", which is the property check-in needs.
create or replace function public.issue_ticket_code() returns text
language sql volatile as $$
  select 'TSE-' || upper(encode(gen_random_bytes(10), 'hex'));
$$;

create or replace function public.order_summary(p_order_id uuid) returns jsonb
language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'order_id', o.id,
    'order_number', o.order_number,
    'status', o.status,
    'total_paise', o.total_paise,
    'currency', o.currency,
    'hold_expires_at', o.hold_expires_at,
    'server_time', now()
  ) from public.orders o where o.id = p_order_id;
$$;

-- Reserve inventory + create an order. Row-locks each tier, validates sale windows
-- and per-order limits, recomputes every price from the DB, and holds stock for 15 min.
create or replace function public.create_order(
  p_event_id        uuid,
  p_items           jsonb,        -- [{"ticket_type_id":"…","quantity":2}]
  p_buyer_name      text,
  p_buyer_email     text,
  p_buyer_phone     text default null,
  p_idempotency_key text default null
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_user_id  uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_subtotal integer := 0;
  v_item     record;
  v_tt       record;
  v_existing uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  -- Idempotent re-submit (double-click, two tabs) returns the original order.
  if p_idempotency_key is not null then
    select id into v_existing from public.orders
     where idempotency_key = p_idempotency_key and user_id = v_user_id;
    if found then return public.order_summary(v_existing); end if;
  end if;

  perform 1 from public.events
   where id = p_event_id and status = 'published' and deleted_at is null
     and (registration_opens_at  is null or now() >= registration_opens_at)
     and (registration_closes_at is null or now() <= registration_closes_at);
  if not found then raise exception 'EVENT_NOT_ON_SALE'; end if;

  v_order_number := 'TSE-' || to_char(now(),'YYYY') || '-' ||
                    upper(encode(gen_random_bytes(4),'hex'));

  insert into public.orders (order_number, user_id, event_id, status, buyer_name,
                             buyer_email, buyer_phone, hold_expires_at, idempotency_key)
  values (v_order_number, v_user_id, p_event_id, 'awaiting_payment', p_buyer_name,
          p_buyer_email::citext, p_buyer_phone, now() + interval '15 minutes',
          p_idempotency_key)
  returning id into v_order_id;

  -- ORDER BY gives every transaction the same lock ordering, preventing deadlocks
  -- between two concurrent multi-tier carts.
  for v_item in
    select (e->>'ticket_type_id')::uuid as ticket_type_id,
           (e->>'quantity')::integer    as quantity
      from jsonb_array_elements(p_items) e
     order by 1
  loop
    if v_item.quantity is null or v_item.quantity <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select * into v_tt from public.ticket_types
     where id = v_item.ticket_type_id and event_id = p_event_id and deleted_at is null
     for update;                                  -- <- the serialisation point

    if not found            then raise exception 'TICKET_TYPE_NOT_FOUND'; end if;
    if not v_tt.is_active   then raise exception 'TICKET_TYPE_INACTIVE';  end if;
    if v_tt.sales_start_at is not null and now() < v_tt.sales_start_at then
      raise exception 'SALES_NOT_STARTED'; end if;
    if v_tt.sales_end_at is not null and now() > v_tt.sales_end_at then
      raise exception 'SALES_ENDED'; end if;
    if v_item.quantity < v_tt.min_per_order or v_item.quantity > v_tt.max_per_order then
      raise exception 'QUANTITY_OUT_OF_RANGE'; end if;
    if v_tt.quantity_total - v_tt.quantity_reserved - v_tt.quantity_sold < v_item.quantity then
      raise exception 'SOLD_OUT'; end if;

    update public.ticket_types
       set quantity_reserved = quantity_reserved + v_item.quantity
     where id = v_tt.id;

    -- Price is read from the ticket_types row, never from p_items.
    insert into public.order_items (order_id, ticket_type_id, quantity,
                                    unit_price_paise, line_total_paise)
    values (v_order_id, v_tt.id, v_item.quantity,
            v_tt.price_paise, v_tt.price_paise * v_item.quantity);

    v_subtotal := v_subtotal + v_tt.price_paise * v_item.quantity;
  end loop;

  if v_subtotal is null then raise exception 'EMPTY_CART'; end if;

  update public.orders
     set subtotal_paise = v_subtotal, total_paise = v_subtotal
   where id = v_order_id;

  -- Free events skip payment entirely: confirm and issue tickets immediately.
  if v_subtotal = 0 then
    perform public.confirm_order_paid(v_order_id, null, 0, 'free', '{}'::jsonb);
  end if;

  return public.order_summary(v_order_id);
end $$;

-- Confirm payment and issue tickets. Idempotent: called by the webhook (source of
-- truth) and possibly by the client fast-path; both converge here safely.
create or replace function public.confirm_order_paid(
  p_order_id uuid, p_payment_id text, p_amount_paise integer,
  p_method text, p_raw jsonb
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_order record;
  v_item  record;
  v_i     integer;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status = 'paid' then
    return jsonb_build_object('status','already_paid','order_id',p_order_id);
  end if;

  -- Never trust the amount from the payload; it must match what we computed.
  if p_amount_paise is not null and p_amount_paise <> v_order.total_paise then
    raise exception 'AMOUNT_MISMATCH: expected % got %', v_order.total_paise, p_amount_paise;
  end if;

  if p_payment_id is not null then
    insert into public.payments (order_id, razorpay_order_id, razorpay_payment_id,
                                 status, amount_paise, method, raw_payload)
    values (p_order_id, v_order.razorpay_order_id, p_payment_id, 'captured',
            coalesce(p_amount_paise, v_order.total_paise), p_method, coalesce(p_raw,'{}'::jsonb))
    on conflict (provider, razorpay_payment_id) do nothing;
  end if;

  for v_item in
    select oi.*, tt.id as tt_id from public.order_items oi
      join public.ticket_types tt on tt.id = oi.ticket_type_id
     where oi.order_id = p_order_id order by oi.ticket_type_id
  loop
    -- Move the hold into a confirmed sale.
    update public.ticket_types
       set quantity_reserved = greatest(quantity_reserved - v_item.quantity, 0),
           quantity_sold     = quantity_sold + v_item.quantity
     where id = v_item.tt_id;

    for v_i in 1..v_item.quantity loop
      insert into public.tickets (order_id, event_id, ticket_type_id, user_id, code,
                                  attendee_name)
      values (p_order_id, v_order.event_id, v_item.tt_id, v_order.user_id,
              public.issue_ticket_code(), v_order.buyer_name);
    end loop;
  end loop;

  update public.orders
     set status = 'paid', paid_at = now(), hold_expires_at = null
   where id = p_order_id;

  return jsonb_build_object('status','paid','order_id',p_order_id);
end $$;

-- Release holds for abandoned checkouts. Skips orders with a live payment so the
-- sweeper can never free inventory out from under an in-flight transaction.
create or replace function public.expire_stale_orders() returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_order record; v_item record; v_count integer := 0;
begin
  for v_order in
    select o.id from public.orders o
     where o.status = 'awaiting_payment'
       and o.hold_expires_at < now()
       and not exists (select 1 from public.payments p
                        where p.order_id = o.id
                          and p.status in ('authorized','captured'))
     for update skip locked
  loop
    for v_item in select * from public.order_items where order_id = v_order.id loop
      update public.ticket_types
         set quantity_reserved = greatest(quantity_reserved - v_item.quantity, 0)
       where id = v_item.ticket_type_id;
    end loop;
    update public.orders set status = 'expired' where id = v_order.id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

-- Atomic single-use check-in. Zero rows updated IS the "already used" signal.
create or replace function public.checkin_ticket(p_code text, p_event_id uuid)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_ticket record; v_result text;
begin
  if not public.is_staff() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;

  update public.tickets
     set status = 'checked_in', checked_in_at = now(), checked_in_by = auth.uid()
   where code = p_code and event_id = p_event_id and status = 'issued'
   returning * into v_ticket;

  if found then
    v_result := 'ok';
  else
    select * into v_ticket from public.tickets where code = p_code;
    v_result := case
      when v_ticket.id is null                  then 'not_found'
      when v_ticket.event_id <> p_event_id      then 'wrong_event'
      when v_ticket.status = 'checked_in'       then 'already_used'
      when v_ticket.status = 'refunded'         then 'refunded'
      else 'cancelled' end;
  end if;

  insert into public.ticket_checkins (ticket_id, event_id, scanned_by, result, scanned_code)
  values (v_ticket.id, p_event_id, auth.uid(), v_result, p_code);

  return jsonb_build_object('result', v_result,
                            'attendee_name', v_ticket.attendee_name,
                            'checked_in_at', v_ticket.checked_in_at);
end $$;

-- Clients may only call create_order. The rest are service-role / cron only.
revoke execute on function public.confirm_order_paid(uuid,text,integer,text,jsonb) from public, anon, authenticated;
revoke execute on function public.expire_stale_orders() from public, anon, authenticated;
grant execute on function public.create_order(uuid,jsonb,text,text,text,text) to authenticated;
grant execute on function public.checkin_ticket(text,uuid) to authenticated;
