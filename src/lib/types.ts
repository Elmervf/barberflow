export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "completed"
  | "no_show";

export type Barbershop = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  timezone: string;
  subscriptionStatus: "trial" | "active" | "past_due" | "cancelled";
};

export type Barber = {
  id: string;
  barbershopId: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
};

export type Service = {
  id: string;
  barbershopId: string;
  name: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
};

export type WorkingHour = {
  id: string;
  barberId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isActive: boolean;
};

export type Appointment = {
  id: string;
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: AppointmentStatus;
  googleCalendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
};
