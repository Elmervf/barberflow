import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/google/calendar";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const barberId = request.nextUrl.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code || !barberId) {
    return NextResponse.redirect(new URL("/dashboard/settings?google=failed", appUrl));
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: profile } = await oauth2.userinfo.get();
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("google_calendar_connections")
      .select("id,refresh_token_encrypted")
      .eq("barber_id", barberId)
      .maybeSingle();

    const payload = {
      barber_id: barberId,
      google_email: profile.email ?? null,
      calendar_id: "primary",
      access_token_encrypted: tokens.access_token ?? null,
      refresh_token_encrypted: tokens.refresh_token ?? existing?.refresh_token_encrypted ?? null,
      token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      is_connected: true,
      updated_at: new Date().toISOString()
    };

    if (existing?.id) {
      await supabase.from("google_calendar_connections").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("google_calendar_connections").insert(payload);
    }

    return NextResponse.redirect(new URL("/dashboard/settings?google=connected", appUrl));
  } catch {
    return NextResponse.redirect(new URL("/dashboard/settings?google=failed", appUrl));
  }
}
