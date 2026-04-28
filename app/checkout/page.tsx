"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatCOP } from "@/lib/utils";
import { createOrder } from "./actions";
import Image from "next/image";

const SHIPPING_COST = 0; // Por coordinar con el cliente

const FIELD =
  "bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-[#e8e8e8] focus:outline-none focus:border-gold/50 transition-colors w-full";
const LABEL = "text-xs text-muted block mb-1";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const cartTotal = total();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    city: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    const { error: err, wompiUrl } = await createOrder({
      ...form,
      items: items.map((i) => ({
        variantId: i.variantId,
        sku: i.sku,
        title: `${i.productName} — ${i.sizeLabel} / ${i.colorName}`,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: cartTotal,
      shippingCost: SHIPPING_COST,
      total: cartTotal + SHIPPING_COST,
    });

    if (err || !wompiUrl) {
      setError(err ?? "Error inesperado. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    clearCart();
    window.location.href = wompiUrl;
  }

  if (items.length === 0) {
    return (
      <div className="section max-w-lg text-center py-20">
        <ShoppingBag size={48} className="mx-auto mb-4 text-muted opacity-30" />
        <p className="text-muted mb-4">Tu carrito está vacío.</p>
        <Link href="/catalogo" className="btn-gold">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="section max-w-5xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-8"
      >
        <ChevronLeft size={16} />
        Seguir comprando
      </Link>

      <h1 className="section-title text-2xl mb-8">Finalizar pedido</h1>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* ── Datos del cliente ── */}
        <div className="flex flex-col gap-5">
          <div className="glass rounded-card p-5 flex flex-col gap-4">
            <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
              Datos de contacto
            </h2>

            <div>
              <label className={LABEL}>Nombre completo *</label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
                placeholder="María García"
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>Email *</label>
              <input
                name="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={handleChange}
                required
                placeholder="maria@ejemplo.com"
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>Teléfono / WhatsApp *</label>
              <input
                name="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={handleChange}
                required
                placeholder="3001234567"
                className={FIELD}
              />
            </div>
          </div>

          <div className="glass rounded-card p-5 flex flex-col gap-4">
            <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2">
              Dirección de envío
            </h2>

            <div>
              <label className={LABEL}>Ciudad *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="Bogotá"
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>Dirección *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Calle 123 #45-67, Apto 201"
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>Notas adicionales</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Indicaciones especiales, personalización, etc."
                className={`${FIELD} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* ── Resumen del pedido ── */}
        <div className="flex flex-col gap-4">
          <div className="glass rounded-card p-5">
            <h2 className="text-[#e8e8e8] font-semibold text-sm border-b border-subtle pb-2 mb-4">
              Resumen del pedido
            </h2>

            <div className="flex flex-col gap-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e8e8e8] text-xs font-medium leading-snug line-clamp-2">
                      {item.productName}
                    </p>
                    <p className="text-muted text-xs mt-0.5">
                      {item.sizeLabel} · {item.colorName} · x{item.quantity}
                    </p>
                  </div>
                  <span className="text-gold text-sm font-semibold whitespace-nowrap">
                    {formatCOP(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-subtle pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-[#e8e8e8]">{formatCOP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Envío</span>
                <span className="text-muted text-xs">Por coordinar</span>
              </div>
              <div className="flex justify-between font-bold mt-1">
                <span className="text-[#e8e8e8]">Total</span>
                <span className="text-gold text-xl">{formatCOP(cartTotal)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Procesando..."
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                Pagar con Wompi
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted leading-relaxed">
            Al hacer clic serás redirigido a Wompi, la plataforma de pago segura
            de Bancolombia. Aceptamos tarjetas, PSE, Nequi y Efecty.
          </p>
        </div>
      </form>
    </div>
  );
}
