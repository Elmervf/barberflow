import { NextResponse } from "next/server";
import { getCalendarAuthUrl, hasGoogleConfig } from "@/lib/google/calendar";
import { getCurrentBarberForWrite } from "@/lib/dashboard-auth";

export async function GET() {
  if (!hasGoogleConfig()) {
    return NextResponse.redirect(new URL("/dashboard/settings?google=missing-config", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const { barberId } = await getCurrentBarberForWrite();
  const url = getCalendarAuthUrl(barberId);
  return NextResponse.redirect(url);
}
