import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/supabase/queries";
import { formatCOP } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const inStock = product.total_stock > 0;
  const priceLabel =
    product.min_price === product.max_price
      ? formatCOP(product.min_price)
      : `${formatCOP(product.min_price)} – ${formatCOP(product.max_price)}`;

  return (
    <div className="card-product flex flex-col">
      <Link href={`/producto/${product.product_id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {product.primary_image_url ? (
            <Image
              src={product.primary_image_url}
              alt={product.product_name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <ImagePlaceholder className="w-full h-full" />
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <span className="text-gold text-xs uppercase tracking-widest font-medium">
          {product.category_name}
        </span>

        <Link href={`/producto/${product.product_id}`}>
          <h3 className="text-[#e8e8e8] font-semibold text-sm leading-snug hover:text-gold transition-colors line-clamp-2">
            {product.product_name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-muted text-xs line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-gold font-bold text-base">{priceLabel}</span>
            <p className={`text-xs mt-0.5 ${inStock ? "text-emerald-400" : "text-red-400"}`}>
              {inStock ? "Disponible" : "Sin stock"}
            </p>
          </div>
        </div>

        <Link
          href={`/producto/${product.product_id}`}
          className="btn-gold text-sm py-2 text-center mt-1"
        >
          Ver opciones
        </Link>
      </div>
    </div>
  );
}
