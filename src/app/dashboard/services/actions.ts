"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentBarberForWrite } from "@/lib/dashboard-auth";

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  durationMinutes: z.coerce.number().int().min(5).max(240),
  price: z.coerce.number().min(0).max(1000),
  isActive: z.boolean()
});

function parseServiceForm(formData: FormData) {
  return serviceSchema.parse({
    name: formData.get("name"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    isActive: formData.get("isActive") === "on"
  });
}

export async function createService(formData: FormData) {
  const input = parseServiceForm(formData);
  const { supabase, barbershopId } = await getCurrentBarberForWrite();

  await supabase.from("services").insert({
    barbershop_id: barbershopId,
    name: input.name,
    duration_minutes: input.durationMinutes,
    price_cents: Math.round(input.price * 100),
    is_active: input.isActive
  });

  revalidatePath("/dashboard/services");
  revalidatePath("/book/[barbershopSlug]", "page");
}

export async function updateService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const input = parseServiceForm(formData);
  const { supabase, barbershopId } = await getCurrentBarberForWrite();

  await supabase
    .from("services")
    .update({
      name: input.name,
      duration_minutes: input.durationMinutes,
      price_cents: Math.round(input.price * 100),
      is_active: input.isActive,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .eq("barbershop_id", barbershopId);

  revalidatePath("/dashboard/services");
  revalidatePath("/book/[barbershopSlug]", "page");
}

export async function deactivateService(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase, barbershopId } = await getCurrentBarberForWrite();

  await supabase
    .from("services")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("barbershop_id", barbershopId);

  revalidatePath("/dashboard/services");
  revalidatePath("/book/[barbershopSlug]", "page");
}
