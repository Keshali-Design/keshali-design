"use client";

import { useRouter } from "next/navigation";
import type { Subcategory } from "@/lib/supabase/queries";

export function SubcategorySelect({
  subcategories,
  current,
  categoria,
}: {
  subcategories: Subcategory[];
  current: string | undefined;
  categoria: string | undefined;
}) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) {
      router.push(categoria ? `/catalogo?categoria=${categoria}` : "/catalogo");
    } else {
      router.push(
        categoria
          ? `/catalogo?categoria=${categoria}&subcategoria=${val}`
          : `/catalogo?subcategoria=${val}`
      );
    }
  }

  return (
    <select
      value={current ?? ""}
      onChange={handleChange}
      className="bg-white border border-subtle px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-gold transition-colors"
    >
      <option value="" className="bg-white">Todas las subcategorías</option>
      {subcategories.map((s) => (
        <option key={s.id} value={s.slug} className="bg-white">
          {s.name}
        </option>
      ))}
    </select>
  );
}
