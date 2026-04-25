"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("orders") as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { error: null };
}
