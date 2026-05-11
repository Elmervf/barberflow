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

export function formatTime12h(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);

  return new Intl.DateTimeFormat("es-SV", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function getTomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
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
