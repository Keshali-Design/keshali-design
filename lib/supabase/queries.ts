import { createClient } from "./server";

// ── Types ─────────────────────────────────────────────────────

export type CatalogProduct = {
  product_id: string;
  product_name: string;
  description: string | null;
  category_id: string;
  category_name: string;
  category_slug: string;
  price_varies_by_color: boolean;
  min_price: number;
  max_price: number;
  primary_image_url: string | null;
  total_stock: number;
};

export type ProductVariantDetail = {
  variant_id: string;
  sku: string;
  stock: number;
  active: boolean;
  price: number;
  price_override: number | null;
  size_id: string;
  size_label: string;
  alt_value: string | null;
  alt_label: string | null;
  size_sort_order: number;
  color_id: string;
  color_name: string;
  hex_code: string;
  primary_image_url: string | null;
};

export type ProductDetail = {
  product_id: string;
  product_name: string;
  description: string | null;
  price_varies_by_color: boolean;
  category_name: string;
  category_slug: string;
  size_type_name: string;
  unit_label: string;
  variants: ProductVariantDetail[];
};

export type Category = { id: string; name: string; slug: string; active: boolean };

// ── Categories ────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, active")
    .eq("active", true)
    .order("name");
  return (data as Category[]) ?? [];
}

// ── Catalog listing (one card per product) ────────────────────

export async function getCatalogProducts(options?: {
  categorySlug?: string;
}): Promise<CatalogProduct[]> {
  const supabase = await createClient();

  // Use catalog_view, group by product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("catalog_view") as any)
    .select("product_id, product_name, description, category_id, category_name, category_slug, price_varies_by_color, price, stock, primary_image_url, variant_active, product_active, category_active");

  if (options?.categorySlug) {
    query = query.eq("category_slug", options.categorySlug);
  }

  const { data } = await query as { data: {
    product_id: string;
    product_name: string;
    description: string | null;
    category_id: string;
    category_name: string;
    category_slug: string;
    price_varies_by_color: boolean;
    price: number;
    stock: number;
    primary_image_url: string | null;
    variant_active: boolean;
    product_active: boolean;
    category_active: boolean;
  }[] | null };

  if (!data) return [];

  // Filter active only + group by product
  const active = data.filter((r) => r.variant_active && r.product_active && r.category_active);
  const map = new Map<string, CatalogProduct>();

  for (const row of active) {
    const existing = map.get(row.product_id);
    if (!existing) {
      map.set(row.product_id, {
        product_id: row.product_id,
        product_name: row.product_name,
        description: row.description,
        category_id: row.category_id,
        category_name: row.category_name,
        category_slug: row.category_slug,
        price_varies_by_color: row.price_varies_by_color,
        min_price: row.price,
        max_price: row.price,
        primary_image_url: row.primary_image_url,
        total_stock: row.stock,
      });
    } else {
      existing.min_price = Math.min(existing.min_price, row.price);
      existing.max_price = Math.max(existing.max_price, row.price);
      existing.total_stock += row.stock;
      if (!existing.primary_image_url && row.primary_image_url) {
        existing.primary_image_url = row.primary_image_url;
      }
    }
  }

  return Array.from(map.values());
}

// ── Product detail (all variants) ────────────────────────────

export async function getProductDetail(productId: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("catalog_view") as any)
    .select("*")
    .eq("product_id", productId)
    .eq("product_active", true)
    .eq("category_active", true) as { data: {
      variant_id: string;
      sku: string;
      stock: number;
      variant_active: boolean;
      price: number;
      price_override: number | null;
      size_id: string;
      size_label: string;
      alt_value: string | null;
      alt_label: string | null;
      size_sort_order: number;
      color_id: string;
      color_name: string;
      hex_code: string;
      primary_image_url: string | null;
      product_id: string;
      product_name: string;
      description: string | null;
      price_varies_by_color: boolean;
      category_name: string;
      category_slug: string;
      size_type_name: string;
      unit_label: string;
    }[] | null };

  if (!data || data.length === 0) return null;

  const first = data[0];
  return {
    product_id: first.product_id,
    product_name: first.product_name,
    description: first.description,
    price_varies_by_color: first.price_varies_by_color,
    category_name: first.category_name,
    category_slug: first.category_slug,
    size_type_name: first.size_type_name,
    unit_label: first.unit_label,
    variants: data.map((v) => ({
      variant_id: v.variant_id,
      sku: v.sku,
      stock: v.stock,
      active: v.variant_active,
      price: v.price,
      price_override: v.price_override,
      size_id: v.size_id,
      size_label: v.size_label,
      alt_value: v.alt_value,
      alt_label: v.alt_label,
      size_sort_order: v.size_sort_order,
      color_id: v.color_id,
      color_name: v.color_name,
      hex_code: v.hex_code,
      primary_image_url: v.primary_image_url,
    })),
  };
}

// ── Variant images ────────────────────────────────────────────

export async function getVariantImages(variantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_images")
    .select("id, url, alt_text, is_primary, sort_order")
    .eq("variant_id", variantId)
    .order("sort_order");
  return data ?? [];
}
