"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/** Upsert stock for a category+size+color combination */
export async function upsertInventory(
  categoryId: string,
  sizeId: string,
  colorId: string,
  stock: number
) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("inventory") as any)
    .upsert(
      {
        category_id: categoryId,
        size_id: sizeId,
        color_id: colorId,
        stock,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "category_id,size_id,color_id" }
    );

  if (error) return { error: error.message };

  revalidatePath("/admin/stock");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null };
}

export async function toggleVariantActive(variantId: string, active: boolean) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("product_variants") as any)
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", variantId);
  if (error) return { error: error.message };
  revalidatePath("/admin/stock");
  revalidatePath("/catalogo");
  return { error: null };
}
