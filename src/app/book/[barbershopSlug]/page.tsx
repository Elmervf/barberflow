import Link from "next/link";
import { MapPin, Phone, Scissors } from "lucide-react";
import { BookingWidget } from "@/components/BookingWidget";
import { getBookingContext } from "@/lib/data";

type PageProps = {
  params: Promise<{ barbershopSlug: string }>;
};

export default async function BookPage({ params }: PageProps) {
  const { barbershopSlug } = await params;
  const context = await getBookingContext(barbershopSlug);

  if (!context) {
    return (
      <main className="grid min-h-screen place-items-center bg-fog px-6">
        <div className="max-w-md rounded bg-white p-6 text-center shadow-soft">
          <h1 className="text-2xl font-black">Barberia no encontrada</h1>
          <p className="mt-3 text-neutral-700">Revisa el link de reserva o pide uno nuevo a la barberia.</p>
          <Link className="mt-5 inline-block rounded bg-ink px-4 py-2 font-bold text-white" href="/">
            Volver
          </Link>
        </div>
      </main>
    );
  }

  const barber = context.barber;
  const isConfigured = barber && context.services.length > 0 && context.workingHours.length > 0;

  return (
    <main className="min-h-screen bg-fog text-ink">
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded bg-ink p-6 text-white shadow-soft">
            <div className="mb-8 grid h-14 w-14 place-items-center rounded bg-white/10">
              <Scissors size={26} />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brass">Reserva online</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">{context.barbershop.name}</h1>
            <div className="mt-6 grid gap-3 text-white/82">
              <div className="flex gap-3">
                <Phone size={18} className="mt-1 text-brass" />
                <span>{context.barbershop.phone}</span>
              </div>
              <div className="flex gap-3">
                <MapPin size={18} className="mt-1 text-brass" />
                <span>{context.barbershop.address}</span>
              </div>
            </div>
            <p className="mt-8 rounded bg-white/10 p-4 leading-7 text-white/88">
              Agenda tu cita en menos de un minuto. Los horarios se bloquean automaticamente para evitar dobles reservas.
            </p>
          </div>
        </aside>
        {isConfigured ? (
          <BookingWidget
            appointments={context.appointments}
            barbershop={context.barbershop}
            barber={barber}
            services={context.services}
            workingHours={context.workingHours}
          />
        ) : (
          <section className="rounded bg-white p-5 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Configuracion incompleta</p>
            <h2 className="mt-2 text-3xl font-black">Esta barberia todavia no puede recibir citas.</h2>
            <p className="mt-3 leading-7 text-neutral-700">
              Faltan barbero activo, servicios u horarios laborales. Completa la configuracion desde el dashboard antes de compartir este link.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
