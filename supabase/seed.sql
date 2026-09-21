-- Sample events so the platform has something to show immediately after setup.
-- Idempotent: safe to re-run.
insert into public.events (slug, title, subtitle, description, category, venue_name, city,
                           starts_at, ends_at, status)
values
  ('brand-systems-workshop', 'Building Your First Brand System',
   'A hands-on workshop for founders and in-house marketers',
   'Spend an evening building the actual thing: a colour system, a type scale, and a set of rules your team can apply without you in the room.',
   'Workshop', 'Hub Studio', 'Pune', now() + interval '9 days', now() + interval '9 days 3 hours', 'published'),
  ('social-growth-clinic', 'Social Growth Clinic: Reels That Actually Convert',
   'Bring your account, leave with a 30-day plan',
   'We audit real accounts live and rebuild the content plan in front of you.',
   'Clinic', null, null, now() + interval '21 days', now() + interval '21 days 2 hours', 'published')
on conflict (slug) do nothing;

insert into public.ticket_types (event_id, name, description, price_paise, quantity_total, max_per_order, sort_order)
select e.id, t.name, t.descr, t.price, t.qty, t.maxper, t.ord
from public.events e
join (values
  ('brand-systems-workshop', 'Early Bird', 'Entry + welcome drink', 49900, 10, 4, 0),
  ('brand-systems-workshop', 'General',    'Entry',                 89900, 40, 6, 1),
  ('social-growth-clinic',   'Free seat',  'Online, live only',         0, 25, 2, 0)
) as t(slug, name, descr, price, qty, maxper, ord) on t.slug = e.slug
where not exists (
  select 1 from public.ticket_types tt where tt.event_id = e.id and tt.name = t.name
);

-- Promote the first user to admin after you sign in once:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users order by created_at limit 1
--   on conflict do nothing;
