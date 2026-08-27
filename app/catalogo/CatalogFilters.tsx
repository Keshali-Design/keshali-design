"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCOP } from "@/lib/utils";

export function CatalogFilters({
  techniques,
  currentTechnique,
  priceRange,
  currentMaxPrice,
  categoria,
  subcategoria,
}: {
  techniques: string[];
  currentTechnique: string | undefined;
  priceRange: { min: number; max: number };
  currentMaxPrice: number | undefined;
  categoria: string | undefined;
  subcategoria: string | undefined;
}) {
  const router = useRouter();
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ?? priceRange.max);

  function buildUrl(overrides: { tecnica?: string | null; precioMax?: number | null }) {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (subcategoria) params.set("subcategoria", subcategoria);

    const tecnica = overrides.tecnica !== undefined ? overrides.tecnica : currentTechnique;
    if (tecnica) params.set("tecnica", tecnica);

    const precioMax = overrides.precioMax !== undefined ? overrides.precioMax : currentMaxPrice;
    if (precioMax != null && precioMax < priceRange.max) params.set("precioMax", String(precioMax));

    const qs = params.toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  }

  function toggleTechnique(t: string) {
    router.push(buildUrl({ tecnica: currentTechnique === t ? null : t }));
  }

  function handlePriceCommit(value: number) {
    router.push(buildUrl({ precioMax: value >= priceRange.max ? null : value }));
  }

  const hasFilters = !!currentTechnique || (currentMaxPrice != null && currentMaxPrice < priceRange.max);

  return (
    <aside className="w-full lg:max-w-[220px] flex flex-col gap-6">
      <div>
        <p className="label-sm mb-2.5">Técnica</p>
        <div className="flex flex-col gap-1">
          {techniques.map((t) => {
            const active = currentTechnique === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTechnique(t)}
                className={`text-left px-2.5 py-2 text-xs font-semibold transition-colors ${
                  active ? "bg-gold-100 text-gold-700" : "text-body hover:bg-subtle2"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {priceRange.max > priceRange.min && (
        <div>
          <p className="label-sm mb-2.5">Precio máximo</p>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={1000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            onMouseUp={(e) => handlePriceCommit(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handlePriceCommit(Number((e.target as HTMLInputElement).value))}
            className="w-full accent-gold"
          />
          <p className="text-body text-xs mt-1">Hasta {formatCOP(maxPrice)}</p>
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(buildUrl({ tecnica: null, precioMax: null }))}
          className="border border-subtle bg-white text-body text-xs font-semibold px-3.5 py-2.5 hover:border-gold transition-colors w-full"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}
