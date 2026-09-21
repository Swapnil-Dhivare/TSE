-- Sample events so the platform has something to show immediately after setup.
-- Idempotent and safe to re-run.
--
-- Note: events.slug has a PARTIAL unique index (… where deleted_at is null), which
-- ON CONFLICT cannot use — hence the `where not exists` guards.

insert into public.events (slug, title, subtitle, description, category, venue_name, city,
                           starts_at, ends_at, status, is_online)
-- date_trunc pins the time-of-day: without it, events inherit whatever clock
-- time the seed happened to run at (e.g. a 12:15am workshop).
select v.slug, v.title, v.subtitle, v.descr, v.category, v.venue, v.city,
       date_trunc('day', now() + v.offset_days) + v.start_time,
       date_trunc('day', now() + v.offset_days) + v.start_time + interval '3 hours',
       'published', v.venue is null
from (values
  ('brand-systems-workshop', 'Building Your First Brand System',
   'A hands-on workshop for founders and in-house marketers',
   'Spend an evening building the actual thing: a colour system, a type scale, and a set of rules your team can apply without you in the room. You''ll leave with a working system, not a moodboard.',
   'Workshop', 'Hub Studio', 'Pune', interval '9 days', interval '19 hours'),
  ('social-growth-clinic', 'Social Growth Clinic: Reels That Actually Convert',
   'Bring your account, leave with a 30-day plan',
   'We audit real accounts live and rebuild the content plan in front of you. Limited seats so everyone gets looked at.',
   'Clinic', null, null, interval '21 days', interval '18 hours'),
  ('founders-mixer', 'Founders Mixer',
   'No pitches, no panels — just the people building things',
   'An evening of actual conversation. Limited capacity, and it always fills.',
   'Networking', 'The Terrace', 'Pune', interval '3 days', interval '20 hours')
) as v(slug, title, subtitle, descr, category, venue, city, offset_days, start_time)
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
