import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditProductForm } from "@/components/admin/EditProductForm";

export const metadata = { title: "Editar producto — Admin" };

export type VariantWithImages = {
  id: string;
  sku: string;
  price_override: number | null;
  active: boolean;
  colors: { id: string; name: string; hex_code: string } | null;
  sizes: { id: string; label: string; alt_label: string | null } | null;
  images: { id: string; url: string; alt_text: string | null; sort_order: number; is_primary: boolean }[];
};

export type ProductFull = {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  price_varies_by_color: boolean;
  categories: { name: string } | null;
  product_sizes: { size_id: string; price: number }[];
  variants: VariantWithImages[];
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Load product with its variants
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product } = await (supabase.from("products") as any)
    .select(`
      id, name, description, active, price_varies_by_color,
      categories!category_id ( name ),
      product_sizes ( size_id, price ),
      product_variants (
        id, sku, price_override, active,
        colors ( id, name, hex_code ),
        sizes ( id, label, alt_label )
      )
    `)
    .eq("id", id)
    .single() as { data: Omit<ProductFull, "variants"> & {
      product_variants: Omit<VariantWithImages, "images">[];
    } | null };

  if (!product) notFound();

  // Load images for all variants
  const variantIds = product.product_variants.map((v) => v.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allImages } = await (supabase.from("product_images") as any)
    .select("id, variant_id, url, alt_text, sort_order, is_primary")
    .in("variant_id", variantIds.length > 0 ? variantIds : ["__none__"])
    .order("sort_order") as {
      data: { id: string; variant_id: string; url: string; alt_text: string | null; sort_order: number; is_primary: boolean }[] | null;
    };

  const imagesByVariant: Record<string, VariantWithImages["images"]> = {};
  for (const img of allImages ?? []) {
    if (!imagesByVariant[img.variant_id]) imagesByVariant[img.variant_id] = [];
    imagesByVariant[img.variant_id].push(img);
  }

  const variants: VariantWithImages[] = product.product_variants.map((v) => ({
    ...v,
    images: imagesByVariant[v.id] ?? [],
  }));

  const productFull: ProductFull = {
    id: product.id,
    name: product.name,
    description: product.description,
    active: product.active,
    price_varies_by_color: product.price_varies_by_color,
    categories: product.categories,
    product_sizes: product.product_sizes,
    variants,
  };

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-6"
      >
        <ChevronLeft size={16} />
        Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">{product.name}</h1>
      <p className="text-muted text-xs mb-8">
        {product.categories?.name} · {variants.length} variant{variants.length !== 1 ? "es" : "e"}
      </p>

      <EditProductForm product={productFull} />
    </div>
  );
}
