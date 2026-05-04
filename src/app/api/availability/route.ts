import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/availability";
import { getBookingContext } from "@/lib/data";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const slug = request.nextUrl.searchParams.get("slug") ?? "islands-barber-shop";
  const context = await getBookingContext(slug);
  const service = context?.services.find((item) => item.id === serviceId);

  if (!date || !service || !context) {
    return NextResponse.json({ error: "date, serviceId and valid slug are required" }, { status: 400 });
  }

  return NextResponse.json({
    slots: getAvailableSlots({
      date,
      service,
      workingHours: context.workingHours,
      appointments: context.appointments
    })
  });
}
