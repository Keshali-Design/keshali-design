"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { upsertInventory } from "@/app/admin/stock/actions";
import { formatCOP } from "@/lib/utils";
import type { CategoryOpt, SizeOpt, ColorOpt } from "@/app/admin/stock/page";

type InventoryEntry = {
  id: string;
  category_id: string;
  size_id: string;
  color_id: string;
  stock: number;
};

// A "slot" is every valid combination of category+size+color based on category_sizes + category_colors
type Slot = {
  key: string;
  category_id: string;
  categoryName: string;
  size_id: string;
  sizeLabel: string;
  sizeAlt: string | null;
  color_id: string;
  colorName: string;
  hexCode: string;
  stock: number;
};

export function StockManager({
  categories,
  allSizes,
  allColors,
  categorySizes,
  categoryColors,
  inventory,
  initialCategoria,
  initialBuscar,
}: {
  categories: CategoryOpt[];
  allSizes: SizeOpt[];
  allColors: ColorOpt[];
  categorySizes: { category_id: string; size_id: string }[];
  categoryColors: { category_id: string; color_id: string }[];
  inventory: InventoryEntry[];
  initialCategoria: string;
  initialBuscar: string;
}) {
  const [categoria, setCategoria] = useState(initialCategoria);
  const [buscar, setBuscar] = useState(initialBuscar);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Build inventory map for quick lookup
  const invMap = new Map(
    inventory.map((i) => [`${i.category_id}__${i.size_id}__${i.color_id}`, i.stock])
  );

  // Build all slots from category_sizes × category_colors
  const slots: Slot[] = [];
  for (const cat of categories) {
    const sizesForCat = categorySizes
      .filter((cs) => cs.category_id === cat.id)
      .map((cs) => allSizes.find((s) => s.id === cs.size_id))
      .filter(Boolean) as SizeOpt[];

    const colorsForCat = categoryColors
      .filter((cc) => cc.category_id === cat.id)
      .map((cc) => allColors.find((c) => c.id === cc.color_id))
      .filter(Boolean) as ColorOpt[];

    for (const size of sizesForCat) {
      for (const color of colorsForCat) {
        const key = `${cat.id}__${size.id}__${color.id}`;
        slots.push({
          key,
          category_id: cat.id,
          categoryName: cat.name,
          size_id: size.id,
          sizeLabel: size.label,
          sizeAlt: size.alt_label,
          color_id: color.id,
          colorName: color.name,
          hexCode: color.hex_code,
          stock: invMap.get(key) ?? 0,
        });
      }
    }
  }

  const filtered = slots.filter((s) => {
    const matchCat = !categoria || s.category_id === categoria;
    const q = buscar.toLowerCase();
    const matchSearch =
      !q ||
      s.categoryName.toLowerCase().includes(q) ||
      s.sizeLabel.toLowerCase().includes(q) ||
      s.colorName.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function startEdit(slot: Slot) {
    setEditingKey(slot.key);
    setEditStock(slot.stock);
  }

  function saveStock(slot: Slot) {
    startTransition(async () => {
      await upsertInventory(slot.category_id, slot.size_id, slot.color_id, editStock);
      setEditingKey(null);
    });
  }

  const totalSlots = slots.length;
  const withStock = slots.filter((s) => s.stock > 0).length;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-ink mb-1">Stock</h1>
      <p className="text-body text-sm mb-1">
        El stock se comparte por <span className="text-ink">subcategoría + tamaño + color</span> (o por
        categoría cuando no tiene subcategorías). Ej: el stock de Buzo es independiente del de Camisetas,
        aunque ambas sean de la categoría Hombre.
      </p>
      <div className="flex gap-4 text-xs text-muted mb-6 mt-3">
        <span>{totalSlots} combinaciones totales</span>
        <span className="text-emerald-700 font-semibold">{withStock} con stock</span>
        <span className="text-red-600 font-semibold">{totalSlots - withStock} sin stock</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="bg-white border border-subtle px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar por categoría, tamaño o color…"
          className="bg-white border border-subtle px-3 py-2 text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold flex-1 min-w-[200px]"
        />
        <span className="text-muted text-sm self-center">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {slots.length === 0 ? (
        <div className="bg-surface border border-subtle p-10 text-center text-muted text-sm">
          Sin combinaciones disponibles. Configura colores y tamaños en las categorías primero.
        </div>
      ) : (
        <div className="bg-surface border border-subtle overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-subtle text-muted label-sm">
                <th className="text-left px-4 py-3">Categoría</th>
                <th className="text-left px-4 py-3">Tamaño</th>
                <th className="text-left px-4 py-3">Color</th>
                <th className="text-center px-4 py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((slot) => (
                <tr key={slot.key} className="border-b border-subtle2 last:border-0 hover:bg-subtle2 transition-colors">
                  <td className="px-4 py-3 text-ink text-xs font-medium">{slot.categoryName}</td>
                  <td className="px-4 py-3 text-xs text-ink">
                    {slot.sizeLabel}
                    {slot.sizeAlt && <span className="text-muted ml-1">/ {slot.sizeAlt}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 border border-subtle flex-shrink-0"
                        style={{ background: slot.hexCode }}
                      />
                      <span className="text-ink text-xs">{slot.colorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingKey === slot.key ? (
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="bg-white border border-gold px-2 py-1 text-xs text-ink w-20 text-center focus:outline-none focus:ring-1 focus:ring-gold"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveStock(slot);
                            if (e.key === "Escape") setEditingKey(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => saveStock(slot)}
                          disabled={isPending}
                          className="p-1 text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          className="p-1 text-muted hover:text-ink transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(slot)}
                        className={`text-sm font-bold px-4 py-1 hover:bg-subtle2 transition-colors tabular-nums ${
                          slot.stock === 0
                            ? "text-red-600"
                            : slot.stock <= 5
                            ? "text-gold-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {slot.stock}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
