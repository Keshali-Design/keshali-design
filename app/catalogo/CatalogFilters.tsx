"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { formatCOP } from "@/lib/utils";
import { catalogUrl, type CatalogParams } from "./catalogUrl";

const STEP = 1000;

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

  // The step grid starts at `min`, so the slider's top position can land just
  // below `max` (e.g. 118.990 of 119.900): anything within a step of it = no limit.
  const isNoLimit = (value: number) => value + STEP > priceRange.max;

  function commit(value: number) {
    const next = isNoLimit(value) ? null : String(value);
    // Key-up also fires for Tab/focus moves — only navigate on a real change.
    if (next === (current.precioMax ?? null)) return;
    router.push(catalogUrl(current, { precioMax: next }));
  }

  return (
    <div>
      <label htmlFor={inputId} className="label-sm mb-2.5 block">Precio máximo</label>
      <input
        id={inputId}
        type="range"
        min={priceRange.min}
        max={priceRange.max}
        step={STEP}
        value={maxPrice}
        onChange={(e) => setMaxPrice(Number(e.target.value))}
        onMouseUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => commit(Number((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => commit(Number((e.target as HTMLInputElement).value))}
        className="w-full accent-gold"
      />
      <p className="text-body text-xs mt-1">
        Hasta {formatCOP(isNoLimit(maxPrice) ? priceRange.max : maxPrice)}
      </p>
    </div>
  );
}
