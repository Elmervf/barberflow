import Link from "next/link";
import { CalendarDays, MessageCircle, Scissors } from "lucide-react";

const features = [
  {
    title: "WhatsApp primero",
    copy: "El cliente entra desde un link que la barberia comparte en chat o estados.",
    icon: MessageCircle
  },
  {
    title: "Agenda sin choques",
    copy: "La disponibilidad respeta duracion del servicio, almuerzo y citas ocupadas.",
    icon: CalendarDays
  },
  {
    title: "Servicios editables",
    copy: "Precios, nombres y duraciones quedan listos para que el admin los cambie.",
    icon: Scissors
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-fog text-ink">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-ink text-white">
              <Scissors size={20} />
            </div>
            <span className="text-lg font-bold">BarberFlow</span>
          </div>
          <Link
            className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ember"
            href="/book/islands-barber-shop"
          >
            Ver demo
          </Link>
        </nav>

        <div className="grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-ember">
              Agenda automatizada para barberias
            </p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Citas desde WhatsApp, ordenadas en calendario.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
              BarberFlow convierte mensajes de clientes en reservas claras: link publico,
              disponibilidad real, dashboard del barbero y Google Calendar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded bg-ember px-5 py-3 font-bold text-white shadow-soft transition hover:bg-[#9f3d2b]"
                href="/book/islands-barber-shop"
              >
                Probar reserva
              </Link>
              <Link
                className="rounded border border-ink/20 bg-white px-5 py-3 font-bold transition hover:border-ink"
                href="/dashboard"
              >
                Ver dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {features.map(({ title, copy, icon: Icon }) => (
              <article key={title} className="rounded bg-white p-5 shadow-soft">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded bg-brass/20 text-ember">
                  <Icon size={20} />
                </div>
                <h2 className="text-xl font-black">{title}</h2>
                <p className="mt-2 leading-7 text-neutral-700">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
