import Image from "next/image";
import Link from "next/link";
import type { CatalogItem } from "@/lib/supabase/types";
import { formatCOP, getStockLabel, getImageUrl } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export function ProductCard({ item }: { item: CatalogItem }) {
  const { label: stockLabel, color: stockColor } = getStockLabel(item.stock);
  const imageUrl = getImageUrl(item.sku, item.design_image);

  return (
    <div className="card-product flex flex-col">
      <Link href={`/producto/${item.sku}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title ?? "Producto"}
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
        {item.category_name && (
          <span className="text-gold text-xs uppercase tracking-widest font-medium">
            {item.category_name}
          </span>
        )}

        <Link href={`/producto/${item.sku}`}>
          <h3 className="text-[#e8e8e8] font-semibold text-sm leading-snug hover:text-gold transition-colors line-clamp-2">
            {item.title}
          </h3>
        </Link>

        {/* Options */}
        <div className="flex flex-wrap gap-1">
          {item.size_abbr && (
            <span className="px-2 py-0.5 rounded text-xs border border-subtle text-muted">
              {item.size_abbr}
            </span>
          )}
          {item.color_name && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border border-subtle text-muted">
              {item.color_hex && (
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/20"
                  style={{ background: item.color_hex }}
                />
              )}
              {item.color_name}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <span className="text-gold font-bold text-base">
              {formatCOP(item.price ?? 0)}
            </span>
            <p className={`text-xs mt-0.5 ${stockColor}`}>{stockLabel}</p>
          </div>
        </div>

        <AddToCartButton item={item} disabled={(item.stock ?? 0) === 0} size="sm" />
      </div>
    </div>
  );
}
