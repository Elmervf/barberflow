import type React from "react";
import Link from "next/link";
import { Building2, CalendarCheck, Clock, MapPin, Phone, Save } from "lucide-react";
import { getDashboardContext } from "@/lib/data";
import { updateBarbershop, updateWorkingHour } from "@/app/dashboard/settings/actions";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value ?? "";
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const googleStatus = readParam(params, "google");
  const context = await getDashboardContext();
  if (!context) {
    return <EmptyState />;
  }

  const barbershop = context.barbershop;
  const workingHours = context.workingHours;

  return (
    <div className="grid gap-5">
      <header className="rounded bg-white p-5 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Configuracion</p>
        <h1 className="mt-1 text-3xl font-black">Datos de la barberia</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoItem icon={Building2} label="Nombre" value={barbershop.name} />
        <InfoItem icon={Phone} label="Telefono" value={barbershop.phone} />
        <InfoItem icon={MapPin} label="Direccion" value={barbershop.address} />
        <InfoItem icon={Clock} label="Zona horaria" value={barbershop.timezone} />
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck size={20} className="text-ember" />
              <h2 className="text-xl font-black">Google Calendar</h2>
            </div>
            <p className="mt-2 text-neutral-700">
              {context.googleCalendar.isConnected
                ? `Conectado como ${context.googleCalendar.googleEmail ?? "cuenta Google"}`
                : "Conecta el calendario para crear eventos automaticamente al confirmar citas."}
            </p>
            {googleStatus === "missing-config" ? <p className="mt-2 text-sm font-bold text-red-700">Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REDIRECT_URI.</p> : null}
            {googleStatus === "failed" ? <p className="mt-2 text-sm font-bold text-red-700">No se pudo conectar Google Calendar. Revisa credenciales y redirect URI.</p> : null}
            {googleStatus === "connected" ? <p className="mt-2 text-sm font-bold text-emerald-700">Google Calendar conectado correctamente.</p> : null}
          </div>
          <Link className="inline-flex items-center justify-center rounded bg-ink px-4 py-3 font-bold text-white" href="/api/google-calendar/connect">
            {context.googleCalendar.isConnected ? "Reconectar" : "Conectar"}
          </Link>
        </div>
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">Editar datos publicos</h2>
        <form action={updateBarbershop} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nombre">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={barbershop.name} name="name" required />
          </Field>
          <Field label="Telefono">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={barbershop.phone} name="phone" required />
          </Field>
          <Field label="Direccion">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={barbershop.address} name="address" required />
          </Field>
          <Field label="Zona horaria">
            <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={barbershop.timezone} name="timezone" required />
          </Field>
          <button className="inline-flex items-center justify-center gap-2 rounded bg-ink px-4 py-3 font-bold text-white md:w-fit" type="submit">
            <Save size={17} />
            Guardar datos
          </button>
        </form>
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">Horario laboral</h2>
        <div className="mt-4 grid gap-3">
          {workingHours.map((item) => (
            <form action={updateWorkingHour} className="grid gap-3 rounded bg-fog p-4 lg:grid-cols-[110px_repeat(4,130px)_auto_auto] lg:items-end" key={item.id}>
              <input name="id" type="hidden" value={item.id} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">Dia</p>
                <p className="mt-2 font-black">{dayLabel(item.dayOfWeek)}</p>
              </div>
              <Field label="Inicio">
                <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={item.startTime} name="startTime" required type="time" />
              </Field>
              <Field label="Fin">
                <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={item.endTime} name="endTime" required type="time" />
              </Field>
              <Field label="Almuerzo inicio">
                <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={item.breakStart ?? ""} name="breakStart" type="time" />
              </Field>
              <Field label="Almuerzo fin">
                <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={item.breakEnd ?? ""} name="breakEnd" type="time" />
              </Field>
              <label className="flex h-12 items-center gap-2 rounded bg-white px-3 text-sm font-bold">
                <input defaultChecked={item.isActive} name="isActive" type="checkbox" />
                Activo
              </label>
              <button className="rounded bg-ink px-4 py-3 font-bold text-white" type="submit">
                Guardar
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded bg-white p-5 shadow-soft">
      <h1 className="text-2xl font-black">Usuario sin barberia asignada.</h1>
      <p className="mt-2 text-neutral-700">Ejecuta db/link-admin-user.sql despues de crear el usuario en Supabase Auth.</p>
    </section>
  );
}

function dayLabel(day: number) {
  return ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"][day] ?? `Dia ${day}`;
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
    </label>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded bg-white p-5 shadow-soft">
      <Icon size={22} className="text-ember" />
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </article>
  );
}
