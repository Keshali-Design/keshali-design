"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, Star } from "lucide-react";
import { updateVariantFull, deleteVariantImage, addVariantImages } from "@/app/admin/productos/[id]/actions";
import { formatCOP } from "@/lib/utils";

type Image = { id: string; url: string; alt_text?: string; sort_order: number; is_primary: boolean };

const FIELD = "bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

export function EditVariantFullForm({
  id,
  sku: initialSku,
  priceOverride: initialPriceOverride,
  active: initialActive,
  images: initialImages,
}: {
  id: string;
  sku: string;
  priceOverride: number | null;
  active: boolean;
  images: Image[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sku, setSku] = useState(initialSku);
  // Store price override as string so the input can be blank (null = use base price)
  const [priceOverrideStr, setPriceOverrideStr] = useState(
    initialPriceOverride != null ? String(initialPriceOverride) : ""
  );
  const [active, setActive] = useState(initialActive);
  const [images, setImages] = useState<Image[]>(initialImages);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const priceOverride = priceOverrideStr.trim() === "" ? null : Number(priceOverrideStr);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim()) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await updateVariantFull(id, {
      sku: sku.trim(),
      price_override: priceOverride,
      active,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  async function handleDeleteImage(img: Image) {
    setDeletingId(img.id);
    const fileName = img.url.split("/").pop() ?? "";
    const result = await deleteVariantImage(img.id, fileName);
    if (result?.error) {
      setError(result.error);
    } else {
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    }
    setDeletingId(null);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("images", file);
    }

    const result = await addVariantImages(id, sku, formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Main fields */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Datos de la variante</h2>

        <div>
          <label className={LABEL}>SKU</label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className={FIELD}
            placeholder="TAZA11-BLA-11OZ"
          />
        </div>

        <div>
          <label className={LABEL}>Precio especial (COP) — opcional</label>
          <input
            type="number"
            min="0"
            value={priceOverrideStr}
            onChange={(e) => setPriceOverrideStr(e.target.value)}
            className={FIELD}
            placeholder="Dejar vacío para usar el precio base por talla"
          />
          {priceOverride != null && (
            <p className="text-muted text-xs mt-1">{formatCOP(priceOverride)}</p>
          )}
          <p className="text-muted text-xs mt-1">
            Si se deja vacío, el precio se toma del configurado por talla en el producto.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${active ? "bg-gold" : "bg-white/10"}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? "translate-x-5" : ""}`} />
          </div>
          <span className="text-sm text-[#e8e8e8]">Variante activa (visible en tienda)</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>

      {/* Images */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Imágenes</h2>

        {images.length === 0 && (
          <p className="text-muted text-sm text-center py-4">Sin imágenes aún.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-subtle bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_text ?? ""}
                className="w-full aspect-square object-cover"
              />
              {img.is_primary && (
                <div className="absolute top-1 left-1 bg-gold/90 rounded px-1.5 py-0.5 flex items-center gap-1">
                  <Star size={10} className="text-black" />
                  <span className="text-black text-[10px] font-semibold">Principal</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDeleteImage(img)}
                disabled={deletingId === img.id}
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-500/80 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`btn-ghost text-xs flex items-center gap-2 cursor-pointer w-fit ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload size={13} />
            {uploading ? "Subiendo..." : "Agregar imágenes"}
          </label>
        </div>
      </div>
    </form>
  );
}
