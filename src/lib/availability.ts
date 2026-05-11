import type { Appointment, Service, WorkingHour } from "@/lib/types";
import { minutesToTime, timeToMinutes } from "@/lib/format";

type AvailabilityInput = {
  date: string;
  service: Service;
  workingHours: WorkingHour[];
  appointments: Appointment[];
  slotStepMinutes?: number;
};

export function getAvailableSlots({
  date,
  service,
  workingHours,
  appointments,
  slotStepMinutes = 15
}: AvailabilityInput) {
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const workingDay = workingHours.find((item) => item.dayOfWeek === dayOfWeek && item.isActive);

  if (!workingDay) {
    return [];
  }

  const start = timeToMinutes(workingDay.startTime);
  const end = timeToMinutes(workingDay.endTime);
  const breakStart = workingDay.breakStart ? timeToMinutes(workingDay.breakStart) : null;
  const breakEnd = workingDay.breakEnd ? timeToMinutes(workingDay.breakEnd) : null;

  const booked = appointments.filter(
    (appointment) =>
      appointment.appointmentDate === date &&
      ["pending", "confirmed", "rescheduled"].includes(appointment.status)
  );

  const slots: string[] = [];

  for (let slotStart = start; slotStart + service.durationMinutes <= end; slotStart += slotStepMinutes) {
    const slotEnd = slotStart + service.durationMinutes;
    const overlapsBreak =
      breakStart !== null && breakEnd !== null && rangesOverlap(slotStart, slotEnd, breakStart, breakEnd);
    const overlapsAppointment = booked.some((appointment) =>
      rangesOverlap(slotStart, slotEnd, timeToMinutes(appointment.startTime), timeToMinutes(appointment.endTime))
    );

    if (!overlapsBreak && !overlapsAppointment) {
      slots.push(minutesToTime(slotStart));
    }
  }

  return slots;
}

export function getEndTime(startTime: string, durationMinutes: number) {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA;
}
