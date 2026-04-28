"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatCOP, getStockLabel } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { ProductDetail } from "@/lib/supabase/queries";

type VariantImage = { id: string; url: string; alt_text: string | null; is_primary: boolean; sort_order: number };

export function ProductSelector({
  product,
  imagesMap,
}: {
  product: ProductDetail;
  imagesMap: Record<string, VariantImage[]>;
}) {
  const { addItem, openCart } = useCart();

  // Deduplicated sizes (sorted)
  const sizes = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .filter((v) => { if (seen.has(v.size_id)) return false; seen.add(v.size_id); return true; })
      .sort((a, b) => a.size_sort_order - b.size_sort_order);
  }, [product.variants]);

  const [selectedSizeId, setSelectedSizeId] = useState<string>(sizes[0]?.size_id ?? "");
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Colors available for the selected size
  const colorsForSize = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .filter((v) => v.size_id === selectedSizeId && v.active)
      .filter((v) => { if (seen.has(v.color_id)) return false; seen.add(v.color_id); return true; });
  }, [product.variants, selectedSizeId]);

  // Auto-select first available color when size changes
  const effectiveColorId = selectedColorId && colorsForSize.find((c) => c.color_id === selectedColorId)
    ? selectedColorId
    : (colorsForSize[0]?.color_id ?? "");

  // Selected variant
  const selectedVariant = product.variants.find(
    (v) => v.size_id === selectedSizeId && v.color_id === effectiveColorId
  ) ?? null;

  // Images for selected variant
  const images = selectedVariant ? (imagesMap[selectedVariant.variant_id] ?? []) : [];
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const primaryImg = images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
  const activeImg = images[activeImgIdx]?.url ?? primaryImg;

  const { label: stockLabel, color: stockColor } = getStockLabel(selectedVariant?.stock ?? 0);
  const outOfStock = (selectedVariant?.stock ?? 0) === 0;

  function handleAddToCart() {
    if (!selectedVariant) return;
    const color = colorsForSize.find((c) => c.color_id === effectiveColorId);
    const size = sizes.find((s) => s.size_id === selectedSizeId);

    addItem({
      variantId: selectedVariant.variant_id,
      sku: selectedVariant.sku,
      productName: product.product_name,
      colorName: color?.color_name ?? "",
      sizeLabel: size?.size_label ?? "",
      price: selectedVariant.price,
      quantity,
      image: activeImg,
      categoryName: product.category_name,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid md:grid-cols-2 gap-10">
      {/* Images */}
      <div className="flex flex-col gap-3">
        <div className="glass rounded-card overflow-hidden aspect-square relative">
          {activeImg ? (
            <Image src={activeImg} alt={product.product_name} fill className="object-cover" priority />
          ) : (
            <ImagePlaceholder className="w-full h-full" />
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveImgIdx(idx)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border transition-colors ${
                  activeImgIdx === idx ? "border-gold" : "border-subtle hover:border-gold/40"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info + selectors */}
      <div className="flex flex-col gap-5">
        {/* Category + name */}
        <div>
          <Link
            href={`/catalogo?categoria=${product.category_slug}`}
            className="text-gold text-xs uppercase tracking-widest font-medium hover:underline"
          >
            {product.category_name}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-[#e8e8e8]">{product.product_name}</h1>
          {product.description && (
            <p className="text-muted text-sm mt-2">{product.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="text-3xl font-bold gold-text">
          {selectedVariant ? formatCOP(selectedVariant.price) : "—"}
        </div>

        {/* Size selector */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            {product.size_type_name}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const hasStock = product.variants.some(
                (v) => v.size_id === s.size_id && v.active && v.stock > 0
              );
              return (
                <button
                  key={s.size_id}
                  type="button"
                  onClick={() => { setSelectedSizeId(s.size_id); setSelectedColorId(""); setActiveImgIdx(0); }}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    selectedSizeId === s.size_id
                      ? "border-gold bg-gold/10 text-gold font-semibold"
                      : hasStock
                      ? "border-subtle text-[#e8e8e8] hover:border-gold/40"
                      : "border-subtle/50 text-muted/50 cursor-not-allowed"
                  }`}
                  disabled={!hasStock}
                >
                  {s.size_label}
                  {s.alt_label && <span className="text-xs opacity-60 ml-1">/ {s.alt_label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color selector */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
            Color{effectiveColorId && ` — ${colorsForSize.find((c) => c.color_id === effectiveColorId)?.color_name}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {colorsForSize.map((c) => {
              const variant = product.variants.find(
                (v) => v.size_id === selectedSizeId && v.color_id === c.color_id
              );
              const hasStock = (variant?.stock ?? 0) > 0 && variant?.active;
              const isSelected = effectiveColorId === c.color_id;

              return (
                <button
                  key={c.color_id}
                  type="button"
                  onClick={() => { setSelectedColorId(c.color_id); setActiveImgIdx(0); }}
                  title={c.color_name}
                  className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected ? "border-gold scale-110" : "border-subtle hover:border-gold/50 hover:scale-105"
                  } ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}`}
                  disabled={!hasStock}
                >
                  <span
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ background: c.hex_code }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Stock */}
        <p className={`text-sm font-medium ${stockColor}`}>
          ● {stockLabel}
          {!outOfStock && selectedVariant && ` (${selectedVariant.stock} uds.)`}
        </p>

        {/* Quantity + cart */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quantity */}
          <div className="flex items-center border border-subtle rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-muted hover:text-[#e8e8e8] hover:bg-white/5 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="px-4 py-2.5 text-[#e8e8e8] font-medium text-sm min-w-[40px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 99, q + 1))}
              className="px-3 py-2.5 text-muted hover:text-[#e8e8e8] hover:bg-white/5 transition-colors"
              disabled={outOfStock}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock || !selectedVariant}
            className="btn-gold flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={16} />
            {added ? "¡Agregado!" : outOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>

        {/* SKU */}
        {selectedVariant && (
          <p className="text-xs text-muted font-mono">Ref: {selectedVariant.sku}</p>
        )}

        {/* WhatsApp */}
        <a
          href={`https://wa.me/573177301489?text=${encodeURIComponent(
            `Hola, quiero pedir: ${product.product_name}${selectedVariant ? ` (Ref: ${selectedVariant.sku})` : ""} — ${selectedVariant ? formatCOP(selectedVariant.price) : ""}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-center text-sm"
        >
          Pedir por WhatsApp
        </a>
      </div>
    </div>
  );
}
