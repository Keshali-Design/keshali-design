"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateVariant(
  id: string,
  values: { price: number; stock: number; active: boolean }
) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("product_variants") as any)
    .update({
      price: values.price,
      stock: values.stock,
      active: values.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null };
}
