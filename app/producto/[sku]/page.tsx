import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCatalogItem, getVariantImages } from "@/lib/supabase/queries";
import { formatCOP, getStockLabel, getImageUrl } from "@/lib/utils";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export const revalidate = 60;

type Props = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: Props) {
  const { sku } = await params;
  const item = await getCatalogItem(sku);
  if (!item) return {};
  return { title: `${item.title} — Keshali Design` };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const [item, images] = await Promise.all([
    getCatalogItem(sku),
    (async () => {
      const i = await getCatalogItem(sku);
      if (!i?.variant_id) return [];
      return getVariantImages(i.variant_id);
    })(),
  ]);

  if (!item) notFound();

  const { label: stockLabel, color: stockColor } = getStockLabel(item.stock);
  const primaryImage =
    images.find((i) => i.is_primary)?.url ??
    images[0]?.url ??
    getImageUrl(item.sku, item.design_image);

  return (
    <div className="section max-w-5xl">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-8"
      >
        <ChevronLeft size={16} />
        Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="glass rounded-card overflow-hidden aspect-square relative">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={item.title ?? "Producto"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            {item.category_name && (
              <Link
                href={`/catalogo?categoria=${item.category_slug}`}
                className="text-gold text-xs uppercase tracking-widest font-medium hover:underline"
              >
                {item.category_name}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold mt-1 text-[#e8e8e8]">
              {item.title}
            </h1>
            {item.product_name && item.product_name !== item.title && (
              <p className="text-muted text-sm mt-1">{item.product_name}</p>
            )}
          </div>

          <div className="text-3xl font-bold gold-text">
            {formatCOP(item.price ?? 0)}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {item.size_abbr && (
              <span className="px-3 py-1 rounded-full text-xs border border-subtle text-muted">
                Talla: {item.size_abbr}
              </span>
            )}
            {item.color_name && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-subtle text-muted">
                {item.color_hex && (
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ background: item.color_hex }}
                  />
                )}
                {item.color_name}
              </span>
            )}
            {item.capacity && (
              <span className="px-3 py-1 rounded-full text-xs border border-subtle text-muted">
                {item.capacity}
              </span>
            )}
            {item.material && (
              <span className="px-3 py-1 rounded-full text-xs border border-subtle text-muted">
                {item.material}
              </span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium ${stockColor}`}>
            ● {stockLabel}
            {item.stock != null && item.stock > 0 && ` (${item.stock} uds.)`}
          </p>

          {/* SKU */}
          <p className="text-xs text-muted font-mono">Ref: {item.sku}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <AddToCartButton item={item} disabled={(item.stock ?? 0) === 0} />
            <a
              href={`https://wa.me/573177301489?text=${encodeURIComponent(
                `Hola, quiero pedir: ${item.title} (Ref: ${item.sku}) — ${formatCOP(item.price ?? 0)}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-center text-sm"
            >
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Design info */}
      {item.design_name && (
        <div className="mt-10 glass rounded-card p-6">
          <h2 className="text-gold font-semibold mb-2">Diseño</h2>
          <p className="text-[#e8e8e8]">{item.design_name}</p>
          {item.design_ref && (
            <p className="text-xs text-muted mt-1 font-mono">
              Ref diseño: {item.design_ref}
            </p>
          )}
          {item.design_tags && item.design_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.design_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-xs bg-gold/10 text-gold border border-gold/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
