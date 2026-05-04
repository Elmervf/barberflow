# BarberFlow

MVP para automatizar citas de barberias: link publico de reservas, dashboard, disponibilidad por servicio, Google Calendar OAuth y plantillas de WhatsApp.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- Google Calendar API

## Ejecutar localmente

```bash
npm install
npm run dev
```

Luego abre:

- `http://localhost:3000`
- `http://localhost:3000/book/islands-barber-shop`
- `http://localhost:3000/dashboard`

## Base de datos

1. Crea un proyecto en Supabase.
2. Ejecuta `db/schema.sql`.
3. Ejecuta `db/seed.sql`.
4. Copia `.env.example` a `.env.local` y completa las variables.

## Google Calendar

Configura OAuth en Google Cloud y usa:

- Redirect URI local: `http://localhost:3002/api/google-calendar/callback`
- Redirect URI deploy: `https://tu-dominio.com/api/google-calendar/callback`

Variables requeridas:

```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3002/api/google-calendar/callback
```

Luego entra al dashboard, abre `Settings` y presiona `Conectar` en Google Calendar.

Nota MVP: los tokens se guardan en `google_calendar_connections`. Antes de produccion real conviene cifrar `access_token_encrypted` y `refresh_token_encrypted`.

## Deploy en Vercel

1. Sube este proyecto a GitHub sin `.env.local`.
2. Crea un proyecto en Vercel importando el repo.
3. Agrega estas variables en Vercel Project Settings:

```bash
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://tu-app.vercel.app/api/google-calendar/callback
```

4. En Google Cloud OAuth Client agrega este redirect URI:

```txt
https://tu-app.vercel.app/api/google-calendar/callback
```

5. Deploy.
6. Entra a `/dashboard/settings` en produccion y reconecta Google Calendar para guardar tokens con el redirect de produccion.
