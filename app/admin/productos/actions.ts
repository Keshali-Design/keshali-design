"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type CreateVariantInput = {
  // Product (base)
  productId: string | null;
  newProduct: {
    categoryId: string;
    modelCode: string;
    name: string;
    material: string;
    capacity: string;
    baseCost: number;
  } | null;

  // Variant
  sku: string;
  title: string;
  price: number;
  stock: number;
  active: boolean;
  designId: string | null;
  colorId: string | null;
  sizeId: string | null;
};

export async function createVariant(
  input: CreateVariantInput,
  imageFile: FormData | null
): Promise<{ error: string | null; sku: string | null }> {
  const supabase = createAdminClient();

  // 1. Create new product if needed
  let productId = input.productId;
  if (!productId && input.newProduct) {
    const np = input.newProduct;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: product, error } = await (supabase.from("products") as any)
      .insert({
        model_code: np.modelCode,
        name: np.name,
        material: np.material || null,
        capacity: np.capacity || null,
        base_cost: np.baseCost,
        sale_price: np.baseCost,
        stock: input.stock,
        active: input.active,
        category_id: np.categoryId,
      })
      .select("id")
      .single();

    if (error) return { error: `Error creando producto: ${error.message}`, sku: null };
    productId = product.id;
  }

  if (!productId) return { error: "Debes seleccionar o crear un producto base.", sku: null };

  // 2. Create variant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: variant, error: variantError } = await (supabase.from("product_variants") as any)
    .insert({
      sku: input.sku,
      product_id: productId,
      design_id: input.designId || null,
      color_id: input.colorId || null,
      size_id: input.sizeId || null,
      title: input.title,
      price: input.price,
      stock: input.stock,
      active: input.active,
    })
    .select("id")
    .single();

  if (variantError) return { error: `Error creando variante: ${variantError.message}`, sku: null };

  // 3. Upload images if provided
  if (imageFile) {
    const files = imageFile.getAll("images") as File[];
    const validFiles = files.filter((f) => f.size > 0);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const isPrimary = i === 0;
      // Primary → {sku}.png, extras → {sku}-2.png, {sku}-3.png …
      const fileName = isPrimary ? `${input.sku}.png` : `${input.sku}-${i + 1}.png`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { contentType: file.type, upsert: true });

      if (uploadError) {
        console.error(`Image ${i + 1} upload failed:`, uploadError.message);
        continue;
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("product_images") as any).insert({
        variant_id: variant.id,
        url,
        is_primary: isPrimary,
        sort_order: i,
      });
    }
  }

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");

  return { error: null, sku: input.sku };
}
