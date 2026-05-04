create extension if not exists "uuid-ossp";

create type subscription_status as enum ('trial', 'active', 'past_due', 'cancelled');
create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'rescheduled', 'completed', 'no_show');
create type reminder_status as enum ('pending', 'sent', 'failed', 'cancelled');
create type reminder_channel as enum ('whatsapp', 'sms', 'email', 'dashboard');

create table public.barbershops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  phone text not null,
  address text,
  timezone text not null default 'America/El_Salvador',
  subscription_status subscription_status not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.barbers (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null default 0 check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.working_hours (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (barber_id, day_of_week)
);

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  customer_name text not null,
  customer_phone text not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  notes text,
  status appointment_status not null default 'confirmed',
  google_calendar_event_id text,
  google_calendar_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index appointments_barber_date_idx on public.appointments (barber_id, appointment_date);
create index appointments_shop_status_idx on public.appointments (barbershop_id, status);

create table public.google_calendar_connections (
  id uuid primary key default uuid_generate_v4(),
  barber_id uuid not null unique references public.barbers(id) on delete cascade,
  google_email text,
  calendar_id text not null default 'primary',
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  is_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  channel reminder_channel not null default 'dashboard',
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status reminder_status not null default 'pending',
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create table public.whatsapp_templates (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  type text not null,
  message text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (barbershop_id, type)
);

alter table public.barbershops enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.appointments enable row level security;
alter table public.google_calendar_connections enable row level security;
alter table public.reminders enable row level security;
alter table public.whatsapp_templates enable row level security;
