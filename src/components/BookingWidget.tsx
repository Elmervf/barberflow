"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, Clock, MessageSquareText, Scissors } from "lucide-react";
import { getAvailableSlots, getEndTime } from "@/lib/availability";
import { formatDateLong, formatMoney } from "@/lib/format";
import type { Appointment, Barber, Barbershop, Service, WorkingHour } from "@/lib/types";

const dateOptions = Array.from({ length: 10 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index);
  return date.toISOString().slice(0, 10);
});

type BookingWidgetProps = {
  barbershop: Barbershop;
  barber: Barber;
  services: Service[];
  workingHours: WorkingHour[];
  appointments: Appointment[];
};

export function BookingWidget({ barbershop, barber, services, workingHours, appointments }: BookingWidgetProps) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0].id);
  const [date, setDate] = useState(dateOptions[0]);
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const availableSlots = useMemo(
    () =>
      getAvailableSlots({
        date,
        service,
        workingHours,
        appointments
      }),
    [appointments, date, service, workingHours]
  );

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!time || !customerName.trim() || !customerPhone.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId: barbershop.id,
          barberId: barber.id,
          serviceId: service.id,
          customerName,
          customerPhone,
          appointmentDate: date,
          startTime: time,
          notes
        })
      });
      const result = (await response.json()) as { appointmentId?: string; endTime?: string; error?: string };

      if (!response.ok || !result.appointmentId) {
        setError(result.error ?? "No se pudo confirmar la cita.");
        return;
      }

      const params = new URLSearchParams({
        name: customerName,
        phone: customerPhone,
        service: service.name,
        date,
        time,
        end: result.endTime ?? getEndTime(time, service.durationMinutes),
        notes
      });

      router.push(`/booking/confirmed/${result.appointmentId}?${params.toString()}`);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={submitBooking}>
      <section className="rounded bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Scissors size={19} className="text-ember" />
          <h2 className="text-xl font-black">Elige tu servicio</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((item) => {
            const active = item.id === serviceId;
            return (
              <button
                className={`rounded border p-4 text-left transition ${
                  active ? "border-ember bg-ember text-white" : "border-neutral-200 bg-white hover:border-ember"
                }`}
                key={item.id}
                onClick={() => {
                  setServiceId(item.id);
                  setTime("");
                }}
                type="button"
              >
                <span className="block font-black">{item.name}</span>
                <span className={`mt-1 block text-sm ${active ? "text-white/85" : "text-neutral-600"}`}>
                  {item.durationMinutes} min - {formatMoney(item.priceCents)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <Calendar size={19} className="text-ember" />
          <h2 className="text-xl font-black">Selecciona fecha y hora</h2>
        </div>
        <label className="grid gap-2 text-sm font-bold">
          Dia
          <select
            className="focus-ring rounded border border-neutral-200 bg-white px-3 py-3"
            onChange={(event) => {
              setDate(event.target.value);
              setTime("");
            }}
            value={date}
          >
            {dateOptions.map((item) => (
              <option key={item} value={item}>
                {formatDateLong(item)}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Clock size={16} className="text-ember" />
            Horarios disponibles
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <button
                  className={`rounded border px-3 py-2 text-sm font-bold transition ${
                    slot === time ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white hover:border-ink"
                  }`}
                  key={slot}
                  onClick={() => setTime(slot)}
                  type="button"
                >
                  {slot}
                </button>
              ))
            ) : (
              <p className="col-span-full rounded bg-neutral-100 p-4 text-sm text-neutral-700">
                No hay horarios disponibles para esta fecha.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquareText size={19} className="text-ember" />
          <h2 className="text-xl font-black">Tus datos</h2>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Nombre completo
            <input
              className="focus-ring rounded border border-neutral-200 px-3 py-3"
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Ej. Juan Perez"
              required
              value={customerName}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Numero de WhatsApp
            <input
              className="focus-ring rounded border border-neutral-200 px-3 py-3"
              onChange={(event) => setCustomerPhone(event.target.value)}
              placeholder="Ej. 7974 2998"
              required
              value={customerPhone}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Notas extras
            <textarea
              className="focus-ring min-h-24 rounded border border-neutral-200 px-3 py-3"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Estilo, preferencia o detalle importante"
              value={notes}
            />
          </label>
        </div>
      </section>

      <button
        className="focus-ring flex items-center justify-center gap-2 rounded bg-ember px-5 py-4 font-black text-white shadow-soft transition hover:bg-[#9f3d2b] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting || !time || !customerName.trim() || !customerPhone.trim()}
        type="submit"
      >
        <Check size={19} />
        {isSubmitting ? "Confirmando..." : `Confirmar cita con ${barber.name}`}
      </button>
      {error ? <p className="rounded bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
    </form>
  );
}
