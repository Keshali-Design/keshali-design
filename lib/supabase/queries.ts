import { createClient } from "./server";
import type { CatalogItem, Category, ProductImage } from "./types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getCatalogItems(options?: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
}): Promise<CatalogItem[]> {
  const supabase = await createClient();
  let query = supabase.from("catalog_view").select("*");

  if (options?.categorySlug) {
    query = query.eq("category_slug", options.categorySlug);
  }
  if (options?.limit) {
    const offset = options.offset ?? 0;
    query = query.range(offset, offset + options.limit - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getCatalogItem(sku: string): Promise<CatalogItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalog_view")
    .select("*")
    .eq("sku", sku)
    .single();

  if (error) return null;
  return data;
}

export async function getVariantImages(variantId: string): Promise<ProductImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("variant_id", variantId)
    .order("sort_order")
    .returns<ProductImage[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedCatalogItems(limit = 12): Promise<CatalogItem[]> {
  return getCatalogItems({ limit });
}
