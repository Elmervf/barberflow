import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase/admin";

type CalendarEventInput = {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  notes?: string | null;
};

type AppointmentCalendarInput = CalendarEventInput & {
  appointmentId: string;
  barberId: string;
};

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function hasGoogleConfig() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
}

export function getCalendarAuthUrl(state: string) {
  const oauth2Client = getGoogleOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    state,
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly"
    ]
  });
}

export function buildCalendarEvent(input: CalendarEventInput) {
  return {
    summary: `${input.serviceName} - ${input.customerName}`,
    description: `Telefono: ${input.customerPhone}\nNotas: ${input.notes ?? ""}`,
    start: {
      dateTime: `${input.date}T${input.startTime}:00`,
      timeZone: input.timezone
    },
    end: {
      dateTime: `${input.date}T${input.endTime}:00`,
      timeZone: input.timezone
    }
  };
}

export async function getCalendarConnection(barberId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("google_calendar_connections")
    .select("id,barber_id,google_email,calendar_id,access_token_encrypted,refresh_token_encrypted,token_expires_at,is_connected")
    .eq("barber_id", barberId)
    .eq("is_connected", true)
    .maybeSingle();

  return data;
}

export async function syncCreateCalendarEvent(input: AppointmentCalendarInput) {
  if (!hasGoogleConfig()) {
    return { eventId: null, error: "Google Calendar env vars missing" };
  }

  const connection = await getCalendarConnection(input.barberId);
  if (!connection?.refresh_token_encrypted) {
    return { eventId: null, error: "Google Calendar not connected" };
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: connection.access_token_encrypted,
      refresh_token: connection.refresh_token_encrypted,
      expiry_date: connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : undefined
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const result = await calendar.events.insert({
      calendarId: connection.calendar_id || "primary",
      requestBody: buildCalendarEvent(input)
    });

    const eventId = result.data.id ?? null;
    const supabase = createAdminClient();
    await supabase
      .from("appointments")
      .update({
        google_calendar_event_id: eventId,
        google_calendar_sync_error: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.appointmentId);

    return { eventId, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Calendar sync failed";
    await createAdminClient()
      .from("appointments")
      .update({ google_calendar_sync_error: message, updated_at: new Date().toISOString() })
      .eq("id", input.appointmentId);
    return { eventId: null, error: message };
  }
}

export async function syncUpdateCalendarEvent(input: AppointmentCalendarInput & { eventId: string | null }) {
  if (!input.eventId || !hasGoogleConfig()) {
    return;
  }

  const connection = await getCalendarConnection(input.barberId);
  if (!connection?.refresh_token_encrypted) {
    return;
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: connection.access_token_encrypted,
      refresh_token: connection.refresh_token_encrypted,
      expiry_date: connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : undefined
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.update({
      calendarId: connection.calendar_id || "primary",
      eventId: input.eventId,
      requestBody: buildCalendarEvent(input)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Calendar update failed";
    await createAdminClient()
      .from("appointments")
      .update({ google_calendar_sync_error: message, updated_at: new Date().toISOString() })
      .eq("id", input.appointmentId);
  }
}

export async function syncCancelCalendarEvent(input: { appointmentId: string; barberId: string; eventId: string | null }) {
  if (!input.eventId || !hasGoogleConfig()) {
    return;
  }

  const connection = await getCalendarConnection(input.barberId);
  if (!connection?.refresh_token_encrypted) {
    return;
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: connection.access_token_encrypted,
      refresh_token: connection.refresh_token_encrypted,
      expiry_date: connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : undefined
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    await calendar.events.delete({
      calendarId: connection.calendar_id || "primary",
      eventId: input.eventId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Calendar cancel failed";
    await createAdminClient()
      .from("appointments")
      .update({ google_calendar_sync_error: message, updated_at: new Date().toISOString() })
      .eq("id", input.appointmentId);
  }
}
