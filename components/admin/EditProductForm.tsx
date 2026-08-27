"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Trash2, Upload, Star, Check, X } from "lucide-react";
import { updateProduct } from "@/app/admin/productos/actions";
import { updateVariantFull, deleteVariantImage, addVariantImages } from "@/app/admin/productos/[id]/actions";
import { formatCOP } from "@/lib/utils";
import type { ProductFull, VariantWithImages } from "@/app/admin/productos/[id]/page";

const FIELD = "bg-white border border-subtle px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors w-full";
const LABEL = "label-sm block mb-1.5";

// ── Product header (name / description / active) ──────────────

function ProductHeader({ product }: { product: ProductFull }) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [technique, setTechnique] = useState(product.technique ?? "");
  const [active, setActive] = useState(product.active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await updateProduct(product.id, { name, description, technique, active });
    if (res.error) { setError(res.error); }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave} className="bg-surface border border-subtle p-5 flex flex-col gap-4 mb-6">
      <h2 className="text-ink font-bold text-sm border-b border-subtle pb-2">Info del producto</h2>

      <div>
        <label className={LABEL}>Nombre *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={FIELD} />
      </div>

      <div>
        <label className={LABEL}>Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={FIELD + " resize-none"}
        />
      </div>

      <div>
        <label className={LABEL}>Técnica <span className="text-muted normal-case font-normal">(opcional)</span></label>
        <select value={technique} onChange={(e) => setTechnique(e.target.value)} className={FIELD}>
          <option value="">— Sin especificar —</option>
          <option value="DTF">DTF</option>
          <option value="Sublimación">Sublimación</option>
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <div className={`w-10 h-5 transition-colors ${active ? "bg-gold" : "bg-subtle2"}`} />
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${active ? "translate-x-5" : ""}`} />
        </div>
        <span className="text-sm text-ink">Producto activo</span>
      </label>

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <button type="submit" disabled={saving} className="btn-gold text-sm py-2 px-4 w-fit disabled:opacity-60">
        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </form>
  );
}

// ── Single variant card ───────────────────────────────────────

function VariantCard({
  variant,
  priceVariesByColor,
  basePrices,
}: {
  variant: VariantWithImages;
  priceVariesByColor: boolean;
  basePrices: Record<string, number>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [sku, setSku] = useState(variant.sku);
  const [priceOverrideStr, setPriceOverrideStr] = useState(
    variant.price_override != null ? String(variant.price_override) : ""
  );
  const [active, setActive] = useState(variant.active);
  const [images, setImages] = useState(variant.images);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const priceOverride = priceOverrideStr.trim() === "" ? null : Number(priceOverrideStr);
  const basePrice = basePrices[variant.sizes?.id ?? ""] ?? 0;
  const displayPrice = priceOverride ?? basePrice;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await updateVariantFull(variant.id, { sku: sku.trim(), price_override: priceOverride, active });
    if (res?.error) { setError(res.error); }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setSaving(false);
  }

  async function handleDeleteImage(img: VariantWithImages["images"][0]) {
    setDeletingId(img.id);
    const s3Key = new URL(img.url).pathname.slice(1);
    const res = await deleteVariantImage(img.id, s3Key);
    if (res?.error) { setError(res.error); }
    else { setImages((prev) => prev.filter((i) => i.id !== img.id)); }
    setDeletingId(null);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    for (const file of Array.from(files)) formData.append("images", file);
    const res = await addVariantImages(variant.id, sku, formData);
    if (res?.error) { setError(res.error); }
    else { router.refresh(); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const colorDot = variant.colors?.hex_code;
  const sizeLabel = [variant.sizes?.label, variant.sizes?.alt_label].filter(Boolean).join(" / ");

  return (
    <div className="bg-surface border border-subtle overflow-hidden">
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-subtle2 transition-colors text-left"
      >
        {expanded
          ? <ChevronDown size={14} className="text-muted flex-shrink-0" />
          : <ChevronRight size={14} className="text-muted flex-shrink-0" />
        }

        {colorDot && (
          <span
            className="w-3.5 h-3.5 border border-subtle flex-shrink-0"
            style={{ background: colorDot }}
          />
        )}

        <span className="text-sm text-ink font-medium">{variant.colors?.name}</span>
        <span className="text-muted text-xs">{sizeLabel}</span>
        <span className="text-muted text-xs font-mono ml-auto mr-2">{variant.sku}</span>
        <span className="text-gold-700 text-xs font-bold">{formatCOP(displayPrice)}</span>

        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 border ml-2 flex-shrink-0 ${
          variant.active
            ? "border-gold-300 text-gold-700 bg-gold-100"
            : "border-subtle text-muted bg-subtle2"
        }`}>
          {variant.active ? "Activo" : "Inactivo"}
        </span>

        {/* Image count badge */}
        <span className="text-muted text-[10px] flex-shrink-0">
          {images.length} img
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-subtle px-4 py-4 flex flex-col gap-5">
          {/* Variant fields */}
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>SKU</label>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                  className={FIELD}
                />
              </div>
              {priceVariesByColor && (
                <div>
                  <label className={LABEL}>Precio especial (COP) — opcional</label>
                  <input
                    type="number"
                    min="0"
                    value={priceOverrideStr}
                    onChange={(e) => setPriceOverrideStr(e.target.value)}
                    placeholder={`Base: ${formatCOP(basePrice)}`}
                    className={FIELD}
                  />
                  {priceOverride != null && (
                    <p className="text-muted text-xs mt-1">{formatCOP(priceOverride)}</p>
                  )}
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={active} onChange={(e) => setActive(e.target.checked)} />
                <div className={`w-9 h-5 transition-colors ${active ? "bg-gold" : "bg-subtle2"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${active ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-sm text-ink">Variante activa</span>
            </label>

            {error && <p className="text-red-600 text-xs">{error}</p>}

            <button type="submit" disabled={saving} className="btn-gold text-sm py-2 px-4 w-fit disabled:opacity-60">
              {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar variante"}
            </button>
          </form>

          {/* Images */}
          <div className="flex flex-col gap-3">
            <p className="label-sm">Imágenes</p>

            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group overflow-hidden border border-subtle bg-subtle2 aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                    {img.is_primary && (
                      <div className="absolute top-1 left-1 bg-gold px-1 py-0.5 flex items-center gap-0.5">
                        <Star size={9} className="text-white" />
                        <span className="text-white text-[9px] font-bold">Principal</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      disabled={deletingId === img.id}
                      className="absolute top-1 right-1 bg-ink/80 hover:bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-xs">Sin imágenes aún.</p>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                id={`upload-${variant.id}`}
              />
              <label
                htmlFor={`upload-${variant.id}`}
                className={`btn-ghost text-xs flex items-center gap-2 cursor-pointer w-fit ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <Upload size={13} />
                {uploading ? "Subiendo..." : "Subir imágenes"}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── No-variants warning with delete button ────────────────────

function DeleteAndRecreateHint({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { deleteProduct } = await import("@/app/admin/productos/actions");
    const res = await deleteProduct(productId);
    if (res.error) { alert(res.error); setDeleting(false); return; }
    router.push("/admin/productos/nuevo");
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="btn-ghost text-xs text-red-700 hover:text-red-800 w-fit border-red-300 hover:border-red-400"
      >
        Eliminar y crear de nuevo
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-muted text-xs">¿Eliminar «{productName}»?</p>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {deleting ? "Eliminando..." : "Sí, eliminar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs text-muted hover:text-ink transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export function EditProductForm({ product }: { product: ProductFull }) {
  const basePrices: Record<string, number> = Object.fromEntries(
    product.product_sizes.map((ps) => [ps.size_id, ps.price])
  );

  // Sort variants: by size sort_order (not available here, use label), then color name
  const sorted = [...product.variants].sort((a, b) => {
    const sizeA = a.sizes?.label ?? "";
    const sizeB = b.sizes?.label ?? "";
    if (sizeA !== sizeB) return sizeA.localeCompare(sizeB);
    return (a.colors?.name ?? "").localeCompare(b.colors?.name ?? "");
  });

  return (
    <div className="flex flex-col gap-4">
      <ProductHeader product={product} />

      <div className="flex items-center justify-between">
        <h2 className="text-ink font-bold text-sm">
          Variantes <span className="text-muted font-normal">({sorted.length})</span>
        </h2>
        {sorted.length > 0 && (
          <p className="text-muted text-xs">Clic en una variante para editarla o subir imágenes</p>
        )}
      </div>

      {sorted.length === 0 && (
        <div className="bg-surface border border-gold-300 p-6 flex flex-col gap-3">
          <p className="text-gold-700 text-sm font-bold">Este producto no tiene variantes</p>
          <p className="text-muted text-xs leading-relaxed">
            Probablemente ocurrió un error al crearlo. Sin variantes no es posible subir imágenes
            ni gestionar stock. Lo mejor es eliminar este producto y volver a crearlo.
          </p>
          <DeleteAndRecreateHint productId={product.id} productName={product.name} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((v) => (
          <VariantCard
            key={v.id}
            variant={v}
            priceVariesByColor={product.price_varies_by_color}
            basePrices={basePrices}
          />
        ))}
      </div>
    </div>
  );
}
