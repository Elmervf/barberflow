import type { Appointment, Barber, Barbershop, Service, WorkingHour } from "@/lib/types";

export const pilotBarbershop: Barbershop = {
  id: "shop_islands",
  name: "Island's Barber Shop",
  slug: "islands-barber-shop",
  phone: "7974 2998",
  address: "9A Calle Poniente 307 Bis, San Miguel",
  timezone: "America/El_Salvador",
  subscriptionStatus: "trial"
};

export const pilotBarber: Barber = {
  id: "barber_owner",
  barbershopId: pilotBarbershop.id,
  name: "Barbero principal",
  email: "admin@islandsbarber.local",
  phone: "7974 2998",
  isActive: true
};

export const services: Service[] = [
  {
    id: "svc_cut",
    barbershopId: pilotBarbershop.id,
    name: "Corte",
    durationMinutes: 45,
    priceCents: 1200,
    isActive: true
  },
  {
    id: "svc_beard",
    barbershopId: pilotBarbershop.id,
    name: "Solo barba",
    durationMinutes: 20,
    priceCents: 700,
    isActive: true
  },
  {
    id: "svc_cut_beard",
    barbershopId: pilotBarbershop.id,
    name: "Corte + barba",
    durationMinutes: 65,
    priceCents: 1700,
    isActive: true
  },
  {
    id: "svc_facial",
    barbershopId: pilotBarbershop.id,
    name: "Limpieza facial",
    durationMinutes: 30,
    priceCents: 1000,
    isActive: true
  }
];

export const workingHours: WorkingHour[] = [1, 2, 3, 4, 5, 6].map((day) => ({
  id: `wh_${day}`,
  barberId: pilotBarber.id,
  dayOfWeek: day,
  startTime: "09:00",
  endTime: "18:00",
  breakStart: "12:00",
  breakEnd: "13:00",
  isActive: true
}));

const today = new Date();
const isoToday = today.toISOString().slice(0, 10);

export const demoAppointments: Appointment[] = [
  {
    id: "apt_demo_1",
    barbershopId: pilotBarbershop.id,
    barberId: pilotBarber.id,
    serviceId: "svc_cut",
    customerName: "Carlos Martinez",
    customerPhone: "7777 1111",
    appointmentDate: isoToday,
    startTime: "09:00",
    endTime: "09:45",
    notes: "Quiere degradado bajo.",
    status: "confirmed",
    googleCalendarEventId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "apt_demo_2",
    barbershopId: pilotBarbershop.id,
    barberId: pilotBarber.id,
    serviceId: "svc_cut_beard",
    customerName: "Mario Lopez",
    customerPhone: "7888 2222",
    appointmentDate: isoToday,
    startTime: "14:00",
    endTime: "15:05",
    notes: null,
    status: "confirmed",
    googleCalendarEventId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
