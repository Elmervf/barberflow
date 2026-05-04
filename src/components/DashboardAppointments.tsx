"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, UserX, X } from "lucide-react";
import type { Appointment, Service } from "@/lib/types";

type DashboardAppointmentsProps = {
  appointments: Appointment[];
  emptyMessage?: string;
  services: Service[];
};

export function DashboardAppointments({ appointments, emptyMessage = "No hay citas.", services }: DashboardAppointmentsProps) {
  const router = useRouter();
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateAppointment(id: string, action: "cancel" | "complete" | "no_show") {
    setError(null);
    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });

    if (response.ok) {
      router.refresh();
      return;
    }

    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(result?.error ?? "No se pudo actualizar la cita.");
  }

  async function rescheduleAppointment(formData: FormData) {
    setError(null);
    const id = String(formData.get("id") ?? "");
    const appointmentDate = String(formData.get("appointmentDate") ?? "");
    const startTime = String(formData.get("startTime") ?? "");

    const response = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reschedule", appointmentDate, startTime })
    });

    if (response.ok) {
      setRescheduleId(null);
      router.refresh();
      return;
    }

    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(result?.error ?? "No se pudo reagendar la cita.");
  }

  if (appointments.length === 0) {
    return <p className="rounded bg-fog p-4 text-neutral-700">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-3">
      {error ? <p className="rounded bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      {appointments.map((appointment) => {
        const service = services.find((item) => item.id === appointment.serviceId);
        const isRescheduling = rescheduleId === appointment.id;
        return (
          <article className="rounded border border-neutral-200 p-4" key={appointment.id}>
            <div className="grid gap-3 md:grid-cols-[140px_1fr_auto]">
              <div>
                <p className="text-sm font-bold text-neutral-500">{appointment.appointmentDate}</p>
                <p className="text-2xl font-black">{appointment.startTime}</p>
                <p className="text-sm text-neutral-600">{appointment.endTime}</p>
              </div>
              <div>
                <h3 className="font-black">{appointment.customerName}</h3>
                <p className="text-neutral-700">
                  {service?.name} - {appointment.customerPhone}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-ember">{appointment.status}</p>
                {appointment.googleCalendarEventId ? (
                  <p className="mt-1 text-xs font-bold text-emerald-700">Google Calendar sincronizado</p>
                ) : null}
                {appointment.notes ? <p className="mt-1 text-sm text-neutral-600">{appointment.notes}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center gap-1 rounded bg-ink px-3 py-2 text-sm font-bold text-white"
                  onClick={() => updateAppointment(appointment.id, "complete")}
                  type="button"
                >
                  <Check size={15} />
                  Atendida
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded border border-neutral-200 px-3 py-2 text-sm font-bold"
                  onClick={() => updateAppointment(appointment.id, "no_show")}
                  type="button"
                >
                  <UserX size={15} />
                  No llego
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded border border-neutral-200 px-3 py-2 text-sm font-bold"
                  onClick={() => setRescheduleId(isRescheduling ? null : appointment.id)}
                  type="button"
                >
                  <RotateCcw size={15} />
                  Reagendar
                </button>
                <button
                  className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
                  onClick={() => updateAppointment(appointment.id, "cancel")}
                  type="button"
                >
                  <X size={15} />
                  Cancelar
                </button>
              </div>
            </div>
            {isRescheduling ? (
              <form action={rescheduleAppointment} className="mt-4 grid gap-3 rounded bg-fog p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <input name="id" type="hidden" value={appointment.id} />
                <label className="grid gap-2 text-sm font-bold">
                  Nueva fecha
                  <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={appointment.appointmentDate} name="appointmentDate" required type="date" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Nueva hora
                  <input className="focus-ring rounded border border-neutral-200 px-3 py-3" defaultValue={appointment.startTime} name="startTime" required type="time" />
                </label>
                <button className="rounded bg-ember px-4 py-3 font-black text-white" type="submit">
                  Guardar cambio
                </button>
              </form>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
