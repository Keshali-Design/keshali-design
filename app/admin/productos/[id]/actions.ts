"use server";

import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { s3Upload, s3Delete } from "@/lib/aws/s3";

export async function updateVariantFull(
  id: string,
  values: { sku: string; price_override: number | null; active: boolean }
) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("product_variants") as any)
    .update({
      sku: values.sku,
      price_override: values.price_override,
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

export async function deleteVariantImage(imageId: string, s3Key: string) {
  const supabase = createAdminClient();

  try {
    await s3Delete(s3Key);
  } catch {
    // continue even if the file was already gone
  }

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
    const key = isPrimary
      ? `product-images/${sku}.webp`
      : `product-images/${sku}-${index + 1}.webp`;

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(rawBuffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    let url: string;
    try {
      url = await s3Upload(key, webpBuffer, "image/webp");
    } catch (e) {
      console.error("Upload error:", (e as Error).message);
      continue;
    }

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
