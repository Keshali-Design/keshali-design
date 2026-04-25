"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Check } from "lucide-react";
import { createVariant } from "@/app/admin/productos/actions";
import type { Category, Product, Design, Color, Size } from "@/lib/supabase/types";

type Props = {
  categories: Pick<Category, "id" | "name" | "slug">[];
  products: Pick<Product, "id" | "model_code" | "name" | "category_id">[];
  designs: Pick<Design, "id" | "design_ref" | "name">[];
  colors: Pick<Color, "id" | "name" | "hex_code">[];
  sizes: Pick<Size, "id" | "name" | "abbreviation">[];
};

const FIELD = "bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

export function NuevoProductoForm({ categories, products, designs, colors, sizes }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("__nuevo__");
  const [newProduct, setNewProduct] = useState({
    modelCode: "",
    name: "",
    material: "",
    capacity: "",
    baseCost: 0,
  });

  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [active, setActive] = useState(true);
  const [designId, setDesignId] = useState("");
  const [colorId, setColorId] = useState("");
  const [sizeId, setSizeId] = useState("");

  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filteredProducts = categoryId
    ? products.filter((p) => p.category_id === categoryId)
    : products;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveImage(from: number, to: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    let fd: FormData | null = null;
    if (images.length > 0) {
      fd = new FormData();
      images.forEach(({ file }) => fd!.append("images", file));
    }

    const { error: err, sku: createdSku } = await createVariant(
      {
        productId: productId !== "__nuevo__" ? productId : null,
        newProduct:
          productId === "__nuevo__"
            ? { ...newProduct, categoryId, baseCost: newProduct.baseCost }
            : null,
        sku,
        title,
        price,
        stock,
        active,
        designId: designId || null,
        colorId: colorId || null,
        sizeId: sizeId || null,
      },
      fd
    );

    setSaving(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/productos"), 1500);
    void createdSku;
  }

  if (success) {
    return (
      <div className="glass rounded-card p-8 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
          <Check size={24} className="text-emerald-400" />
        </div>
        <p className="text-[#e8e8e8] font-semibold">Producto creado exitosamente</p>
        <p className="text-muted text-sm">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Sección: Producto base ── */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
          Producto base
        </h2>

        <div>
          <label className={LABEL}>Categoría *</label>
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setProductId("__nuevo__"); }}
            required
            className={FIELD}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL}>Producto base *</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className={FIELD}
          >
            <option value="__nuevo__">+ Crear nuevo producto</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.model_code} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {productId === "__nuevo__" && (
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-subtle">
            <div>
              <label className={LABEL}>Código modelo *</label>
              <input
                value={newProduct.modelCode}
                onChange={(e) => setNewProduct({ ...newProduct, modelCode: e.target.value })}
                required={productId === "__nuevo__"}
                placeholder="MCB-11OZ"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Nombre *</label>
              <input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required={productId === "__nuevo__"}
                placeholder="Mug clásico 11oz"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Material</label>
              <input
                value={newProduct.material}
                onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                placeholder="Cerámica"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Capacidad</label>
              <input
                value={newProduct.capacity}
                onChange={(e) => setNewProduct({ ...newProduct, capacity: e.target.value })}
                placeholder="11 oz"
                className={FIELD}
              />
            </div>
            <div className="col-span-2">
              <label className={LABEL}>Costo base (COP)</label>
              <input
                type="number"
                value={newProduct.baseCost || ""}
                onChange={(e) => setNewProduct({ ...newProduct, baseCost: Number(e.target.value) })}
                placeholder="15000"
                className={FIELD}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sección: Variante ── */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
          Datos de la variante
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>SKU * <span className="text-muted/60">(único)</span></label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              required
              placeholder="MCB-11OZ-DSN-001-BL"
              className={`${FIELD} font-mono`}
            />
          </div>
          <div>
            <label className={LABEL}>Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Mug clásico - Diseño flores"
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Precio (COP) *</label>
            <input
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              placeholder="25000"
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Stock *</label>
            <input
              type="number"
              value={stock || ""}
              onChange={(e) => setStock(Number(e.target.value))}
              required
              placeholder="10"
              className={FIELD}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LABEL}>Diseño</label>
            <select value={designId} onChange={(e) => setDesignId(e.target.value)} className={FIELD}>
              <option value="">Sin diseño</option>
              {designs.map((d) => (
                <option key={d.id} value={d.id}>{d.design_ref} — {d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Color</label>
            <select value={colorId} onChange={(e) => setColorId(e.target.value)} className={FIELD}>
              <option value="">Sin color</option>
              {colors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Talla</label>
            <select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className={FIELD}>
              <option value="">Sin talla</option>
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>{s.abbreviation} — {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="accent-[#caa45a]"
          />
          Publicar inmediatamente
        </label>
      </div>

      {/* ── Sección: Imágenes ── */}
      <div className="glass rounded-card p-5 flex flex-col gap-3">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
          Imágenes del producto
        </h2>
        <p className="text-muted text-xs">
          La primera imagen es la principal ({sku ? <code className="text-gold/80">{sku}.png</code> : "SKU.png"}).
          Las adicionales se guardan como <code className="text-gold/80">{sku || "SKU"}-2.png</code>, etc.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map(({ preview }, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-gold text-bg px-1.5 py-0.5 rounded font-semibold">
                  Principal
                </span>
              )}

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="bg-white/10 hover:bg-gold/20 rounded p-1 text-[#e8e8e8] text-xs"
                    title="Mover izquierda"
                  >
                    ←
                  </button>
                )}
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="bg-white/10 hover:bg-gold/20 rounded p-1 text-[#e8e8e8] text-xs"
                    title="Mover derecha"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="bg-red-500/20 hover:bg-red-500/40 rounded p-1 text-red-400"
                  title="Eliminar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Upload button */}
          <label className="aspect-square flex flex-col items-center justify-center gap-1 border border-dashed border-subtle rounded-xl cursor-pointer hover:border-gold/40 transition-colors text-muted hover:text-[#e8e8e8]">
            <Upload size={18} />
            <span className="text-xs text-center leading-tight px-1">
              {images.length === 0 ? "Subir fotos" : "Agregar más"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {images.length > 1 && (
          <p className="text-muted text-xs">
            Pasa el cursor sobre una imagen para reordenar o eliminar.
          </p>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed flex-1"
        >
          {saving ? "Guardando..." : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
