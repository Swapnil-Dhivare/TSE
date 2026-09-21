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
