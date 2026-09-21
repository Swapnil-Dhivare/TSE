-- One-off: corrects event times seeded before the fix, which inherited the
-- clock time the seed ran at (e.g. a 12:15am workshop).
-- Paste into the Supabase SQL Editor. Safe to re-run.
update public.events set
  starts_at = date_trunc('day', starts_at) + t.start_time,
  ends_at   = date_trunc('day', starts_at) + t.start_time + interval '3 hours'
from (values
  ('brand-systems-workshop', interval '19 hours'),
  ('social-growth-clinic',   interval '18 hours'),
  ('founders-mixer',         interval '20 hours')
) as t(slug, start_time)
where public.events.slug = t.slug;

select slug, to_char(starts_at, 'Dy DD Mon HH24:MI') as starts from public.events order by starts_at;
