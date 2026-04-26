"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createManualOrder } from "@/app/admin/pedidos/nuevo/actions";
import { formatCOP } from "@/lib/utils";
import { VariantCombobox } from "@/components/admin/VariantCombobox";

type Variant = { id: string; sku: string; title: string; price: number; stock: number };
type ItemRow = { variantId: string; quantity: number; unitPrice: number };

const FIELD = "bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

const STATUSES = [
  { value: "pending",   label: "Pendiente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "shipped",   label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

export function NuevoPedidoForm({ variants }: { variants: Variant[] }) {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    city: "",
    address: "",
    notes: "",
    shippingCost: 0,
    status: "confirmed",
  });

  const [items, setItems] = useState<ItemRow[]>([
    { variantId: variants[0]?.id ?? "", quantity: 1, unitPrice: variants[0]?.price ?? 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleField(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addItem() {
    setItems([...items, { variantId: variants[0]?.id ?? "", quantity: 1, unitPrice: variants[0]?.price ?? 0 }]);
  }

  function removeItem(i: number) {
    setItems(items.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, field: "quantity" | "unitPrice", value: string | number) {
    setItems(items.map((item, idx) =>
      idx === i ? { ...item, [field]: Number(value) } : item
    ));
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const total = subtotal + Number(form.shippingCost);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { setError("Agrega al menos un producto."); return; }
    setLoading(true);
    setError(null);

    const result = await createManualOrder({
      ...form,
      shippingCost: Number(form.shippingCost),
      items,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, server action redirects to /admin/pedidos
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Customer */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Cliente</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Nombre completo *</label>
            <input name="customerName" value={form.customerName} onChange={handleField} required className={FIELD} placeholder="María García" />
          </div>
          <div>
            <label className={LABEL}>Teléfono / WhatsApp</label>
            <input name="customerPhone" value={form.customerPhone} onChange={handleField} className={FIELD} placeholder="3001234567" />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Email</label>
            <input name="customerEmail" type="email" value={form.customerEmail} onChange={handleField} className={FIELD} placeholder="maria@ejemplo.com" />
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Envío</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Ciudad</label>
            <input name="city" value={form.city} onChange={handleField} className={FIELD} placeholder="Bogotá" />
          </div>
          <div>
            <label className={LABEL}>Costo de envío</label>
            <input name="shippingCost" type="number" min="0" value={form.shippingCost} onChange={handleField} className={FIELD} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL}>Dirección</label>
            <input name="address" value={form.address} onChange={handleField} className={FIELD} placeholder="Calle 123 #45-67" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-card p-5 flex flex-col gap-3">
        <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">Productos</h2>

        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5 pb-3 border-b border-subtle last:border-0 last:pb-0">
            {/* Row 1: combobox + delete */}
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <VariantCombobox
                  variants={variants}
                  value={item.variantId}
                  onChange={(variantId, price) => {
                    setItems(items.map((it, idx) =>
                      idx === i ? { ...it, variantId, unitPrice: price } : it
                    ));
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                className="p-2 text-muted hover:text-red-400 transition-colors disabled:opacity-30 flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {/* Row 2: qty + price */}
            <div className="flex gap-2">
              <div className="w-32">
                <label className={LABEL}>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  className={FIELD}
                />
              </div>
              <div className="flex-1">
                <label className={LABEL}>Precio unitario</label>
                <input
                  type="number"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem} className="btn-ghost text-xs flex items-center gap-1 self-start mt-1">
          <Plus size={14} /> Agregar producto
        </button>
      </div>

      {/* Notes + status + totals */}
      <div className="glass rounded-card p-5 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Estado del pedido</label>
            <select name="status" value={form.status} onChange={handleField} className={FIELD}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#0f0f10]">{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Notas</label>
            <input name="notes" value={form.notes} onChange={handleField} className={FIELD} placeholder="Instrucciones especiales..." />
          </div>
        </div>

        <div className="border-t border-subtle pt-4 flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-[#e8e8e8]">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Envío</span>
            <span className="text-[#e8e8e8]">{formatCOP(Number(form.shippingCost))}</span>
          </div>
          <div className="flex justify-between font-bold mt-1">
            <span className="text-[#e8e8e8]">Total</span>
            <span className="text-gold text-lg">{formatCOP(total)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-gold disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "Creando pedido..." : "Crear pedido"}
      </button>
    </form>
  );
}
