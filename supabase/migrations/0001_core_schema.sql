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
