import { BookingWidget } from "@/components/BookingWidget";
import { getDashboardContext } from "@/lib/data";

export default async function NewAppointmentPage() {
  const context = await getDashboardContext();

  if (!context) {
    return (
      <section className="rounded bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-black">Usuario sin barberia asignada.</h1>
        <p className="mt-2 text-neutral-700">Ejecuta db/link-admin-user.sql despues de crear el usuario en Supabase Auth.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <header className="rounded bg-white p-5 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Cita manual</p>
        <h1 className="mt-1 text-3xl font-black">Crear cita desde dashboard</h1>
        <p className="mt-2 max-w-2xl text-neutral-700">
          Usa el mismo motor de disponibilidad que la pagina publica para evitar choques de horario.
        </p>
      </header>
      <BookingWidget
        appointments={context.appointments}
        barber={context.barber}
        barbershop={context.barbershop}
        services={context.services}
        workingHours={context.workingHours}
      />
    </div>
  );
}
