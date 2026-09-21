-- Corrects event times to IST wall-clock.
--
-- Two bugs this fixes:
--  1. The original seed used `now() + interval`, so events inherited whatever
--     clock time the SQL happened to run at (e.g. a 12:15am workshop).
--  2. The first fix set e.g. "20 hours" against a UTC day boundary, so 20:00 was
--     stored as 20:00 UTC and rendered as 01:30 IST in the browser — 5.5h out.
--
-- `X AT TIME ZONE 'Asia/Kolkata'` on a timestamptz yields IST wall-clock; applying
-- it again to the resulting timestamp converts back, interpreting it as IST.
-- Paste into the Supabase SQL Editor. Safe to re-run.

update public.events e set
  starts_at = (date_trunc('day', e.starts_at at time zone 'Asia/Kolkata') + t.start_time)
                at time zone 'Asia/Kolkata',
  ends_at   = (date_trunc('day', e.starts_at at time zone 'Asia/Kolkata') + t.start_time
                + interval '3 hours') at time zone 'Asia/Kolkata'
from (values
  ('brand-systems-workshop', interval '19 hours'),
  ('social-growth-clinic',   interval '18 hours'),
  ('founders-mixer',         interval '20 hours')
) as t(slug, start_time)
where e.slug = t.slug;

-- Online events have no venue; flag them so the UI says "Online".
update public.events set is_online = true
 where venue_name is null and is_online is distinct from true;

select slug, is_online,
       to_char(starts_at at time zone 'Asia/Kolkata', 'Dy DD Mon HH24:MI') as starts_ist
  from public.events order by starts_at;
