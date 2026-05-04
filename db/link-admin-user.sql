-- Replace this email with the Supabase Auth user email you created for the pilot admin.
-- Run after creating the user in Supabase Authentication.

update public.barbers
set user_id = (
  select id
  from auth.users
  where email = 'admin@islandsbarber.local'
  limit 1
)
where email = 'admin@islandsbarber.local';

select id, name, email, user_id
from public.barbers
where email = 'admin@islandsbarber.local';
