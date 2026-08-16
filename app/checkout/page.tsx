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
  "block w-full mt-1 border border-subtle bg-[#FDFBF7] px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors";

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

      <h1 className="section-title text-2xl mb-2">Finalizar pedido</h1>
      <div className="divider mb-8" />

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        {/* ── Datos del cliente ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-subtle p-5 flex flex-col gap-4">
            <h2 className="label-sm">Datos de contacto</h2>

            <div>
              <label className="label-sm block mb-1">Nombre completo *</label>
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
              <label className="label-sm block mb-1">Email *</label>
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
              <label className="label-sm block mb-1">Teléfono / WhatsApp *</label>
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

          <div className="bg-surface border border-subtle p-5 flex flex-col gap-4">
            <h2 className="label-sm">Dirección de envío</h2>

            <div>
              <label className="label-sm block mb-1">Ciudad *</label>
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
              <label className="label-sm block mb-1">Dirección *</label>
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
              <label className="label-sm block mb-1">Notas adicionales</label>
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
          <div className="bg-surface border border-subtle p-5">
            <h2 className="label-sm mb-4">Resumen del pedido</h2>

            <div className="flex flex-col gap-3 mb-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <div className="w-12 h-12 overflow-hidden bg-[#F3EDE1] flex-shrink-0 relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F3EDE1]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-xs font-medium leading-snug line-clamp-2">
                      {item.productName}
                    </p>
                    <p className="text-muted text-xs mt-0.5">
                      {item.sizeLabel} · {item.colorName} · x{item.quantity}
                    </p>
                  </div>
                  <span className="text-gold-700 text-sm font-bold whitespace-nowrap">
                    {formatCOP(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-subtle2 pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-ink">{formatCOP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Envío</span>
                <span className="text-muted text-xs">Por coordinar</span>
              </div>
              <div className="divider my-3" />
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-gold-700 font-extrabold text-2xl">
                  {formatCOP(cartTotal)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 px-4 py-3 text-red-700 text-sm">
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
