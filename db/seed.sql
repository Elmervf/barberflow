insert into public.barbershops (name, slug, phone, address, timezone, subscription_status)
values ('Island''s Barber Shop', 'islands-barber-shop', '7974 2998', '9A Calle Poniente 307 Bis, San Miguel', 'America/El_Salvador', 'trial');

with shop as (
  select id from public.barbershops where slug = 'islands-barber-shop'
), barber as (
  insert into public.barbers (barbershop_id, name, email, phone)
  select id, 'Barbero principal', 'admin@islandsbarber.local', '7974 2998' from shop
  returning id, barbershop_id
)
insert into public.services (barbershop_id, name, duration_minutes, price_cents)
select barbershop_id, name, duration_minutes, price_cents
from barber
cross join (
  values
    ('Corte', 45, 1200),
    ('Solo barba', 20, 700),
    ('Corte + barba', 65, 1700),
    ('Limpieza facial', 30, 1000)
) as service_seed(name, duration_minutes, price_cents);

insert into public.working_hours (barber_id, day_of_week, start_time, end_time, break_start, break_end)
select b.id, day_number, '09:00', '18:00', '12:00', '13:00'
from public.barbers b
cross join generate_series(1, 6) as day_number
where b.email = 'admin@islandsbarber.local';

insert into public.whatsapp_templates (barbershop_id, type, message)
select id, template_type, template_message
from public.barbershops
cross join (
  values
    ('welcome', 'Hola, gracias por escribir a Island''s Barber Shop. Puedes agendar aqui: {{booking_link}}'),
    ('confirmation', 'Tu cita quedo confirmada para {{date}} a las {{time}}. Te esperamos.'),
    ('reminder', 'Hola, te recordamos tu cita en Island''s Barber Shop para {{date}} a las {{time}}.'),
    ('cancellation', 'Tu cita fue cancelada. Puedes reagendar aqui: {{booking_link}}')
) as templates(template_type, template_message)
where slug = 'islands-barber-shop';
