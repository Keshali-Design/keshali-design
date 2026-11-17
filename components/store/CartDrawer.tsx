"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, CreditCard, MessageCircle, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatCOP } from "@/lib/utils";
import { buildOrderWhatsAppUrl } from "@/lib/whatsapp";

const FIELD =
  "block w-full mt-1 border border-subtle bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, clearCart, contact, setContact } =
    useCart();
  const cartTotal = total();
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const [nameError, setNameError] = useState(false);
  const nameId = useId();
  const cityId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  function handleWhatsApp() {
    if (!contact.name.trim()) {
      setNameError(true);
      nameRef.current?.focus();
      return;
    }
    const url = buildOrderWhatsAppUrl({ name: contact.name, city: contact.city, items });
    // Popup blockers can refuse window.open; fall back to navigating this tab.
    if (!window.open(url, "_blank", "noopener,noreferrer")) window.location.href = url;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={closeCart} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mi carrito"
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-surface border-l border-subtle"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-subtle bg-white">
          <h2 className="font-bold text-ink text-lg">
            Mi carrito{" "}
            {items.length > 0 && (
              <span className="text-gold-700 text-sm font-normal ml-1">
                ({items.length} {items.length === 1 ? "producto" : "productos"})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="p-1.5 hover:bg-subtle2 text-muted hover:text-ink transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted text-sm gap-4 p-6 text-center">
            <ShoppingCartEmpty />
            <p>Tu carrito está vacío</p>
            <Link href="/catalogo" onClick={closeCart} className="btn-gold">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            {/* Items + summary + contact scroll together; the actions stay pinned below. */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="p-4 flex flex-col gap-3">
                {items.map((item) => {
                  const category = [item.categoryName, item.subcategoryName].filter(Boolean).join(" · ");
                  return (
                    <li key={item.variantId} className="bg-white border border-subtle p-3 flex gap-3">
                      <div className="w-16 h-16 overflow-hidden bg-subtle2 flex-shrink-0 relative">
                        {item.image ? (
                          <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="64px" />
                        ) : (
                          <div className="w-full h-full bg-subtle2" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {category && <p className="eyebrow truncate">{category}</p>}
                        <p className="text-ink text-sm font-medium leading-snug line-clamp-2">{item.productName}</p>
                        <p className="text-muted text-xs truncate">
                          {[item.sizeLabel, item.colorName].filter(Boolean).join(" · ")}
                        </p>
                        <p className="text-gold-700 text-sm font-bold mt-0.5">
                          {formatCOP(item.price * item.quantity)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            aria-label={`Quitar una unidad de ${item.productName}`}
                            className="w-6 h-6 border border-subtle flex items-center justify-center text-muted hover:text-ink hover:border-gold transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-ink text-sm w-5 text-center" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            aria-label={`Agregar una unidad de ${item.productName}`}
                            className="w-6 h-6 border border-subtle flex items-center justify-center text-muted hover:text-ink hover:border-gold transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            aria-label={`Eliminar ${item.productName} del carrito`}
                            className="ml-auto text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="px-4 pb-4 flex flex-col gap-4">
                <div className="border-t border-subtle pt-3 flex flex-col gap-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-ink">{formatCOP(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Envío</span>
                    <span className="text-muted text-xs">Por coordinar</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="font-semibold text-ink">Total</span>
                    <span className="text-gold-700 font-extrabold text-xl">{formatCOP(cartTotal)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <label htmlFor={nameId} className="label-sm">Tu nombre *</label>
                    <input
                      id={nameId}
                      ref={nameRef}
                      value={contact.name}
                      onChange={(e) => {
                        setContact({ name: e.target.value });
                        if (e.target.value.trim()) setNameError(false);
                      }}
                      placeholder="Ej: María García"
                      autoComplete="name"
                      aria-invalid={nameError}
                      aria-describedby={nameError ? `${nameId}-error` : undefined}
                      className={`${FIELD} ${nameError ? "border-red-400" : ""}`}
                    />
                    {nameError && (
                      <p id={`${nameId}-error`} className="text-red-600 text-xs mt-1">
                        Escribe tu nombre para enviar el pedido.
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={cityId} className="label-sm">Tu ciudad</label>
                    <input
                      id={cityId}
                      value={contact.city}
                      onChange={(e) => setContact({ city: e.target.value })}
                      placeholder="Ej: Medellín"
                      autoComplete="address-level2"
                      className={FIELD}
                    />
                  </div>
                </div>

                <button
                  onClick={clearCart}
                  className="text-xs text-muted hover:text-red-500 transition-colors self-center"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-subtle bg-white flex flex-col gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#128C7E] hover:bg-[#0E7A6E] text-white font-extrabold text-[13px] tracking-wide px-6 py-3.5 transition-colors"
              >
                <MessageCircle size={18} />
                Enviar pedido por WhatsApp
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCheckout}
                  className="border border-gold text-gold-700 hover:bg-gold-50 font-extrabold text-xs whitespace-nowrap px-2 py-3 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CreditCard size={14} />
                  Pagar en línea
                </button>
                <button
                  onClick={closeCart}
                  className="border border-subtle text-body hover:border-gold hover:text-ink font-extrabold text-xs whitespace-nowrap px-2 py-3 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  Seguir comprando
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ShoppingCartEmpty() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-30"
      aria-hidden
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
