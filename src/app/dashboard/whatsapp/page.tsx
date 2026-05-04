import { Copy, MessageCircle } from "lucide-react";
import { getDashboardContext } from "@/lib/data";

const bookingUrl = "http://localhost:3000/book/islands-barber-shop";

export default async function WhatsappPage() {
  const context = await getDashboardContext();
  if (!context) {
    return <EmptyState />;
  }
  const barbershop = context?.barbershop;
  const services = context?.services ?? [];
  const serviceList = services.map((service) => `${service.name}: ${service.durationMinutes} min`).join("\n");
  const messages = [
    {
      title: "Bienvenida",
      body: `Hola, gracias por escribir a ${barbershop?.name}. Para agendar tu cita, entra aqui: ${bookingUrl}`
    },
    {
      title: "Estado de WhatsApp",
      body: `Agenda abierta de lunes a sabado. Reserva tu hora aqui: ${bookingUrl}`
    },
    {
      title: "Servicios",
      body: `Estos son nuestros servicios disponibles:\n${serviceList}\nReserva aqui: ${bookingUrl}`
    },
    {
      title: "Recordatorio",
      body: `Hola, te recordamos tu cita en ${barbershop?.name}. Si necesitas reagendar, responde este mensaje.`
    }
  ];

  return (
    <div className="grid gap-5">
      <header className="rounded bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <MessageCircle size={22} className="text-ember" />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">WhatsApp MVP</p>
        </div>
        <h1 className="mt-1 text-3xl font-black">Plantillas y link de reserva</h1>
        <p className="mt-2 max-w-2xl text-neutral-700">
          Esta version empieza con mensajes listos para copiar. La integracion oficial con WhatsApp API se conecta sobre este mismo flujo.
        </p>
      </header>

      <section className="rounded bg-ink p-5 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brass">Link publico</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <code className="flex-1 rounded bg-white/10 px-4 py-3 text-sm">{bookingUrl}</code>
          <button className="inline-flex items-center justify-center gap-2 rounded bg-white px-4 py-3 font-bold text-ink">
            <Copy size={17} />
            Copiar
          </button>
        </div>
      </section>

      <section className="grid gap-3">
        {messages.map((message) => (
          <article className="rounded bg-white p-5 shadow-soft" key={message.title}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{message.title}</h2>
              <button className="rounded border border-neutral-200 px-3 py-2 text-sm font-bold">Copiar</button>
            </div>
            <pre className="mt-4 whitespace-pre-wrap rounded bg-fog p-4 font-sans leading-7 text-neutral-800">
              {message.body}
            </pre>
          </article>
        ))}
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
