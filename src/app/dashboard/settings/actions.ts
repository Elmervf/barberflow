"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentBarberForWrite } from "@/lib/dashboard-auth";

const shopSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  address: z.string().trim().min(3),
  timezone: z.string().trim().min(3)
});

const hoursSchema = z.object({
  id: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  breakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  isActive: z.boolean()
});

export async function updateBarbershop(formData: FormData) {
  const input = shopSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    timezone: formData.get("timezone")
  });
  const { supabase, barbershopId } = await getCurrentBarberForWrite();

  await supabase
    .from("barbershops")
    .update({
      name: input.name,
      phone: input.phone,
      address: input.address,
      timezone: input.timezone,
      updated_at: new Date().toISOString()
    })
    .eq("id", barbershopId);

  revalidatePath("/dashboard/settings");
  revalidatePath("/book/[barbershopSlug]", "page");
}

export async function updateWorkingHour(formData: FormData) {
  const input = hoursSchema.parse({
    id: formData.get("id"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    breakStart: formData.get("breakStart"),
    breakEnd: formData.get("breakEnd"),
    isActive: formData.get("isActive") === "on"
  });
  const { supabase, barberId } = await getCurrentBarberForWrite();

  await supabase
    .from("working_hours")
    .update({
      start_time: input.startTime,
      end_time: input.endTime,
      break_start: input.breakStart || null,
      break_end: input.breakEnd || null,
      is_active: input.isActive
    })
    .eq("id", input.id)
    .eq("barber_id", barberId);

  revalidatePath("/dashboard/settings");
  revalidatePath("/book/[barbershopSlug]", "page");
}
