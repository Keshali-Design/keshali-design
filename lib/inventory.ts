import type { SupabaseClient } from "@supabase/supabase-js";

export async function decrementInventory(
  supabase: SupabaseClient,
  categoryId: string,
  sizeId: string,
  colorId: string,
  quantity: number
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("decrement_inventory", {
    p_category_id: categoryId,
    p_size_id: sizeId,
    p_color_id: colorId,
    p_qty: quantity,
  });

  if (error) {
    console.error("[decrementInventory] failed:", error.message);
  }
}
