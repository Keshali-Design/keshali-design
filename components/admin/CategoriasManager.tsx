"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import {
  createCategory,
  toggleCategory,
  toggleCategoryColor,
  toggleCategorySize,
  setCategoryColors,
  setCategorySizes,
} from "@/app/admin/categorias/actions";
import type {
  Category,
  SizeTypeOption,
  ColorOption,
  SizeOption,
  CategoryColor,
  CategorySize,
} from "@/app/admin/categorias/page";

const FIELD = "bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

export function CategoriasManager({
  categories,
  sizeTypes,
  allColors,
  allSizes,
  categoryColors,
  categorySizes,
}: {
  categories: Category[];
  sizeTypes: SizeTypeOption[];
  allColors: ColorOption[];
  allSizes: SizeOption[];
  categoryColors: CategoryColor[];
  categorySizes: CategorySize[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", size_type_id: sizeTypes[0]?.id ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track pending color/size selections before saving
  const [pendingColors, setPendingColors] = useState<Record<string, Set<string>>>({});
  const [pendingSizes, setPendingSizes] = useState<Record<string, Set<string>>>({});
  const [savingConfig, setSavingConfig] = useState<string | null>(null);

  function getCategoryColorIds(catId: string): Set<string> {
    if (pendingColors[catId]) return pendingColors[catId];
    return new Set(categoryColors.filter((cc) => cc.category_id === catId).map((cc) => cc.color_id));
  }

  function getCategorySizeIds(catId: string): Set<string> {
    if (pendingSizes[catId]) return pendingSizes[catId];
    return new Set(categorySizes.filter((cs) => cs.category_id === catId).map((cs) => cs.size_id));
  }

  function isCategoryColorActive(catId: string, colorId: string): boolean {
    const cc = categoryColors.find((c) => c.category_id === catId && c.color_id === colorId);
    return cc?.active ?? false;
  }

  function isCategorySizeActive(catId: string, sizeId: string): boolean {
    const cs = categorySizes.find((s) => s.category_id === catId && s.size_id === sizeId);
    return cs?.active ?? false;
  }

  function toggleColorSelect(catId: string, colorId: string) {
    const current = getCategoryColorIds(catId);
    const next = new Set(current);
    if (next.has(colorId)) next.delete(colorId); else next.add(colorId);
    setPendingColors({ ...pendingColors, [catId]: next });
  }

  function toggleSizeSelect(catId: string, sizeId: string) {
    const current = getCategorySizeIds(catId);
    const next = new Set(current);
    if (next.has(sizeId)) next.delete(sizeId); else next.add(sizeId);
    setPendingSizes({ ...pendingSizes, [catId]: next });
  }

  async function saveConfig(catId: string) {
    setSavingConfig(catId);
    const colors = pendingColors[catId];
    const sizes = pendingSizes[catId];
    if (colors) await setCategoryColors(catId, Array.from(colors));
    if (sizes) await setCategorySizes(catId, Array.from(sizes));
    setSavingConfig(null);
    // Clear pending
    const pc = { ...pendingColors }; delete pc[catId]; setPendingColors(pc);
    const ps = { ...pendingSizes }; delete ps[catId]; setPendingSizes(ps);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await createCategory(newForm);
    if (res.error) { setError(res.error); setSaving(false); return; }
    setNewForm({ name: "", size_type_id: sizeTypes[0]?.id ?? "" });
    setShowNew(false);
    setSaving(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#e8e8e8]">Categorías</h1>
        <button onClick={() => setShowNew((v) => !v)} className="btn-gold flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={15} />
          Nueva categoría
        </button>
      </div>
      <p className="text-muted text-sm mb-8">
        Gestiona categorías, colores y tamaños disponibles para cada una.
      </p>

      {/* New category form */}
      {showNew && (
        <form onSubmit={handleCreate} className="glass rounded-card p-5 mb-6 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold text-sm">Nueva categoría</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nombre *</label>
              <input
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                required
                placeholder="Tazas"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Tipo de tamaño *</label>
              <select
                value={newForm.size_type_id}
                onChange={(e) => setNewForm({ ...newForm, size_type_id: e.target.value })}
                required
                className={FIELD}
              >
                <option value="" className="bg-[#0f0f10]">Seleccionar…</option>
                {sizeTypes.map((st) => (
                  <option key={st.id} value={st.id} className="bg-[#0f0f10]">
                    {st.name} ({st.unit_label})
                  </option>
                ))}
              </select>
              <p className="text-muted text-xs mt-1">⚠ No se puede cambiar después de crear.</p>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-gold text-sm py-2 px-4 disabled:opacity-60">
              {saving ? "Guardando..." : "Crear categoría"}
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="btn-ghost text-sm py-2 px-4">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Categories list */}
      <div className="flex flex-col gap-3">
        {categories.length === 0 && (
          <p className="text-muted text-sm text-center py-10">Sin categorías. Crea una para empezar.</p>
        )}

        {categories.map((cat) => {
          const isExpanded = expanded === cat.id;
          const sizesForCat = allSizes.filter((s) => s.size_type_id === cat.size_type_id);
          const selectedColors = getCategoryColorIds(cat.id);
          const selectedSizes = getCategorySizeIds(cat.id);
          const hasPending = pendingColors[cat.id] || pendingSizes[cat.id];

          return (
            <div key={cat.id} className="glass rounded-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : cat.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {isExpanded ? <ChevronDown size={15} className="text-muted" /> : <ChevronRight size={15} className="text-muted" />}
                  <span className="text-[#e8e8e8] font-semibold text-sm">{cat.name}</span>
                  {cat.size_types && (
                    <span className="text-muted text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">
                      {cat.size_types.name}
                    </span>
                  )}
                  <span className="text-muted text-xs">{selectedColors.size} color{selectedColors.size !== 1 ? "es" : ""} · {selectedSizes.size} tamaño{selectedSizes.size !== 1 ? "s" : ""}</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id, !cat.active)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    cat.active
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                      : "border-muted/20 text-muted bg-white/5 hover:border-gold/30 hover:text-gold"
                  }`}
                >
                  {cat.active ? "Activa" : "Inactiva"}
                </button>
              </div>

              {/* Config panel */}
              {isExpanded && (
                <div className="p-5 flex flex-col gap-6">

                  {/* Colors section */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                      Colores disponibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color) => {
                        const isSelected = selectedColors.has(color.id);
                        const isActive = isCategoryColorActive(cat.id, color.id);
                        const inPending = !!pendingColors[cat.id];

                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                // Add color (toggle selection for saving later)
                                toggleColorSelect(cat.id, color.id);
                              } else if (inPending) {
                                toggleColorSelect(cat.id, color.id);
                              } else {
                                // Already saved — toggle active directly
                                const cc = categoryColors.find((c) => c.category_id === cat.id && c.color_id === color.id);
                                if (cc) toggleCategoryColor(cc.id, !isActive);
                                else toggleColorSelect(cat.id, color.id);
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                              isSelected
                                ? isActive || inPending
                                  ? "border-gold/50 bg-gold/10 text-gold"
                                  : "border-muted/30 bg-white/5 text-muted line-through"
                                : "border-subtle text-muted hover:border-gold/30 hover:text-[#e8e8e8]"
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                              style={{ background: color.hex_code }}
                            />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes section */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                      Tamaños disponibles
                      {cat.size_types && <span className="font-normal normal-case ml-1">({cat.size_types.name})</span>}
                    </p>
                    {sizesForCat.length === 0 ? (
                      <p className="text-muted text-xs">No hay tamaños creados para este tipo. Agrégalos en la sección Tamaños.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {sizesForCat.map((size) => {
                          const isSelected = selectedSizes.has(size.id);
                          const isActive = isCategorySizeActive(cat.id, size.id);
                          const inPending = !!pendingSizes[cat.id];

                          return (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => {
                                if (!isSelected) {
                                  toggleSizeSelect(cat.id, size.id);
                                } else if (inPending) {
                                  toggleSizeSelect(cat.id, size.id);
                                } else {
                                  const cs = categorySizes.find((s) => s.category_id === cat.id && s.size_id === size.id);
                                  if (cs) toggleCategorySize(cs.id, !isActive);
                                  else toggleSizeSelect(cat.id, size.id);
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                                isSelected
                                  ? isActive || inPending
                                    ? "border-gold/50 bg-gold/10 text-gold"
                                    : "border-muted/30 bg-white/5 text-muted line-through"
                                  : "border-subtle text-muted hover:border-gold/30 hover:text-[#e8e8e8]"
                              }`}
                            >
                              {size.label}
                              {size.alt_label && <span className="opacity-60">/ {size.alt_label}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Save button — only shown when there are pending changes */}
                  {hasPending && (
                    <button
                      type="button"
                      onClick={() => saveConfig(cat.id)}
                      disabled={savingConfig === cat.id}
                      className="btn-gold text-sm py-2 px-5 self-start disabled:opacity-60"
                    >
                      {savingConfig === cat.id ? "Guardando..." : "Guardar cambios"}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
