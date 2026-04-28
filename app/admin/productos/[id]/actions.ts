"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateVariantFull(
  id: string,
  values: { title: string; price: number; stock: number; active: boolean }
) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("product_variants") as any)
    .update({
      title: values.title,
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

export async function deleteVariantImage(imageId: string, fileName: string) {
  const supabase = createAdminClient();

  // Remove from storage
  await supabase.storage.from("product-images").remove([fileName]);

  // Remove from DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("product_images") as any)
    .delete()
    .eq("id", imageId);

  if (error) return { error: error.message };

  revalidatePath("/admin/productos");
  return { error: null };
}

export async function addVariantImages(variantId: string, sku: string, formData: FormData) {
  const supabase = createAdminClient();

  // Get current image count to name extras correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("product_images") as any)
    .select("id")
    .eq("variant_id", variantId);

  const currentCount = existing?.length ?? 0;
  const files = formData.getAll("images") as File[];
  const valid = files.filter((f) => f.size > 0);

  for (let i = 0; i < valid.length; i++) {
    const file = valid[i];
    const index = currentCount + i;
    const isPrimary = index === 0;
    const fileName = isPrimary ? `${sku}.png` : `${sku}-${index + 1}.png`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      continue;
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("product_images") as any).insert({
      variant_id: variantId,
      url,
      is_primary: isPrimary,
      sort_order: index,
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  return { error: null };
}
