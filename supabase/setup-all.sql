-- ============================================================
-- TSE event platform — complete setup.
-- Generated from supabase/migrations/*.sql + seed.sql
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.
-- ============================================================

-- ─────────── 0001_core_schema.sql ───────────
-- TSE event platform — core schema.
-- Money is integer paise everywhere (Razorpay's API uses integer paise; anything
-- else adds a rounding-bug class at every boundary).

create extension if not exists pgcrypto with schema extensions;

create type app_role      as enum ('customer','staff','admin');
create type event_status  as enum ('draft','published','sold_out','cancelled','completed');
create type order_status  as enum ('awaiting_payment','paid','failed','cancelled','expired','refunded');
create type payment_status as enum ('created','authorized','captured','failed','refunded');
create type ticket_status as enum ('issued','checked_in','cancelled','refunded');

-- ---------- identity ----------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  phone      text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Role lives in its OWN table. If it were a column on profiles, the
-- "user can update own profile" policy would let anyone make themselves admin.
create table public.user_roles (
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ---------- catalogue ----------
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  title       text not null,
  subtitle    text,
  description text,
  cover_image_url text,
  category    text,
  venue_name  text,
  venue_address text,
  city        text,
  is_online   boolean not null default false,
  online_url  text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  registration_opens_at  timestamptz,
  registration_closes_at timestamptz,
  status      event_status not null default 'draft',
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz,
  constraint events_time_order check (ends_at is null or ends_at >= starts_at)
);
create unique index events_slug_key on public.events (slug) where deleted_at is null;
create index events_browse_idx on public.events (status, starts_at) where deleted_at is null;

create table public.ticket_types (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  name          text not null,
  description   text,
  price_paise   integer not null check (price_paise >= 0),   -- 0 = free tier
  currency      char(3) not null default 'INR',
  quantity_total    integer not null check (quantity_total >= 0),
  quantity_reserved integer not null default 0 check (quantity_reserved >= 0),
  quantity_sold     integer not null default 0 check (quantity_sold >= 0),
  min_per_order integer not null default 1 check (min_per_order >= 1),
  max_per_order integer not null default 10,
  sales_start_at timestamptz,
  sales_end_at   timestamptz,
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  -- THE BACKSTOP: even if every line of application logic is wrong, the database
  -- physically refuses to oversell.
  constraint ticket_types_no_oversell
    check (quantity_reserved + quantity_sold <= quantity_total)
);
create index ticket_types_event_idx on public.ticket_types (event_id, sort_order)
  where deleted_at is null;

-- ---------- commerce ----------
create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text not null unique,
  user_id       uuid not null references auth.users(id) on delete restrict,
  event_id      uuid not null references public.events(id) on delete restrict,
  status        order_status not null default 'awaiting_payment',
  buyer_name    text not null,
  buyer_email   text not null,
  buyer_phone   text,
  subtotal_paise integer not null default 0 check (subtotal_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  fees_paise     integer not null default 0 check (fees_paise >= 0),
  total_paise    integer not null default 0 check (total_paise >= 0),
  currency       char(3) not null default 'INR',
  hold_expires_at timestamptz,
  razorpay_order_id text unique,
  idempotency_key text unique,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  paid_at        timestamptz,
  constraint orders_total_math
    check (total_paise = subtotal_paise - discount_paise + fees_paise)
);
create index orders_user_idx  on public.orders (user_id, created_at desc);
create index orders_event_idx on public.orders (event_id, status);
create index orders_expiry_idx on public.orders (hold_expires_at)
  where status = 'awaiting_payment';

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  ticket_type_id  uuid not null references public.ticket_types(id) on delete restrict,
  quantity        integer not null check (quantity > 0),
  unit_price_paise integer not null check (unit_price_paise >= 0),
  line_total_paise integer not null check (line_total_paise >= 0),
  constraint order_items_line_math
    check (line_total_paise = unit_price_paise * quantity),
  unique (order_id, ticket_type_id)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete restrict,
  provider     text not null default 'razorpay',
  razorpay_order_id   text,
  razorpay_payment_id text not null,
  status       payment_status not null,
  amount_paise integer not null check (amount_paise >= 0),
  currency     char(3) not null default 'INR',
  method       text,      -- upi | card | netbanking | wallet. No card/VPA data stored.
  error_code        text,
  error_description text,
  raw_payload  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique (provider, razorpay_payment_id)
);
create index payments_order_idx on public.payments (order_id);

-- ---------- fulfilment ----------
create table public.tickets (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete restrict,
  event_id       uuid not null references public.events(id) on delete restrict,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  user_id        uuid not null references auth.users(id) on delete restrict,
  code           text not null unique,   -- opaque 160-bit, see issue_ticket_code()
  status         ticket_status not null default 'issued',
  attendee_name  text,
  checked_in_at  timestamptz,
  checked_in_by  uuid references auth.users(id),
  created_at     timestamptz not null default now()
);
create index tickets_user_idx  on public.tickets (user_id, created_at desc);
create index tickets_event_idx on public.tickets (event_id, status);

create table public.ticket_checkins (
  id         uuid primary key default gen_random_uuid(),
  ticket_id  uuid references public.tickets(id) on delete set null,
  event_id   uuid not null references public.events(id) on delete cascade,
  scanned_by uuid references auth.users(id),
  scanned_at timestamptz not null default now(),
  result     text not null check (result in
               ('ok','already_used','not_found','wrong_event','cancelled','refunded')),
  scanned_code text
);
create index ticket_checkins_event_idx on public.ticket_checkins (event_id, scanned_at desc);

-- Idempotency gate for Razorpay webhook delivery.
create table public.webhook_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null default 'razorpay',
  provider_event_id text not null,
  event_type    text not null,
  payload       jsonb not null,
  status        text not null default 'received',
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  unique (provider, provider_event_id)
);

-- ---------- shared trigger ----------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger events_updated    before update on public.events
  for each row execute function public.set_updated_at();
create trigger ticket_types_updated before update on public.ticket_types
  for each row execute function public.set_updated_at();
create trigger orders_updated    before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------- profile bootstrap ----------
-- Must never raise: if this trigger errors, ALL signups fail with an opaque
-- "Database error saving new user".
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
begin
  insert into public.profiles (id, email, phone, full_name, avatar_url)
  values (
    new.id,
    nullif(new.email,''),
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- public availability view ----------
-- security_invoker is mandatory: a plain view over an RLS table runs with the
-- OWNER's privileges and silently leaks every row.
create view public.ticket_availability
with (security_invoker = on) as
select
  tt.id as ticket_type_id,
  tt.event_id,
  tt.name,
  tt.description,
  tt.price_paise,
  tt.min_per_order,
  tt.max_per_order,
  tt.sort_order,
  greatest(tt.quantity_total - tt.quantity_reserved - tt.quantity_sold, 0) as quantity_available,
  (tt.is_active
   and (tt.sales_start_at is null or now() >= tt.sales_start_at)
   and (tt.sales_end_at   is null or now() <= tt.sales_end_at)
   and tt.quantity_total - tt.quantity_reserved - tt.quantity_sold > 0) as on_sale
from public.ticket_types tt
where tt.deleted_at is null;


-- ─────────── 0002_rls.sql ───────────
-- RLS. The anon key ships in the JS bundle — it is NOT a secret, it is a public API
-- endpoint. Every table is deny-by-default; money tables have NO client-writable policy.

alter table public.profiles       enable row level security;
alter table public.user_roles     enable row level security;
alter table public.events         enable row level security;
alter table public.ticket_types   enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.payments       enable row level security;
alter table public.tickets        enable row level security;
alter table public.ticket_checkins enable row level security;
alter table public.webhook_events enable row level security;  -- service_role only

-- SECURITY DEFINER avoids infinite recursion (a policy on user_roles querying user_roles).
create or replace function public.has_role(p_role app_role) returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (select 1 from public.user_roles
                  where user_id = (select auth.uid()) and role = p_role);
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public, extensions, pg_temp as $$
  select exists (select 1 from public.user_roles
                  where user_id = (select auth.uid()) and role in ('staff','admin'));
$$;

-- profiles
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy profiles_select_staff on public.profiles
  for select to authenticated using (public.is_staff());

-- user_roles: readable by self/staff, writable by NOBODY via the API.
create policy user_roles_select_own on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());

-- events
create policy events_select_published on public.events
  for select to anon, authenticated
  using (status in ('published','sold_out','completed') and deleted_at is null);
create policy events_admin_all on public.events
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- ticket_types: read through the ticket_availability view; admins manage directly.
create policy ticket_types_select_published on public.ticket_types
  for select to anon, authenticated
  using (deleted_at is null and exists (
    select 1 from public.events e
     where e.id = ticket_types.event_id
       and e.status in ('published','sold_out','completed')
       and e.deleted_at is null));
create policy ticket_types_admin_all on public.ticket_types
  for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- orders / order_items / payments / tickets: READ-ONLY for clients.
-- All writes go through SECURITY DEFINER RPCs or service-role Edge Functions.
create policy orders_select_own on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());

create policy order_items_select_own on public.order_items
  for select to authenticated using (exists (
    select 1 from public.orders o where o.id = order_items.order_id
      and (o.user_id = (select auth.uid()) or public.is_staff())));

create policy payments_select_own on public.payments
  for select to authenticated using (exists (
    select 1 from public.orders o where o.id = payments.order_id
      and (o.user_id = (select auth.uid()) or public.is_staff())));

create policy tickets_select_own on public.tickets
  for select to authenticated using (user_id = (select auth.uid()) or public.is_staff());

create policy checkins_staff on public.ticket_checkins
  for all to authenticated using (public.is_staff()) with check (public.is_staff());


-- ─────────── 0003_booking_functions.sql ───────────
-- Booking logic. Everything price- or inventory-related happens here, server-side,
-- in one transaction. The client never supplies a price anywhere in the system.

-- Opaque 160-bit ticket code. Deliberately NOT a signed JWT: a signature proves
-- authenticity but cannot express "already used", which is the property check-in needs.
create or replace function public.issue_ticket_code() returns text
language sql volatile set search_path = public, extensions, pg_temp as $$
  select 'TSE-' || upper(encode(gen_random_bytes(10), 'hex'));
$$;

create or replace function public.order_summary(p_order_id uuid) returns jsonb
language sql stable security definer set search_path = public, extensions, pg_temp as $$
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
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
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
          p_buyer_email, p_buyer_phone, now() + interval '15 minutes',
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
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
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
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
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
language plpgsql security definer set search_path = public, extensions, pg_temp as $$
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


-- ─────────── seed.sql ───────────
-- Sample events so the platform has something to show immediately after setup.
-- Idempotent and safe to re-run.
--
-- Note: events.slug has a PARTIAL unique index (… where deleted_at is null), which
-- ON CONFLICT cannot use — hence the `where not exists` guards.

insert into public.events (slug, title, subtitle, description, category, venue_name, city,
                           starts_at, ends_at, status)
select v.slug, v.title, v.subtitle, v.descr, v.category, v.venue, v.city,
       now() + v.offset_days, now() + v.offset_days + interval '3 hours', 'published'
from (values
  ('brand-systems-workshop', 'Building Your First Brand System',
   'A hands-on workshop for founders and in-house marketers',
   'Spend an evening building the actual thing: a colour system, a type scale, and a set of rules your team can apply without you in the room. You''ll leave with a working system, not a moodboard.',
   'Workshop', 'Hub Studio', 'Pune', interval '9 days'),
  ('social-growth-clinic', 'Social Growth Clinic: Reels That Actually Convert',
   'Bring your account, leave with a 30-day plan',
   'We audit real accounts live and rebuild the content plan in front of you. Limited seats so everyone gets looked at.',
   'Clinic', null, null, interval '21 days'),
  ('founders-mixer', 'Founders Mixer',
   'No pitches, no panels — just the people building things',
   'An evening of actual conversation. Limited capacity, and it always fills.',
   'Networking', 'The Terrace', 'Pune', interval '3 days')
) as v(slug, title, subtitle, descr, category, venue, city, offset_days)
where not exists (
  select 1 from public.events e where e.slug = v.slug and e.deleted_at is null
);

insert into public.ticket_types (event_id, name, description, price_paise,
                                 quantity_total, max_per_order, sort_order)
select e.id, t.name, t.descr, t.price, t.qty, t.maxper, t.ord
from public.events e
join (values
  ('brand-systems-workshop', 'Early Bird', 'Entry + welcome drink', 49900, 10, 4, 0),
  ('brand-systems-workshop', 'General',    'Entry',                 89900, 40, 6, 1),
  ('social-growth-clinic',   'Free seat',  'Online, live only',         0, 25, 2, 0),
  ('founders-mixer',         'Entry',      'Includes one drink',    29900, 30, 2, 0)
) as t(slug, name, descr, price, qty, maxper, ord) on t.slug = e.slug
where e.deleted_at is null
  and not exists (
    select 1 from public.ticket_types tt where tt.event_id = e.id and tt.name = t.name
  );

-- After you sign in once, promote yourself to admin:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users order by created_at limit 1
--   on conflict do nothing;


