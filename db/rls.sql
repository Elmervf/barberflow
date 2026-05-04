-- BarberFlow RLS policies for MVP.
-- Run this after db/schema.sql and db/seed.sql in Supabase SQL Editor.

alter table public.barbershops enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.appointments enable row level security;
alter table public.google_calendar_connections enable row level security;
alter table public.reminders enable row level security;
alter table public.whatsapp_templates enable row level security;

drop policy if exists "Public can read active barbershops" on public.barbershops;
create policy "Public can read active barbershops"
on public.barbershops
for select
to anon, authenticated
using (subscription_status in ('trial', 'active'));

drop policy if exists "Public can read active barbers" on public.barbers;
create policy "Public can read active barbers"
on public.barbers
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.barbershops s
    where s.id = barbers.barbershop_id
      and s.subscription_status in ('trial', 'active')
  )
);

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
on public.services
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.barbershops s
    where s.id = services.barbershop_id
      and s.subscription_status in ('trial', 'active')
  )
);

drop policy if exists "Public can read active working hours" on public.working_hours;
create policy "Public can read active working hours"
on public.working_hours
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.barbers b
    join public.barbershops s on s.id = b.barbershop_id
    where b.id = working_hours.barber_id
      and b.is_active = true
      and s.subscription_status in ('trial', 'active')
  )
);

drop policy if exists "Owners can read their barbershops" on public.barbershops;
create policy "Owners can read their barbershops"
on public.barbershops
for select
to authenticated
using (
  exists (
    select 1
    from public.barbers b
    where b.barbershop_id = barbershops.id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage their appointments" on public.appointments;
create policy "Owners can manage their appointments"
on public.appointments
for all
to authenticated
using (
  exists (
    select 1
    from public.barbers b
    where b.id = appointments.barber_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.barbers b
    where b.id = appointments.barber_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage their services" on public.services;
create policy "Owners can manage their services"
on public.services
for all
to authenticated
using (
  exists (
    select 1
    from public.barbers b
    where b.barbershop_id = services.barbershop_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.barbers b
    where b.barbershop_id = services.barbershop_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage their working hours" on public.working_hours;
create policy "Owners can manage their working hours"
on public.working_hours
for all
to authenticated
using (
  exists (
    select 1
    from public.barbers b
    where b.id = working_hours.barber_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.barbers b
    where b.id = working_hours.barber_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage their calendar connections" on public.google_calendar_connections;
create policy "Owners can manage their calendar connections"
on public.google_calendar_connections
for all
to authenticated
using (
  exists (
    select 1
    from public.barbers b
    where b.id = google_calendar_connections.barber_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.barbers b
    where b.id = google_calendar_connections.barber_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage reminders" on public.reminders;
create policy "Owners can manage reminders"
on public.reminders
for all
to authenticated
using (
  exists (
    select 1
    from public.appointments a
    join public.barbers b on b.id = a.barber_id
    where a.id = reminders.appointment_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.appointments a
    join public.barbers b on b.id = a.barber_id
    where a.id = reminders.appointment_id
      and b.user_id = auth.uid()
  )
);

drop policy if exists "Owners can manage whatsapp templates" on public.whatsapp_templates;
create policy "Owners can manage whatsapp templates"
on public.whatsapp_templates
for all
to authenticated
using (
  exists (
    select 1
    from public.barbers b
    where b.barbershop_id = whatsapp_templates.barbershop_id
      and b.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.barbers b
    where b.barbershop_id = whatsapp_templates.barbershop_id
      and b.user_id = auth.uid()
  )
);
