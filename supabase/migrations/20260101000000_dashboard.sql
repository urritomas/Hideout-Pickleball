create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.settings to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'public read settings'
  ) then
    create policy "public read settings" on public.settings for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'public update settings'
  ) then
    create policy "public update settings" on public.settings for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'settings' and policyname = 'public insert settings'
  ) then
    create policy "public insert settings" on public.settings for insert with check (true);
  end if;
end
$$;

insert into public.settings (key, value)
values 
  ('day_rate', '200'),
  ('evening_rate', '300'),
  ('service_fee', '20'),
  ('opening_hour', '8'),
  ('closing_hour', '24')
on conflict (key) do nothing;