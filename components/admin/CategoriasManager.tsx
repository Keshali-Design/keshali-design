"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import {
  createCategory,
  createSubcategory,
  toggleCategory,
  toggleSubcategory,
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
  mainCategories,
  subcategories,
  sizeTypes,
  allColors,
  allSizes,
  categoryColors,
  categorySizes,
}: {
  mainCategories: Category[];
  subcategories: Category[];
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
  const [formError, setFormError] = useState<string | null>(null);

  // Subcategory add state per main category
  const [showNewSub, setShowNewSub] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [savingSub, setSavingSub] = useState(false);

  // Pending color/size selections before saving
  const [pendingColors, setPendingColors] = useState<Record<string, Set<string>>>({});
  const [pendingSizes, setPendingSizes] = useState<Record<string, Set<string>>>({});
  const [savingConfig, setSavingConfig] = useState<string | null>(null);

  function getColorIds(catId: string): Set<string> {
    if (pendingColors[catId]) return pendingColors[catId];
    return new Set(categoryColors.filter((cc) => cc.category_id === catId).map((cc) => cc.color_id));
  }

  function getSizeIds(catId: string): Set<string> {
    if (pendingSizes[catId]) return pendingSizes[catId];
    return new Set(categorySizes.filter((cs) => cs.category_id === catId).map((cs) => cs.size_id));
  }

  function isCCActive(catId: string, colorId: string) {
    return categoryColors.find((c) => c.category_id === catId && c.color_id === colorId)?.active ?? false;
  }

  function isCSActive(catId: string, sizeId: string) {
    return categorySizes.find((s) => s.category_id === catId && s.size_id === sizeId)?.active ?? false;
  }

  function toggleColorSel(catId: string, colorId: string) {
    const next = new Set(getColorIds(catId));
    if (next.has(colorId)) next.delete(colorId); else next.add(colorId);
    setPendingColors({ ...pendingColors, [catId]: next });
  }

  function toggleSizeSel(catId: string, sizeId: string) {
    const next = new Set(getSizeIds(catId));
    if (next.has(sizeId)) next.delete(sizeId); else next.add(sizeId);
    setPendingSizes({ ...pendingSizes, [catId]: next });
  }

  async function saveConfig(catId: string) {
    setSavingConfig(catId);
    if (pendingColors[catId]) await setCategoryColors(catId, Array.from(pendingColors[catId]));
    if (pendingSizes[catId]) await setCategorySizes(catId, Array.from(pendingSizes[catId]));
    setSavingConfig(null);
    const pc = { ...pendingColors }; delete pc[catId]; setPendingColors(pc);
    const ps = { ...pendingSizes }; delete ps[catId]; setPendingSizes(ps);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const res = await createCategory(newForm);
    if (res.error) { setFormError(res.error); setSaving(false); return; }
    setNewForm({ name: "", size_type_id: sizeTypes[0]?.id ?? "" });
    setShowNew(false);
    setSaving(false);
  }

  async function handleCreateSub(parentId: string, e: React.FormEvent) {
    e.preventDefault();
    setSavingSub(true);
    const res = await createSubcategory({ name: newSubName.trim(), parent_id: parentId });
    if (!res.error) { setNewSubName(""); setShowNewSub(null); }
    setSavingSub(false);
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
        Las categorías principales definen el tipo de producto, el sistema de tamaños y el inventario compartido.
        Las subcategorías agrupan productos dentro de una categoría principal.
      </p>

      {/* New main category form */}
      {showNew && (
        <form onSubmit={handleCreate} className="glass rounded-card p-5 mb-6 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold text-sm">Nueva categoría principal</h2>
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
          {formError && <p className="text-red-400 text-sm">{formError}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-gold text-sm py-2 px-4 disabled:opacity-60">
              {saving ? "Guardando..." : "Crear categoría"}
            </button>
            <button type="button" onClick={() => setShowNew(false)} className="btn-ghost text-sm py-2 px-4">Cancelar</button>
          </div>
        </form>
      )}

      {/* Main categories with subcategories nested */}
      <div className="flex flex-col gap-4">
        {mainCategories.length === 0 && (
          <p className="text-muted text-sm text-center py-10">Sin categorías. Crea una para empezar.</p>
        )}

        {mainCategories.map((cat) => {
          const isExpanded = expanded === cat.id;
          const sizesForCat = allSizes.filter((s) => s.size_type_id === cat.size_type_id);
          const selectedColors = getColorIds(cat.id);
          const selectedSizes = getSizeIds(cat.id);
          const hasPending = pendingColors[cat.id] || pendingSizes[cat.id];
          const catSubs = subcategories.filter((s) => s.parent_id === cat.id);

          return (
            <div key={cat.id} className="glass rounded-card overflow-hidden">
              {/* Main category header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : cat.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {isExpanded
                    ? <ChevronDown size={15} className="text-muted flex-shrink-0" />
                    : <ChevronRight size={15} className="text-muted flex-shrink-0" />
                  }
                  <span className="text-[#e8e8e8] font-bold text-sm">{cat.name}</span>
                  {cat.size_types && (
                    <span className="text-muted text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">
                      {cat.size_types.name}
                    </span>
                  )}
                  <span className="text-muted text-xs">
                    {selectedColors.size} color{selectedColors.size !== 1 ? "es" : ""}
                    {" · "}
                    {selectedSizes.size} tamaño{selectedSizes.size !== 1 ? "s" : ""}
                    {" · "}
                    {catSubs.length} sub{catSubs.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id, !cat.active)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex-shrink-0 ${
                    cat.active
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                      : "border-muted/20 text-muted bg-white/5 hover:border-gold/30 hover:text-gold"
                  }`}
                >
                  {cat.active ? "Activa" : "Inactiva"}
                </button>
              </div>

              {/* Expanded config */}
              {isExpanded && (
                <div className="p-5 flex flex-col gap-6">

                  {/* Colors */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Colores disponibles</p>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color) => {
                        const isSel = selectedColors.has(color.id);
                        const isAct = isCCActive(cat.id, color.id);
                        const inPend = !!pendingColors[cat.id];
                        return (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => {
                              if (!isSel || inPend) {
                                toggleColorSel(cat.id, color.id);
                              } else {
                                const cc = categoryColors.find((c) => c.category_id === cat.id && c.color_id === color.id);
                                if (cc) toggleCategoryColor(cc.id, !isAct);
                                else toggleColorSel(cat.id, color.id);
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                              isSel
                                ? isAct || inPend
                                  ? "border-gold/50 bg-gold/10 text-gold"
                                  : "border-muted/30 bg-white/5 text-muted line-through"
                                : "border-subtle text-muted hover:border-gold/30 hover:text-[#e8e8e8]"
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: color.hex_code }} />
                            {color.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                      Tamaños disponibles
                      {cat.size_types && <span className="font-normal normal-case ml-1">({cat.size_types.name})</span>}
                    </p>
                    {sizesForCat.length === 0 ? (
                      <p className="text-muted text-xs">No hay tamaños para este tipo. Agrégalos en la sección Tamaños.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {sizesForCat.map((size) => {
                          const isSel = selectedSizes.has(size.id);
                          const isAct = isCSActive(cat.id, size.id);
                          const inPend = !!pendingSizes[cat.id];
                          return (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => {
                                if (!isSel || inPend) {
                                  toggleSizeSel(cat.id, size.id);
                                } else {
                                  const cs = categorySizes.find((s) => s.category_id === cat.id && s.size_id === size.id);
                                  if (cs) toggleCategorySize(cs.id, !isAct);
                                  else toggleSizeSel(cat.id, size.id);
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${
                                isSel
                                  ? isAct || inPend
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

                  {/* Subcategories */}
                  <div className="border-t border-subtle pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wide flex items-center gap-1.5">
                        <FolderOpen size={13} />
                        Subcategorías
                      </p>
                      <button
                        type="button"
                        onClick={() => { setShowNewSub(cat.id); setNewSubName(""); }}
                        className="btn-ghost text-xs flex items-center gap-1 py-1 px-2"
                      >
                        <Plus size={12} />
                        Agregar
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {catSubs.length === 0 && !showNewSub && (
                        <p className="text-muted text-xs">Sin subcategorías aún.</p>
                      )}

                      {catSubs.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-subtle">
                          <span className="text-[#e8e8e8] text-sm flex-1">{sub.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleSubcategory(sub.id, !sub.active)}
                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                              sub.active
                                ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10"
                                : "border-muted/20 text-muted bg-white/5"
                            }`}
                          >
                            {sub.active ? "Activa" : "Inactiva"}
                          </button>
                        </div>
                      ))}

                      {showNewSub === cat.id && (
                        <form onSubmit={(e) => handleCreateSub(cat.id, e)} className="flex items-center gap-2 mt-1">
                          <input
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            required
                            placeholder="Nombre de la subcategoría…"
                            className="flex-1 bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={savingSub}
                            className="btn-gold text-xs py-2 px-3 disabled:opacity-60"
                          >
                            {savingSub ? "..." : "Crear"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewSub(null)}
                            className="text-muted hover:text-[#e8e8e8] text-xs px-2 py-2 transition-colors"
                          >
                            Cancelar
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
