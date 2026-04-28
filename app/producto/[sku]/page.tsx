import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProductDetail, getVariantImages } from "@/lib/supabase/queries";
import { ProductSelector } from "@/components/store/ProductSelector";

export const revalidate = 60;

type Props = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: Props) {
  const { sku } = await params;
  const product = await getProductDetail(sku);
  if (!product) return {};
  return { title: `${product.product_name} — Keshali Design` };
}

export default async function ProductPage({ params }: Props) {
  // `sku` param is now used as product_id (route kept as [sku] to avoid breaking links during transition)
  const { sku: productId } = await params;
  const product = await getProductDetail(productId);
  if (!product) notFound();

  // Preload images for all variants
  const variantImages = await Promise.all(
    product.variants.map(async (v) => ({
      variantId: v.variant_id,
      images: await getVariantImages(v.variant_id),
    }))
  );
  const imagesMap = Object.fromEntries(variantImages.map((vi) => [vi.variantId, vi.images]));

  return (
    <div className="section max-w-5xl">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-8"
      >
        <ChevronLeft size={16} />
        Volver al catálogo
      </Link>

      <ProductSelector product={product} imagesMap={imagesMap} />
    </div>
  );
}
