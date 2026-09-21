-- ============================================================
-- Grant admin access to /admin
-- Run in: Supabase dashboard -> SQL Editor -> New query -> Run
--
-- Prerequisite: the account must already exist. Either sign in on the
-- site once, or create it via Authentication -> Users -> Add user.
-- ============================================================

-- EASIEST: promote the most recently created account (i.e. the one you
-- just made). No need to type your email.
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users
 order by created_at desc
 limit 1
on conflict (user_id, role) do nothing;

-- Confirm — you should see your email with role = admin.
select u.email, r.role, u.created_at
  from public.user_roles r
  join auth.users u on u.id = r.user_id;

-- ------------------------------------------------------------
-- Alternative: target a specific address instead of "most recent".
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'you@example.com'
-- on conflict (user_id, role) do nothing;
-- ------------------------------------------------------------
