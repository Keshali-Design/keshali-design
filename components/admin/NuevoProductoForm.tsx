"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createProduct } from "@/app/admin/productos/actions";
import { formatCOP } from "@/lib/utils";
import type { CategoryOpt, ColorOpt, SizeOpt } from "@/app/admin/productos/nuevo/page";

const FIELD = "bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

type Step = 1 | 2 | 3 | 4;

export function NuevoProductoForm({
  categories,
  allColors,
  allSizes,
  categoryColors,
  categorySizes,
}: {
  categories: CategoryOpt[];
  allColors: ColorOpt[];
  allSizes: SizeOpt[];
  categoryColors: { category_id: string; color_id: string; active: boolean }[];
  categorySizes: { category_id: string; size_id: string; active: boolean }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [priceVariesByColor, setPriceVariesByColor] = useState(false);

  // Step 2
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [sizePrices, setSizePrices] = useState<Record<string, number>>({});

  // Step 3
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);

  // Step 4
  const [skuOverrides, setSkuOverrides] = useState<Record<string, string>>({});
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const availableSizes = allSizes.filter((s) => {
    if (s.size_type_id !== selectedCategory?.size_type_id) return false;
    const cs = categorySizes.find((cs) => cs.category_id === categoryId && cs.size_id === s.id);
    return cs?.active ?? false;
  });

  const availableColors = allColors.filter((c) => {
    const cc = categoryColors.find((cc) => cc.category_id === categoryId && cc.color_id === c.id);
    return cc?.active ?? false;
  });

  function variantKey(colorId: string, sizeId: string) { return `${colorId}__${sizeId}`; }

  function suggestSku(colorCode: string, sizeLabel: string) {
    const p = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const c = colorCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    const s = sizeLabel.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    return `${p}-${c}-${s}`;
  }

  async function handleSubmit() {
    setError(null);
    setSaving(true);
    const overrides = selectedColorIds.flatMap((colorId) =>
      selectedSizeIds.map((sizeId) => {
        const key = variantKey(colorId, sizeId);
        return {
          color_id: colorId,
          size_id: sizeId,
          sku: skuOverrides[key] || undefined,
          price_override: priceVariesByColor ? (priceOverrides[key] ?? null) : null,
        };
      })
    );

    const res = await createProduct({
      category_id: categoryId,
      name,
      description: description || undefined,
      price_varies_by_color: priceVariesByColor,
      sizes: selectedSizeIds.map((id) => ({ size_id: id, price: sizePrices[id] ?? 0 })),
      colors: selectedColorIds.map((id) => ({ color_id: id })),
      variantOverrides: overrides,
    });

    if (res.error) { setError(res.error); setSaving(false); return; }
    // Redirect to the product edit page so the user can upload images immediately
    router.push(`/admin/productos/${res.productId}`);
  }

  const steps = ["Info básica", "Tamaños y precios", "Colores", "Revisar"];

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center">
        {steps.map((label, i) => {
          const num = (i + 1) as Step;
          const done = step > num;
          const current = step === num;
          return (
            <div key={num} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => { if (done) setStep(num); }}
                className="flex items-center gap-2"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  done ? "bg-gold text-black" : current ? "bg-gold/20 border border-gold text-gold" : "bg-white/5 border border-subtle text-muted"
                }`}>
                  {done ? <Check size={12} /> : num}
                </div>
                <span className={`text-xs hidden sm:inline ${current ? "text-[#e8e8e8]" : done ? "text-gold" : "text-muted"}`}>
                  {label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${done ? "bg-gold/40" : "bg-subtle"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="glass rounded-card p-5 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Información básica</h2>
          <div>
            <label className={LABEL}>Nombre del producto *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="Taza mágica" />
          </div>
          <div>
            <label className={LABEL}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={FIELD + " resize-none"}
              rows={2}
              placeholder="Descripción breve del producto…"
            />
          </div>
          <div>
            <label className={LABEL}>Categoría *</label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSelectedSizeIds([]); setSelectedColorIds([]); }}
              className={FIELD}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0f0f10]">
                  {c.name}{c.size_types ? ` (${c.size_types.name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>¿El precio varía también por color?</label>
            <div className="flex gap-3 mt-1">
              {([false, true] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setPriceVariesByColor(v)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                    priceVariesByColor === v
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-subtle text-muted hover:border-gold/30"
                  }`}
                >
                  {v ? "Sí, varía por color" : "No, solo por tamaño"}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!name.trim() || !categoryId) { setError("Nombre y categoría son requeridos."); return; }
              setError(null); setStep(2);
            }}
            className="btn-gold self-end"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Step 2: Sizes + prices */}
      {step === 2 && (
        <div className="glass rounded-card p-5 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
            Tamaños disponibles
            {selectedCategory?.size_types && (
              <span className="font-normal text-muted ml-2">({selectedCategory.size_types.name})</span>
            )}
          </h2>

          {availableSizes.length === 0 ? (
            <p className="text-muted text-sm">Esta categoría no tiene tamaños habilitados. Configúralos en la sección Categorías.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {availableSizes.map((size) => {
                const selected = selectedSizeIds.includes(size.id);
                return (
                  <div key={size.id} className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                    selected ? "border-gold/40 bg-gold/5" : "border-subtle bg-white/[0.02]"
                  }`}>
                    <button
                      type="button"
                      onClick={() => setSelectedSizeIds((prev) =>
                        prev.includes(size.id) ? prev.filter((id) => id !== size.id) : [...prev, size.id]
                      )}
                      className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        selected ? "border-gold bg-gold" : "border-subtle"
                      }`}
                    >
                      {selected && <Check size={11} className="text-black" />}
                    </button>
                    <span className="text-[#e8e8e8] text-sm flex-1">
                      {size.label}
                      {size.alt_label && <span className="text-muted text-xs ml-2">/ {size.alt_label}</span>}
                    </span>
                    {selected && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted whitespace-nowrap">Precio base</label>
                        <input
                          type="number"
                          min="0"
                          value={sizePrices[size.id] ?? ""}
                          onChange={(e) => setSizePrices({ ...sizePrices, [size.id]: Number(e.target.value) })}
                          placeholder="0"
                          className="bg-white/5 border border-subtle rounded-lg px-3 py-1.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 w-32"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between mt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-ghost">← Anterior</button>
            <button
              type="button"
              onClick={() => {
                if (selectedSizeIds.length === 0) { setError("Selecciona al menos un tamaño."); return; }
                setError(null); setStep(3);
              }}
              className="btn-gold"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Colors */}
      {step === 3 && (
        <div className="glass rounded-card p-5 flex flex-col gap-4">
          <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Colores disponibles</h2>

          {availableColors.length === 0 ? (
            <p className="text-muted text-sm">Esta categoría no tiene colores habilitados. Configúralos en la sección Categorías.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const selected = selectedColorIds.includes(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorIds((prev) =>
                      prev.includes(color.id) ? prev.filter((id) => id !== color.id) : [...prev, color.id]
                    )}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all ${
                      selected ? "border-gold/50 bg-gold/10 text-gold" : "border-subtle text-muted hover:border-gold/30"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" style={{ background: color.hex_code }} />
                    {color.name}
                    {selected && <Check size={11} />}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-between mt-2">
            <button type="button" onClick={() => setStep(2)} className="btn-ghost">← Anterior</button>
            <button
              type="button"
              onClick={() => {
                if (selectedColorIds.length === 0) { setError("Selecciona al menos un color."); return; }
                setError(null); setStep(4);
              }}
              className="btn-gold"
            >
              Revisar →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review + SKU / price overrides */}
      {step === 4 && (
        <div className="glass rounded-card p-5 flex flex-col gap-5">
          <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
            Revisar variantes — {selectedColorIds.length * selectedSizeIds.length} combinaciones
          </h2>

          <div className="flex flex-col gap-2">
            {selectedColorIds.map((colorId) =>
              selectedSizeIds.map((sizeId) => {
                const color = allColors.find((c) => c.id === colorId)!;
                const size = allSizes.find((s) => s.id === sizeId)!;
                const key = variantKey(colorId, sizeId);
                const basePrice = sizePrices[sizeId] ?? 0;

                return (
                  <div key={key} className="flex flex-wrap items-center gap-3 bg-white/[0.03] rounded-lg px-3 py-2.5 border border-subtle">
                    <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ background: color.hex_code }} />
                    <span className="text-[#e8e8e8] text-xs font-medium w-20 truncate">{color.name}</span>
                    <span className="text-muted text-xs w-20 truncate">{size.label}</span>
                    <div className="flex-1 min-w-[140px]">
                      <input
                        value={skuOverrides[key] ?? ""}
                        onChange={(e) => setSkuOverrides({ ...skuOverrides, [key]: e.target.value })}
                        placeholder={suggestSku(color.color_code, size.label)}
                        className="bg-white/5 border border-subtle rounded px-2 py-1.5 text-xs font-mono text-[#e8e8e8] placeholder:text-muted/50 focus:outline-none focus:border-gold/50 w-full"
                      />
                    </div>
                    {priceVariesByColor ? (
                      <input
                        type="number"
                        min="0"
                        value={priceOverrides[key] ?? ""}
                        onChange={(e) => setPriceOverrides({ ...priceOverrides, [key]: Number(e.target.value) })}
                        placeholder={String(basePrice)}
                        className="bg-white/5 border border-subtle rounded px-2 py-1.5 text-xs text-[#e8e8e8] focus:outline-none focus:border-gold/50 w-28"
                      />
                    ) : (
                      <span className="text-gold text-xs font-semibold">{formatCOP(basePrice)}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <p className="text-muted text-xs">SKU se auto-genera si se deja vacío. Stock inicia en 0 y se gestiona en la sección Stock.</p>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(3)} className="btn-ghost">← Anterior</button>
            <button type="button" onClick={handleSubmit} disabled={saving} className="btn-gold disabled:opacity-60">
              {saving ? "Creando…" : "Crear producto"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
