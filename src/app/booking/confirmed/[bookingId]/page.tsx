import Link from "next/link";
import { CalendarCheck, Clock, MapPin, Phone } from "lucide-react";
import { formatDateLong } from "@/lib/format";
import { pilotBarbershop } from "@/lib/seed";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const item = params[key];
  return Array.isArray(item) ? item[0] : item ?? "";
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const name = value(params, "name");
  const service = value(params, "service");
  const date = value(params, "date");
  const time = value(params, "time");
  const end = value(params, "end");

  return (
    <main className="grid min-h-screen place-items-center bg-fog px-6 py-10 text-ink">
      <section className="w-full max-w-2xl rounded bg-white p-6 shadow-soft">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded bg-ember text-white">
          <CalendarCheck size={30} />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">Cita confirmada</p>
          <h1 className="mt-2 text-3xl font-black">Te esperamos, {name || "cliente"}.</h1>
          <p className="mt-3 text-neutral-700">Tu reserva quedo agendada para {pilotBarbershop.name}.</p>
        </div>

        <div className="mt-8 grid gap-3 rounded bg-fog p-5">
          <div className="flex justify-between gap-4">
            <span className="font-bold">Servicio</span>
            <span>{service}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-bold">Fecha</span>
            <span>{date ? formatDateLong(date) : ""}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-bold">Hora</span>
            <span>
              {time} - {end}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-neutral-700">
          <div className="flex gap-3">
            <Phone size={18} className="mt-1 text-ember" />
            <span>{pilotBarbershop.phone}</span>
          </div>
          <div className="flex gap-3">
            <MapPin size={18} className="mt-1 text-ember" />
            <span>{pilotBarbershop.address}</span>
          </div>
          <div className="flex gap-3">
            <Clock size={18} className="mt-1 text-ember" />
            <span>Llega 5 minutos antes para mantener tu horario.</span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded bg-ink px-4 py-3 text-center font-bold text-white transition hover:bg-ember"
            href="/book/islands-barber-shop"
          >
            Reagendar
          </Link>
          <Link
            className="rounded border border-neutral-200 px-4 py-3 text-center font-bold transition hover:border-ember"
            href="/"
          >
            Salir
          </Link>
        </div>
      </section>
    </main>
  );
}
