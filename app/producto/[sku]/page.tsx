import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProductDetail, getVariantImages, type ProductDetail } from "@/lib/supabase/queries";
import { ProductSelector } from "@/components/store/ProductSelector";
import { TrackProductView } from "@/components/store/TrackProductView";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { catalogUrl } from "@/app/catalogo/catalogUrl";

export const revalidate = 60;

type Props = { params: Promise<{ sku: string }> };

function productSummary(product: ProductDetail) {
  const active = product.variants.filter((v) => v.active);
  const prices = active.map((v) => v.price);
  const image = active.find((v) => v.primary_image_url)?.primary_image_url ?? null;
  const technique = product.technique ? ` en ${product.technique.toLowerCase()}` : "";
  const description =
    product.description?.trim() ||
    `${product.product_name} personalizado${technique} por ${SITE_NAME}. Sublimación y estampación de alta calidad: elige talla, color y tu diseño.`;
  return {
    active,
    image,
    description,
    lowPrice: prices.length ? Math.min(...prices) : 0,
    highPrice: prices.length ? Math.max(...prices) : 0,
    inStock: active.some((v) => v.stock > 0),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = await getProductDetail(sku);
  if (!product) return { title: "Producto no encontrado", robots: { index: false } };

  const { image, description: fullDescription } = productSummary(product);
  const title = product.product_name;
  const url = `/producto/${sku}`;
  // Search snippets show ~160 chars; cut on a word boundary.
  const description =
    fullDescription.length > 160
      ? `${fullDescription.slice(0, 157).replace(/\s+\S*$/, "")}…`
      : fullDescription;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, alt: product.product_name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
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

  const { active, image, description, lowPrice, highPrice, inStock } = productSummary(product);
  const url = absoluteUrl(`/producto/${productId}`);
  const categoryPath = catalogUrl({ categoria: product.category_slug });
  const categoryUrl = absoluteUrl(categoryPath);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    description,
    image: image ? [image] : undefined,
    url,
    sku: active[0]?.sku,
    category: [product.category_name, product.subcategory_name].filter(Boolean).join(" > "),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "COP",
      lowPrice,
      highPrice,
      offerCount: active.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absoluteUrl("/#organization") },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: absoluteUrl("/catalogo") },
      { "@type": "ListItem", position: 3, name: product.category_name, item: categoryUrl },
      ...(product.subcategory_name && product.subcategory_slug
        ? [{
            "@type": "ListItem",
            position: 4,
            name: product.subcategory_name,
            item: absoluteUrl(catalogUrl({ categoria: product.category_slug, subcategoria: product.subcategory_slug })),
          }]
        : []),
      {
        "@type": "ListItem",
        position: product.subcategory_name ? 5 : 4,
        name: product.product_name,
        item: url,
      },
    ],
  };

  return (
    <div className="section max-w-5xl">
      <JsonLd data={[productLd, breadcrumbLd]} />
      <TrackProductView productId={productId} />

      <Link
        href={categoryPath}
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-8"
      >
        <ChevronLeft size={16} />
        Volver a {product.category_name}
      </Link>

      <ProductSelector product={product} imagesMap={imagesMap} />
    </div>
  );
}
