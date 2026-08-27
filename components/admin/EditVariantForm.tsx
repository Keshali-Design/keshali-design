"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { updateVariant } from "@/app/admin/productos/edit-actions";

type Props = {
  id: string;
  sku: string;
  priceOverride: number | null;
  active: boolean;
};

export function EditVariantForm({ id, sku, priceOverride, active }: Props) {
  const [open, setOpen] = useState(false);
  const [skuVal, setSkuVal] = useState(sku);
  const [priceOverrideStr, setPriceOverrideStr] = useState(
    priceOverride != null ? String(priceOverride) : ""
  );
  const [activeVal, setActiveVal] = useState(active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const priceOverrideVal = priceOverrideStr.trim() === "" ? null : Number(priceOverrideStr);

    const { error: err } = await updateVariant(id, {
      sku: skuVal,
      price_override: priceOverrideVal,
      active: activeVal,
    });

    if (err) {
      setError("Error al guardar");
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 hover:bg-subtle2 text-muted hover:text-gold-700 transition-colors"
        title="Editar"
      >
        <Pencil size={14} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1">
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={skuVal}
            onChange={(e) => setSkuVal(e.target.value)}
            className="w-32 bg-white border border-subtle px-2 py-1 text-xs text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            placeholder="SKU"
          />
          <input
            type="number"
            value={priceOverrideStr}
            onChange={(e) => setPriceOverrideStr(e.target.value)}
            className="w-24 bg-white border border-subtle px-2 py-1 text-xs text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            placeholder="Precio esp."
          />
          <label className="flex items-center gap-1 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={activeVal}
              onChange={(e) => setActiveVal(e.target.checked)}
              className="accent-gold"
            />
            Activo
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 hover:bg-emerald-50 text-emerald-700 transition-colors disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setSkuVal(sku);
              setPriceOverrideStr(priceOverride != null ? String(priceOverride) : "");
              setActiveVal(active);
              setError(null);
            }}
            className="p-1.5 hover:bg-subtle2 text-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
