export function formatMoney(cents: number) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat("es-SV", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date(`${date}T12:00:00`));
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
