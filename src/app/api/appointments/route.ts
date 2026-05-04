import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots, getEndTime } from "@/lib/availability";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncCreateCalendarEvent } from "@/lib/google/calendar";
import type { Appointment, Service, WorkingHour } from "@/lib/types";

const createAppointmentSchema = z.object({
  barbershopId: z.string().min(1),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createAppointmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de cita invalidos." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const input = parsed.data;

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id,name,duration_minutes")
    .eq("id", input.serviceId)
    .eq("barbershop_id", input.barbershopId)
    .single();

  if (serviceError || !service) {
    return NextResponse.json({ error: "Servicio no encontrado. Ejecuta db/schema.sql y db/seed.sql en Supabase." }, { status: 404 });
  }

  const { data: shop } = await supabase
    .from("barbershops")
    .select("timezone")
    .eq("id", input.barbershopId)
    .single();

  const endTime = getEndTime(input.startTime, service.duration_minutes);

  const [{ data: hoursRows }, { data: appointmentRows }] = await Promise.all([
    supabase
      .from("working_hours")
      .select("id,barber_id,day_of_week,start_time,end_time,break_start,break_end,is_active")
      .eq("barber_id", input.barberId),
    supabase
      .from("appointments")
      .select("id,barbershop_id,barber_id,service_id,customer_name,customer_phone,appointment_date,start_time,end_time,notes,status,google_calendar_event_id,created_at,updated_at")
      .eq("barber_id", input.barberId)
      .eq("appointment_date", input.appointmentDate)
      .in("status", ["pending", "confirmed", "rescheduled"])
  ]);

  const slots = getAvailableSlots({
    date: input.appointmentDate,
    service: {
      id: service.id,
      barbershopId: input.barbershopId,
      name: service.name,
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

  if (!slots.includes(input.startTime)) {
    return NextResponse.json({ error: "Ese horario no esta disponible." }, { status: 409 });
  }

  const { data: conflictingAppointment } = await supabase
    .from("appointments")
    .select("id")
    .eq("barber_id", input.barberId)
    .eq("appointment_date", input.appointmentDate)
    .in("status", ["pending", "confirmed", "rescheduled"])
    .lt("start_time", endTime)
    .gt("end_time", input.startTime)
    .maybeSingle();

  if (conflictingAppointment) {
    return NextResponse.json({ error: "Ese horario acaba de ocuparse. Elige otra hora." }, { status: 409 });
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      barbershop_id: input.barbershopId,
      barber_id: input.barberId,
      service_id: input.serviceId,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      appointment_date: input.appointmentDate,
      start_time: input.startTime,
      end_time: endTime,
      notes: input.notes || null,
      status: "confirmed"
    })
    .select("id")
    .single();

  if (error || !appointment) {
    return NextResponse.json({ error: "No se pudo guardar la cita en Supabase." }, { status: 500 });
  }

  await supabase.from("reminders").insert({
    appointment_id: appointment.id,
    channel: "dashboard",
    scheduled_for: `${input.appointmentDate}T${input.startTime}:00-06:00`,
    status: "pending"
  });

  await syncCreateCalendarEvent({
    appointmentId: appointment.id,
    barberId: input.barberId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    serviceName: service.name,
    date: input.appointmentDate,
    startTime: input.startTime,
    endTime,
    timezone: shop?.timezone ?? "America/El_Salvador",
    notes: input.notes
  });

  return NextResponse.json({
    appointmentId: appointment.id,
    endTime,
    serviceName: service.name
  });
}
