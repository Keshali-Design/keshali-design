"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { updateVariantStock, toggleVariantActive } from "@/app/admin/stock/actions";
import { formatCOP } from "@/lib/utils";

type Variant = {
  id: string;
  sku: string;
  stock: number;
  active: boolean;
  price_override: number | null;
  products: {
    id: string;
    name: string;
    price_varies_by_color: boolean;
    categories: { name: string } | null;
    product_sizes: { size_id: string; price: number }[];
  } | null;
  colors: { id: string; name: string; hex_code: string } | null;
  sizes: { id: string; label: string; alt_label: string | null } | null;
};

function getPrice(v: Variant) {
  if (v.price_override != null) return v.price_override;
  const ps = v.products?.product_sizes?.find((ps) => ps.size_id === v.sizes?.id);
  return ps?.price ?? 0;
}

export function StockManager({
  variants,
  categories,
  initialCategoria,
  initialBuscar,
}: {
  variants: Variant[];
  categories: { id: string; name: string }[];
  initialCategoria: string;
  initialBuscar: string;
}) {
  const [categoria, setCategoria] = useState(initialCategoria);
  const [buscar, setBuscar] = useState(initialBuscar);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [isPending, startTransition] = useTransition();

  const filtered = variants.filter((v) => {
    const matchCat = !categoria || v.products?.categories?.name === categories.find((c) => c.id === categoria)?.name;
    const q = buscar.toLowerCase();
    const matchSearch =
      !q ||
      v.sku.toLowerCase().includes(q) ||
      v.products?.name.toLowerCase().includes(q) ||
      v.colors?.name.toLowerCase().includes(q) ||
      v.sizes?.label.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function startEdit(v: Variant) {
    setEditingId(v.id);
    setEditStock(v.stock);
  }

  function saveStock(v: Variant) {
    startTransition(async () => {
      await updateVariantStock(v.id, editStock);
      setEditingId(null);
    });
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Stock</h1>
      <p className="text-muted text-sm mb-6">
        Gestiona el inventario por variante. Los cambios afectan la disponibilidad en la tienda inmediatamente.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50"
        >
          <option value="" className="bg-[#0f0f10]">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0f0f10]">{c.name}</option>
          ))}
        </select>
        <input
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          placeholder="Buscar por SKU, producto, color…"
          className="bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 flex-1 min-w-[200px]"
        />
        <span className="text-muted text-sm self-center">
          {filtered.length} variante{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="glass rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle text-muted text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">SKU</th>
              <th className="text-left px-4 py-3">Color</th>
              <th className="text-left px-4 py-3">Tamaño</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-center px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-subtle last:border-0 hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3">
                  <p className="text-[#e8e8e8] font-medium text-xs line-clamp-1">{v.products?.name}</p>
                  <p className="text-muted text-[10px]">{v.products?.categories?.name}</p>
                </td>
                <td className="px-4 py-3 text-muted font-mono text-xs hidden md:table-cell">{v.sku}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {v.colors && (
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                        style={{ background: v.colors.hex_code }}
                      />
                    )}
                    <span className="text-[#e8e8e8] text-xs">{v.colors?.name ?? "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#e8e8e8] text-xs">
                  {v.sizes?.label ?? "—"}
                  {v.sizes?.alt_label && <span className="text-muted ml-1">/ {v.sizes.alt_label}</span>}
                </td>
                <td className="px-4 py-3 text-right text-gold text-xs font-semibold">
                  {formatCOP(getPrice(v))}
                </td>
                <td className="px-4 py-3 text-center">
                  {editingId === v.id ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        className="bg-white/5 border border-gold/50 rounded px-2 py-1 text-xs text-[#e8e8e8] w-16 text-center focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveStock(v);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => saveStock(v)}
                        disabled={isPending}
                        className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-muted hover:text-[#e8e8e8] transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(v)}
                      className={`text-xs font-semibold px-3 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                        v.stock === 0 ? "text-red-400" : v.stock <= 5 ? "text-yellow-400" : "text-emerald-400"
                      }`}
                    >
                      {v.stock}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => startTransition(() => toggleVariantActive(v.id, !v.active))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      v.active
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                        : "border-muted/20 text-muted bg-white/5 hover:border-gold/30 hover:text-gold"
                    }`}
                  >
                    {v.active ? "Activa" : "Inactiva"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-10">
            {variants.length === 0 ? "Sin variantes. Crea productos primero." : "Sin resultados para este filtro."}
          </p>
        )}
      </div>
    </div>
  );
}
