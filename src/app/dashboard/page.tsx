import Link from "next/link";
import type React from "react";
import { CalendarClock, CheckCircle2, CircleDollarSign, Plus } from "lucide-react";
import { DashboardAppointments } from "@/components/DashboardAppointments";
import { formatDateLong, formatMoney } from "@/lib/format";
import { getDashboardContext } from "@/lib/data";

const today = new Date().toISOString().slice(0, 10);

export default async function DashboardPage() {
  const context = await getDashboardContext();

  if (!context || !context.barber) {
    return <UnlinkedDashboard />;
  }

  const activeAppointments = (context.appointments ?? [])
    .filter((appointment) => ["pending", "confirmed", "rescheduled"].includes(appointment.status))
    .sort((a, b) => `${a.appointmentDate} ${a.startTime}`.localeCompare(`${b.appointmentDate} ${b.startTime}`));
  const todaysAppointments = activeAppointments.filter((appointment) => appointment.appointmentDate === today);
  const upcomingAppointments = activeAppointments.filter((appointment) => appointment.appointmentDate >= today).slice(0, 12);
  const serviceList = context.services ?? [];
  const revenueCents = todaysAppointments.reduce((sum, appointment) => {
    const service = serviceList.find((item) => item.id === appointment.serviceId);
    return sum + (service?.priceCents ?? 0);
  }, 0);

  return (
    <div className="grid gap-5">
      <header className="flex flex-col justify-between gap-4 rounded bg-white p-5 shadow-soft sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Dashboard</p>
          <h1 className="mt-1 text-3xl font-black">{context?.barbershop.name}</h1>
          <p className="mt-2 text-neutral-700">{formatDateLong(today)}</p>
          {context?.source === "seed" ? (
            <p className="mt-2 text-sm font-bold text-ember">Usando datos demo hasta ejecutar el SQL en Supabase.</p>
          ) : null}
        </div>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded bg-ember px-4 py-3 font-bold text-white transition hover:bg-[#9f3d2b]"
          href="/dashboard/appointments/new"
        >
          <Plus size={18} />
          Crear cita manual
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={CalendarClock} label="Citas hoy" value={String(todaysAppointments.length)} />
        <MetricCard icon={CircleDollarSign} label="Ingresos estimados" value={formatMoney(revenueCents)} />
        <MetricCard icon={CheckCircle2} label="Proximas citas" value={String(upcomingAppointments.length)} />
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Citas de hoy</h2>
          <span className="rounded bg-fog px-3 py-1 text-sm font-bold text-neutral-700">
            {context.googleCalendar.isConnected ? "Google Calendar conectado" : "Google Calendar pendiente"}
          </span>
        </div>
        <DashboardAppointments appointments={todaysAppointments} emptyMessage="No hay citas para hoy." services={serviceList} />
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Proximas citas</h2>
          <span className="rounded bg-fog px-3 py-1 text-sm font-bold text-neutral-700">Activas</span>
        </div>
        <DashboardAppointments appointments={upcomingAppointments} emptyMessage="No hay citas proximas." services={serviceList} />
      </section>
    </div>
  );
}

function UnlinkedDashboard() {
  return (
    <section className="rounded bg-white p-5 shadow-soft">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Cuenta no asociada</p>
      <h1 className="mt-1 text-3xl font-black">Tu usuario aun no tiene barberia asignada.</h1>
      <p className="mt-3 max-w-2xl text-neutral-700">
        Crea el usuario en Supabase Auth y ejecuta <strong>db/link-admin-user.sql</strong> cambiando el email si hace falta.
      </p>
    </section>
  );
}

function MetricCard({
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
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </article>
  );
}
