-- ============================================================
-- Grant yourself admin access to /admin
--
-- IMPORTANT: sign in to the site with Google ONCE before running this.
-- Your account only exists in auth.users after your first sign-in.
--
-- Run in: Supabase dashboard -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. Check your account exists and copy your email from the result.
select id, email, created_at from auth.users order by created_at desc;

-- 2. Replace the email below with yours, then run this.
insert into public.user_roles (user_id, role)
select id, 'admin'
  from auth.users
 where email = 'you@example.com'      -- <<< CHANGE THIS
on conflict (user_id, role) do nothing;

-- 3. Confirm it worked — you should see one row with role = admin.
select u.email, r.role
  from public.user_roles r
  join auth.users u on u.id = r.user_id;
