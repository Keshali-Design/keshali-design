"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createProduct } from "@/app/admin/productos/actions";
import { formatCOP } from "@/lib/utils";
import type { CategoryOpt, SubcategoryOpt, ColorOpt, SizeOpt } from "@/app/admin/productos/nuevo/page";

const FIELD = "bg-white border border-subtle px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors w-full";
const LABEL = "label-sm block mb-1.5";

type Step = 1 | 2 | 3 | 4;

export function NuevoProductoForm({
  categories,
  subcategories,
  allColors,
  allSizes,
  categoryColors,
  categorySizes,
}: {
  categories: CategoryOpt[];
  subcategories: SubcategoryOpt[];
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
  const [subcategoryId, setSubcategoryId] = useState("");
  const [technique, setTechnique] = useState("");
  const [priceVariesByColor, setPriceVariesByColor] = useState(false);

  const filteredSubcategories = subcategories.filter((s) => s.parent_id === categoryId);

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
      subcategory_id: subcategoryId || undefined,
      name,
      description: description || undefined,
      technique: technique || undefined,
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
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  done ? "bg-gold text-white" : current ? "bg-gold-100 border border-gold text-gold-700" : "bg-white border border-subtle text-muted"
                }`}>
                  {done ? <Check size={12} /> : num}
                </div>
                <span className={`text-xs hidden sm:inline ${current ? "text-ink" : done ? "text-gold-700" : "text-muted"}`}>
                  {label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${done ? "bg-gold" : "bg-subtle"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="bg-surface border border-subtle p-5 flex flex-col gap-4">
          <h2 className="text-ink font-bold text-sm border-b border-subtle pb-2">Información básica</h2>
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
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
                setSelectedSizeIds([]);
                setSelectedColorIds([]);
              }}
              className={FIELD}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.size_types ? ` (${c.size_types.name})` : ""}
                </option>
              ))}
            </select>
          </div>
          {filteredSubcategories.length > 0 && (
            <div>
              <label className={LABEL}>Subcategoría <span className="text-muted normal-case font-normal">(opcional)</span></label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className={FIELD}
              >
                <option value="">— Sin subcategoría —</option>
                {filteredSubcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={LABEL}>Técnica <span className="text-muted normal-case font-normal">(opcional)</span></label>
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className={FIELD}
            >
              <option value="">— Sin especificar —</option>
              <option value="DTF">DTF</option>
              <option value="Sublimación">Sublimación</option>
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
                  className={`px-4 py-2 border text-sm transition-colors ${
                    priceVariesByColor === v
                      ? "border-gold bg-gold-50 text-gold-700"
                      : "border-subtle text-muted hover:border-gold"
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
        <div className="bg-surface border border-subtle p-5 flex flex-col gap-4">
          <h2 className="text-ink font-bold text-sm border-b border-subtle pb-2">
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
                  <div key={size.id} className={`flex items-center gap-4 border p-3 transition-colors ${
                    selected ? "border-gold bg-gold-50" : "border-subtle bg-[#FDFBF7]"
                  }`}>
                    <button
                      type="button"
                      onClick={() => setSelectedSizeIds((prev) =>
                        prev.includes(size.id) ? prev.filter((id) => id !== size.id) : [...prev, size.id]
                      )}
                      className={`w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-colors ${
                        selected ? "border-gold bg-gold" : "border-subtle bg-white"
                      }`}
                    >
                      {selected && <Check size={11} className="text-white" />}
                    </button>
                    <span className="text-ink text-sm flex-1">
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
                          className="bg-white border border-subtle px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold w-32"
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
        <div className="bg-surface border border-subtle p-5 flex flex-col gap-4">
          <h2 className="text-ink font-bold text-sm border-b border-subtle pb-2">Colores disponibles</h2>

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
                    className={`flex items-center gap-2 px-3 py-2 border text-sm transition-all ${
                      selected ? "border-gold bg-gold-50 text-gold-700" : "border-subtle text-muted hover:border-gold"
                    }`}
                  >
                    <span className="w-3.5 h-3.5 border border-subtle flex-shrink-0" style={{ background: color.hex_code }} />
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
        <div className="bg-surface border border-subtle p-5 flex flex-col gap-5">
          <h2 className="text-ink font-bold text-sm border-b border-subtle pb-2">
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
                  <div key={key} className="flex flex-wrap items-center gap-3 bg-[#FDFBF7] px-3 py-2.5 border border-subtle">
                    <span className="w-3 h-3 border border-subtle flex-shrink-0" style={{ background: color.hex_code }} />
                    <span className="text-ink text-xs font-medium w-20 truncate">{color.name}</span>
                    <span className="text-muted text-xs w-20 truncate">{size.label}</span>
                    <div className="flex-1 min-w-[140px]">
                      <input
                        value={skuOverrides[key] ?? ""}
                        onChange={(e) => setSkuOverrides({ ...skuOverrides, [key]: e.target.value })}
                        placeholder={suggestSku(color.color_code, size.label)}
                        className="bg-white border border-subtle px-2 py-1.5 text-xs font-mono text-ink placeholder:text-muted/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold w-full"
                      />
                    </div>
                    {priceVariesByColor ? (
                      <input
                        type="number"
                        min="0"
                        value={priceOverrides[key] ?? ""}
                        onChange={(e) => setPriceOverrides({ ...priceOverrides, [key]: Number(e.target.value) })}
                        placeholder={String(basePrice)}
                        className="bg-white border border-subtle px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold w-28"
                      />
                    ) : (
                      <span className="text-gold-700 text-xs font-bold">{formatCOP(basePrice)}</span>
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
        <div className="bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
