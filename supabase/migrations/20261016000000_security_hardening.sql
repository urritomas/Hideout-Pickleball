-- Security hardening for production. Configure SUPABASE_SERVICE_ROLE_KEY on the server
-- before applying this migration because public clients must no longer read private rows.

create extension if not exists btree_gist;

alter table public.bookings
  drop constraint if exists bookings_no_overlapping_active_slots;

alter table public.bookings
  add constraint bookings_no_overlapping_active_slots
  exclude using gist (
    court_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  ) where (status in ('pending', 'confirmed', 'booked'));

revoke all on public.bookings from anon, authenticated;
revoke all on public.payments from anon, authenticated;
revoke all on public.blocked_schedules from anon, authenticated;
revoke all on public.settings from anon, authenticated;

drop policy if exists "public read bookings" on public.bookings;
drop policy if exists "public insert bookings" on public.bookings;
drop policy if exists "public update bookings" on public.bookings;
drop policy if exists "public read payments" on public.payments;
drop policy if exists "public insert payments" on public.payments;
drop policy if exists "public read blocked" on public.blocked_schedules;
drop policy if exists "public insert blocked" on public.blocked_schedules;
drop policy if exists "public delete blocked" on public.blocked_schedules;
drop policy if exists "public read settings" on public.settings;
drop policy if exists "public update settings" on public.settings;
drop policy if exists "public insert settings" on public.settings;

update storage.buckets
set public = false
where id = 'receipts';

drop policy if exists "Public uploads allowed" on storage.objects;
drop policy if exists "Public read allowed" on storage.objects;