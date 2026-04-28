"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, Pencil, Check, X } from "lucide-react";
import {
  createSizeType,
  toggleSizeType,
  createSize,
  updateSize,
  toggleSize,
} from "@/app/admin/tamanos/actions";
import type { SizeType, Size } from "@/app/admin/tamanos/page";

const FIELD = "bg-white/5 border border-subtle rounded-lg px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

export function TamañosManager({
  sizeTypes,
  sizes,
}: {
  sizeTypes: SizeType[];
  sizes: Size[];
}) {
  const [expanded, setExpanded] = useState<string | null>(sizeTypes[0]?.id ?? null);
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeForm, setNewTypeForm] = useState({ name: "", unit_label: "" });
  const [savingType, setSavingType] = useState(false);

  // New size form per type
  const [showNewSize, setShowNewSize] = useState<string | null>(null);
  const [newSizeForm, setNewSizeForm] = useState({ label: "", alt_value: "", alt_label: "", sort_order: "0" });
  const [savingSize, setSavingSize] = useState(false);

  // Inline edit
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", alt_value: "", alt_label: "", sort_order: "0" });

  async function handleCreateType(e: React.FormEvent) {
    e.preventDefault();
    setSavingType(true);
    const res = await createSizeType(newTypeForm);
    if (!res.error) {
      setNewTypeForm({ name: "", unit_label: "" });
      setShowNewType(false);
    }
    setSavingType(false);
  }

  async function handleCreateSize(typeId: string, e: React.FormEvent) {
    e.preventDefault();
    setSavingSize(true);
    const res = await createSize({
      size_type_id: typeId,
      label: newSizeForm.label,
      alt_value: newSizeForm.alt_value || undefined,
      alt_label: newSizeForm.alt_label || undefined,
      sort_order: parseInt(newSizeForm.sort_order) || 0,
    });
    if (!res.error) {
      setNewSizeForm({ label: "", alt_value: "", alt_label: "", sort_order: "0" });
      setShowNewSize(null);
    }
    setSavingSize(false);
  }

  function startEdit(s: Size) {
    setEditingSize(s.id);
    setEditForm({
      label: s.label,
      alt_value: s.alt_value ?? "",
      alt_label: s.alt_label ?? "",
      sort_order: String(s.sort_order),
    });
  }

  async function handleUpdateSize(id: string) {
    await updateSize(id, {
      label: editForm.label,
      alt_value: editForm.alt_value || undefined,
      alt_label: editForm.alt_label || undefined,
      sort_order: parseInt(editForm.sort_order) || 0,
    });
    setEditingSize(null);
  }

  const sizesFor = (typeId: string) => sizes.filter((s) => s.size_type_id === typeId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#e8e8e8]">Tipos de tamaño</h1>
        <button
          onClick={() => setShowNewType((v) => !v)}
          className="btn-gold flex items-center gap-2 text-sm py-2 px-4"
        >
          <Plus size={15} />
          Nuevo tipo
        </button>
      </div>
      <p className="text-muted text-sm mb-8">
        Define los sistemas de medida (Onzas, Tallas, ML…) y sus valores disponibles.
      </p>

      {/* New type form */}
      {showNewType && (
        <form onSubmit={handleCreateType} className="glass rounded-card p-5 mb-6 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold text-sm">Nuevo tipo de tamaño</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nombre *</label>
              <input
                value={newTypeForm.name}
                onChange={(e) => setNewTypeForm({ ...newTypeForm, name: e.target.value })}
                required
                placeholder="Onzas"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Etiqueta de unidad *</label>
              <input
                value={newTypeForm.unit_label}
                onChange={(e) => setNewTypeForm({ ...newTypeForm, unit_label: e.target.value })}
                required
                placeholder="oz"
                className={FIELD}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={savingType} className="btn-gold text-sm py-2 px-4 disabled:opacity-60">
              {savingType ? "Guardando..." : "Crear tipo"}
            </button>
            <button type="button" onClick={() => setShowNewType(false)} className="btn-ghost text-sm py-2 px-4">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Size types list */}
      <div className="flex flex-col gap-3">
        {sizeTypes.length === 0 && (
          <p className="text-muted text-sm text-center py-10">Sin tipos de tamaño. Crea uno para empezar.</p>
        )}

        {sizeTypes.map((type) => {
          const typeSizes = sizesFor(type.id);
          const isExpanded = expanded === type.id;

          return (
            <div key={type.id} className="glass rounded-card overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : type.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown size={15} className="text-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight size={15} className="text-muted flex-shrink-0" />
                  )}
                  <span className="text-[#e8e8e8] font-semibold text-sm">{type.name}</span>
                  <span className="text-muted text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">
                    {type.unit_label}
                  </span>
                  <span className="text-muted text-xs ml-1">
                    {typeSizes.length} {typeSizes.length === 1 ? "valor" : "valores"}
                  </span>
                </button>

                {/* Active toggle */}
                <button
                  type="button"
                  onClick={() => toggleSizeType(type.id, !type.active)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${type.active
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                      : "border-muted/20 text-muted bg-white/5 hover:border-gold/30 hover:text-gold"
                    }`}
                >
                  {type.active ? "Activo" : "Inactivo"}
                </button>
              </div>

              {/* Sizes list */}
              {isExpanded && (
                <div className="p-4 flex flex-col gap-2">
                  {typeSizes.length === 0 && (
                    <p className="text-muted text-xs text-center py-2">Sin valores aún.</p>
                  )}

                  {typeSizes.map((s) =>
                    editingSize === s.id ? (
                      /* Inline edit row */
                      <div key={s.id} className="flex flex-wrap gap-2 items-end bg-white/5 rounded-lg p-3">
                        <div className="flex-1 min-w-[120px]">
                          <label className={LABEL}>Etiqueta</label>
                          <input
                            value={editForm.label}
                            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                            className={FIELD}
                          />
                        </div>
                        <div className="w-24">
                          <label className={LABEL}>Valor alt.</label>
                          <input
                            value={editForm.alt_value}
                            onChange={(e) => setEditForm({ ...editForm, alt_value: e.target.value })}
                            placeholder="325"
                            className={FIELD}
                          />
                        </div>
                        <div className="w-28">
                          <label className={LABEL}>Etiq. alt.</label>
                          <input
                            value={editForm.alt_label}
                            onChange={(e) => setEditForm({ ...editForm, alt_label: e.target.value })}
                            placeholder="325 ml"
                            className={FIELD}
                          />
                        </div>
                        <div className="w-20">
                          <label className={LABEL}>Orden</label>
                          <input
                            type="number"
                            value={editForm.sort_order}
                            onChange={(e) => setEditForm({ ...editForm, sort_order: e.target.value })}
                            className={FIELD}
                          />
                        </div>
                        <div className="flex gap-1 pb-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateSize(s.id)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSize(null)}
                            className="p-2 text-muted hover:text-[#e8e8e8] transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal row */
                      <div
                        key={s.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                      >
                        <span className={`text-sm font-medium ${s.active ? "text-[#e8e8e8]" : "text-muted line-through"}`}>
                          {s.label}
                        </span>
                        {s.alt_label && (
                          <span className="text-muted text-xs font-mono">/ {s.alt_label}</span>
                        )}
                        <span className="text-muted text-xs ml-auto">orden {s.sort_order}</span>
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="p-1.5 text-muted hover:text-gold transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSize(s.id, !s.active)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${s.active
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20"
                              : "border-muted/20 text-muted bg-white/5 hover:border-gold/30 hover:text-gold"
                            }`}
                        >
                          {s.active ? "Activo" : "Inactivo"}
                        </button>
                      </div>
                    )
                  )}

                  {/* Add size form / button */}
                  {showNewSize === type.id ? (
                    <form
                      onSubmit={(e) => handleCreateSize(type.id, e)}
                      className="flex flex-wrap gap-2 items-end bg-white/5 rounded-lg p-3 mt-1"
                    >
                      <div className="flex-1 min-w-[120px]">
                        <label className={LABEL}>Etiqueta *</label>
                        <input
                          value={newSizeForm.label}
                          onChange={(e) => setNewSizeForm({ ...newSizeForm, label: e.target.value })}
                          required
                          placeholder={`11 ${type.unit_label}`}
                          className={FIELD}
                        />
                      </div>
                      <div className="w-24">
                        <label className={LABEL}>Valor alt.</label>
                        <input
                          value={newSizeForm.alt_value}
                          onChange={(e) => setNewSizeForm({ ...newSizeForm, alt_value: e.target.value })}
                          placeholder="325"
                          className={FIELD}
                        />
                      </div>
                      <div className="w-28">
                        <label className={LABEL}>Etiq. alt.</label>
                        <input
                          value={newSizeForm.alt_label}
                          onChange={(e) => setNewSizeForm({ ...newSizeForm, alt_label: e.target.value })}
                          placeholder="325 ml"
                          className={FIELD}
                        />
                      </div>
                      <div className="w-20">
                        <label className={LABEL}>Orden</label>
                        <input
                          type="number"
                          value={newSizeForm.sort_order}
                          onChange={(e) => setNewSizeForm({ ...newSizeForm, sort_order: e.target.value })}
                          className={FIELD}
                        />
                      </div>
                      <div className="flex gap-1 pb-0.5">
                        <button
                          type="submit"
                          disabled={savingSize}
                          className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewSize(null)}
                          className="p-2 text-muted hover:text-[#e8e8e8] transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewSize(type.id);
                        setNewSizeForm({ label: "", alt_value: "", alt_label: "", sort_order: String(typeSizes.length) });
                      }}
                      className="btn-ghost text-xs flex items-center gap-1 self-start mt-1"
                    >
                      <Plus size={13} />
                      Agregar valor
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
