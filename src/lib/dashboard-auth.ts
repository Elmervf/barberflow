import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentBarberForWrite() {
  const authClient = await createClient();
  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = createAdminClient();
  const { data: barber, error } = await supabase
    .from("barbers")
    .select("id,barbershop_id,user_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (error || !barber) {
    throw new Error("No barbershop assigned");
  }

  return {
    supabase,
    barberId: barber.id as string,
    barbershopId: barber.barbershop_id as string,
    userId: user.id
  };
}
