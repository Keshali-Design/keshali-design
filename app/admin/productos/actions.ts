"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function toSlug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function autoSku(productName: string, colorCode: string, sizeLabel: string) {
  const p = toSlug(productName).toUpperCase().slice(0, 6).replace(/-/g, "");
  const c = colorCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  const s = sizeLabel.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
  return `${p}-${c}-${s}`;
}

export type ProductSizeInput = { size_id: string; price: number };
export type ProductColorInput = { color_id: string };
export type VariantSkuOverride = {
  color_id: string;
  size_id: string;
  sku?: string;
  price_override?: number | null;
};

export async function createProduct(data: {
  category_id: string;
  subcategory_id?: string;
  name: string;
  description?: string;
  price_varies_by_color: boolean;
  sizes: ProductSizeInput[];
  colors: ProductColorInput[];
  variantOverrides: VariantSkuOverride[];
}) {
  const supabase = createAdminClient();

  // 1. Insert product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product, error: productError } = await (supabase.from("products") as any)
    .insert({
      category_id: data.category_id,
      subcategory_id: data.subcategory_id || null,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price_varies_by_color: data.price_varies_by_color,
      active: true,
    })
    .select("id")
    .single();

  if (productError) return { error: productError.message };
  const productId = product.id;

  // 2. Insert product_sizes
  if (data.sizes.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("product_sizes") as any).insert(
      data.sizes.map((s) => ({ product_id: productId, size_id: s.size_id, price: s.price }))
    );
    if (error) return { error: error.message };
  }

  // 3. Insert product_colors
  if (data.colors.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("product_colors") as any).insert(
      data.colors.map((c) => ({ product_id: productId, color_id: c.color_id }))
    );
    if (error) return { error: error.message };
  }

  // 4. Fetch color_codes + size_labels for SKU auto-generation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: colors } = await (supabase.from("colors") as any)
    .select("id, color_code")
    .in("id", data.colors.map((c) => c.color_id)) as { data: { id: string; color_code: string }[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sizes } = await (supabase.from("sizes") as any)
    .select("id, label")
    .in("id", data.sizes.map((s) => s.size_id)) as { data: { id: string; label: string }[] | null };

  const colorMap = Object.fromEntries((colors ?? []).map((c) => [c.id, c.color_code]));
  const sizeMap = Object.fromEntries((sizes ?? []).map((s) => [s.id, s.label]));

  // 5. Auto-generate variants (color × size)
  const variants = [];
  for (const color of data.colors) {
    for (const size of data.sizes) {
      const override = data.variantOverrides.find(
        (v) => v.color_id === color.color_id && v.size_id === size.size_id
      );
      const baseSku = autoSku(data.name, colorMap[color.color_id] ?? "", sizeMap[size.size_id] ?? "");
      variants.push({
        product_id: productId,
        color_id: color.color_id,
        size_id: size.size_id,
        sku: override?.sku?.trim() || baseSku,
        price_override: data.price_varies_by_color ? (override?.price_override ?? null) : null,
        active: true,
      });
    }
  }

  if (variants.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("product_variants") as any).insert(variants);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null, productId };
}

export async function updateProduct(
  id: string,
  data: { name: string; description?: string; active: boolean }
) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("products") as any)
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      active: data.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { error: null };
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("products") as any).delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null };
}
