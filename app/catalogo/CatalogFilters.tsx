"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { formatCOP } from "@/lib/utils";
import { catalogUrl, type CatalogParams } from "./catalogUrl";

export function PriceFilter({
  priceRange,
  current,
}: {
  priceRange: { min: number; max: number };
  current: CatalogParams;
}) {
  const router = useRouter();
  const inputId = useId();
  const currentMax = current.precioMax ? Number(current.precioMax) : priceRange.max;
  const [maxPrice, setMaxPrice] = useState(currentMax);

  function commit(value: number) {
    router.push(catalogUrl(current, { precioMax: value >= priceRange.max ? null : String(value) }));
  }

  return (
    <div>
      <label htmlFor={inputId} className="label-sm mb-2.5 block">Precio máximo</label>
      <input
        id={inputId}
        type="range"
        min={priceRange.min}
        max={priceRange.max}
        step={1000}
        value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value))}
        onMouseUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        className="w-full accent-gold"
      />
      <p className="text-body text-xs mt-1">Hasta {formatCOP(maxPrice)}</p>
    </div>
  );
}
