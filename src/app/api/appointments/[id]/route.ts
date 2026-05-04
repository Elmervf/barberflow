import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots, getEndTime } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCancelCalendarEvent, syncUpdateCalendarEvent } from "@/lib/google/calendar";
import type { Appointment, Service, WorkingHour } from "@/lib/types";

const updateAppointmentSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum(["cancel", "complete", "no_show"])
  }),
  z.object({
    action: z.literal("reschedule"),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/)
  })
]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Accion invalida." }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (parsed.data.action !== "reschedule") {
    const { data: currentAppointment } = await supabase
      .from("appointments")
      .select("id,barber_id,google_calendar_event_id")
      .eq("id", id)
      .single();
    const nextStatus =
      parsed.data.action === "cancel" ? "cancelled" : parsed.data.action === "complete" ? "completed" : "no_show";

    const { error } = await supabase
      .from("appointments")
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar la cita." }, { status: 500 });
    }

    if (parsed.data.action === "cancel") {
      await supabase.from("reminders").update({ status: "cancelled" }).eq("appointment_id", id).eq("status", "pending");
      if (currentAppointment) {
        await syncCancelCalendarEvent({
          appointmentId: id,
          barberId: currentAppointment.barber_id,
          eventId: currentAppointment.google_calendar_event_id
        });
      }
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id,barber_id,barbershop_id,service_id,customer_name,customer_phone,notes,google_calendar_event_id,status")
    .eq("id", id)
    .single();

  if (appointmentError || !appointment) {
    return NextResponse.json({ error: "Cita no encontrada." }, { status: 404 });
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("name,duration_minutes")
    .eq("id", appointment.service_id)
    .single();

  if (serviceError || !service) {
    return NextResponse.json({ error: "Servicio no encontrado." }, { status: 404 });
  }

  const { data: shop } = await supabase
    .from("barbershops")
    .select("timezone")
    .eq("id", appointment.barbershop_id)
    .single();

  const endTime = getEndTime(parsed.data.startTime, service.duration_minutes);

  const [{ data: hoursRows }, { data: appointmentRows }] = await Promise.all([
    supabase
      .from("working_hours")
      .select("id,barber_id,day_of_week,start_time,end_time,break_start,break_end,is_active")
      .eq("barber_id", appointment.barber_id),
    supabase
      .from("appointments")
      .select("id,barbershop_id,barber_id,service_id,customer_name,customer_phone,appointment_date,start_time,end_time,notes,status,google_calendar_event_id,created_at,updated_at")
      .eq("barber_id", appointment.barber_id)
      .eq("appointment_date", parsed.data.appointmentDate)
      .neq("id", id)
      .in("status", ["pending", "confirmed", "rescheduled"])
  ]);

  const slots = getAvailableSlots({
    date: parsed.data.appointmentDate,
    service: {
      id: appointment.service_id,
      barbershopId: "",
      name: "",
      durationMinutes: service.duration_minutes,
      priceCents: 0,
      isActive: true
    } satisfies Service,
    workingHours: (hoursRows ?? []).map((row) => ({
      id: row.id,
      barberId: row.barber_id,
      dayOfWeek: row.day_of_week,
      startTime: String(row.start_time).slice(0, 5),
      endTime: String(row.end_time).slice(0, 5),
      breakStart: row.break_start ? String(row.break_start).slice(0, 5) : null,
      breakEnd: row.break_end ? String(row.break_end).slice(0, 5) : null,
      isActive: row.is_active
    })) satisfies WorkingHour[],
    appointments: (appointmentRows ?? []).map((row) => ({
      id: row.id,
      barbershopId: row.barbershop_id,
      barberId: row.barber_id,
      serviceId: row.service_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      appointmentDate: row.appointment_date,
      startTime: String(row.start_time).slice(0, 5),
      endTime: String(row.end_time).slice(0, 5),
      notes: row.notes,
      status: row.status,
      googleCalendarEventId: row.google_calendar_event_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) satisfies Appointment[]
  });

  if (!slots.includes(parsed.data.startTime)) {
    return NextResponse.json({ error: "Ese horario no esta disponible." }, { status: 409 });
  }

  const { data: conflictingAppointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("barber_id", appointment.barber_id)
    .eq("appointment_date", parsed.data.appointmentDate)
    .neq("id", id)
    .in("status", ["pending", "confirmed", "rescheduled"])
    .lt("start_time", endTime)
    .gt("end_time", parsed.data.startTime)
    .maybeSingle();

  if (conflictingAppointment) {
    return NextResponse.json({ error: "Ese horario no esta disponible." }, { status: 409 });
  }

  const { error } = await supabase
    .from("appointments")
    .update({
      appointment_date: parsed.data.appointmentDate,
      start_time: parsed.data.startTime,
      end_time: endTime,
      status: "rescheduled",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo reagendar la cita." }, { status: 500 });
  }

  await syncUpdateCalendarEvent({
    appointmentId: id,
    barberId: appointment.barber_id,
    eventId: appointment.google_calendar_event_id,
    customerName: appointment.customer_name,
    customerPhone: appointment.customer_phone,
    serviceName: service.name,
    date: parsed.data.appointmentDate,
    startTime: parsed.data.startTime,
    endTime,
    timezone: shop?.timezone ?? "America/El_Salvador",
    notes: appointment.notes
  });

  return NextResponse.json({ ok: true, status: "rescheduled", endTime });
}
