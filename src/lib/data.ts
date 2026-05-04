import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { demoAppointments, pilotBarber, pilotBarbershop, services, workingHours } from "@/lib/seed";
import type { Appointment, Barber, Barbershop, Service, WorkingHour } from "@/lib/types";

type DbBarbershop = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string | null;
  timezone: string;
  subscription_status: Barbershop["subscriptionStatus"];
};

type DbBarber = {
  id: string;
  barbershop_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
};

type DbService = {
  id: string;
  barbershop_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
};

type DbWorkingHour = {
  id: string;
  barber_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_active: boolean;
};

type DbAppointment = {
  id: string;
  barbershop_id: string;
  barber_id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: Appointment["status"];
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingContext = {
  barbershop: Barbershop;
  barber: Barber | null;
  services: Service[];
  workingHours: WorkingHour[];
  appointments: Appointment[];
  googleCalendar: {
    isConnected: boolean;
    googleEmail: string | null;
  };
  source: "supabase" | "seed";
};

export async function getBookingContext(slug: string): Promise<BookingContext | null> {
  noStore();

  const supabase = createAdminClient();
  const { data: shop, error: shopError } = await supabase
    .from("barbershops")
    .select("id,name,slug,phone,address,timezone,subscription_status")
    .eq("slug", slug)
    .maybeSingle<DbBarbershop>();

  if (shopError || !shop) {
    return slug === pilotBarbershop.slug ? getSeedContext() : null;
  }

  const [{ data: barberRows }, { data: serviceRows }, { data: appointmentRows }] = await Promise.all([
    supabase
      .from("barbers")
      .select("id,barbershop_id,name,email,phone,is_active")
      .eq("barbershop_id", shop.id)
      .eq("is_active", true)
      .limit(1)
      .returns<DbBarber[]>(),
    supabase
      .from("services")
      .select("id,barbershop_id,name,duration_minutes,price_cents,is_active")
      .eq("barbershop_id", shop.id)
      .eq("is_active", true)
      .order("name")
      .returns<DbService[]>(),
    supabase
      .from("appointments")
      .select(
        "id,barbershop_id,barber_id,service_id,customer_name,customer_phone,appointment_date,start_time,end_time,notes,status,google_calendar_event_id,created_at,updated_at"
      )
      .eq("barbershop_id", shop.id)
      .in("status", ["pending", "confirmed", "rescheduled"])
      .returns<DbAppointment[]>()
  ]);

  const barber = barberRows?.[0];

  const { data: hoursRows } = barber
    ? await supabase
        .from("working_hours")
        .select("id,barber_id,day_of_week,start_time,end_time,break_start,break_end,is_active")
        .eq("barber_id", barber.id)
        .returns<DbWorkingHour[]>()
    : { data: [] as DbWorkingHour[] };

  return {
    barbershop: mapBarbershop(shop),
    barber: barber ? mapBarber(barber) : null,
    services: (serviceRows ?? []).map(mapService),
    workingHours: (hoursRows ?? []).map(mapWorkingHour),
    appointments: (appointmentRows ?? []).map(mapAppointment),
    googleCalendar: {
      isConnected: false,
      googleEmail: null
    },
    source: "supabase"
  };
}

export async function getDashboardContext(): Promise<BookingContext | null> {
  noStore();

  const authClient = await createClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: barber, error: barberError } = await supabase
    .from("barbers")
    .select("id,barbershop_id,name,email,phone,is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle<DbBarber>();

  if (barberError || !barber) {
    return null;
  }

  const { data: shop, error: shopError } = await supabase
    .from("barbershops")
    .select("id,name,slug,phone,address,timezone,subscription_status")
    .eq("id", barber.barbershop_id)
    .maybeSingle<DbBarbershop>();

  if (shopError || !shop) {
    return null;
  }

  const [{ data: serviceRows }, { data: appointmentRows }, { data: hoursRows }, { data: googleConnection }] = await Promise.all([
    supabase
      .from("services")
      .select("id,barbershop_id,name,duration_minutes,price_cents,is_active")
      .eq("barbershop_id", shop.id)
      .order("name")
      .returns<DbService[]>(),
    supabase
      .from("appointments")
      .select(
        "id,barbershop_id,barber_id,service_id,customer_name,customer_phone,appointment_date,start_time,end_time,notes,status,google_calendar_event_id,created_at,updated_at"
      )
      .eq("barbershop_id", shop.id)
      .returns<DbAppointment[]>(),
    supabase
      .from("working_hours")
      .select("id,barber_id,day_of_week,start_time,end_time,break_start,break_end,is_active")
      .eq("barber_id", barber.id)
      .returns<DbWorkingHour[]>(),
    supabase
      .from("google_calendar_connections")
      .select("google_email,is_connected")
      .eq("barber_id", barber.id)
      .maybeSingle()
  ]);

  return {
    barbershop: mapBarbershop(shop),
    barber: mapBarber(barber),
    services: (serviceRows ?? []).map(mapService),
    workingHours: (hoursRows ?? []).map(mapWorkingHour),
    appointments: (appointmentRows ?? []).map(mapAppointment),
    googleCalendar: {
      isConnected: Boolean(googleConnection?.is_connected),
      googleEmail: (googleConnection?.google_email as string | null | undefined) ?? null
    },
    source: "supabase"
  };
}

function getSeedContext(): BookingContext {
  return {
    barbershop: pilotBarbershop,
    barber: pilotBarber,
    services,
    workingHours,
    appointments: demoAppointments,
    googleCalendar: {
      isConnected: false,
      googleEmail: null
    },
    source: "seed"
  };
}

function cleanTime(value: string) {
  return value.slice(0, 5);
}

function mapBarbershop(row: DbBarbershop): Barbershop {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    phone: row.phone,
    address: row.address ?? "",
    timezone: row.timezone,
    subscriptionStatus: row.subscription_status
  };
}

function mapBarber(row: DbBarber): Barber {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    isActive: row.is_active
  };
}

function mapService(row: DbService): Service {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
    isActive: row.is_active
  };
}

function mapWorkingHour(row: DbWorkingHour): WorkingHour {
  return {
    id: row.id,
    barberId: row.barber_id,
    dayOfWeek: row.day_of_week,
    startTime: cleanTime(row.start_time),
    endTime: cleanTime(row.end_time),
    breakStart: row.break_start ? cleanTime(row.break_start) : null,
    breakEnd: row.break_end ? cleanTime(row.break_end) : null,
    isActive: row.is_active
  };
}

function mapAppointment(row: DbAppointment): Appointment {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    barberId: row.barber_id,
    serviceId: row.service_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    appointmentDate: row.appointment_date,
    startTime: cleanTime(row.start_time),
    endTime: cleanTime(row.end_time),
    notes: row.notes,
    status: row.status,
    googleCalendarEventId: row.google_calendar_event_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
