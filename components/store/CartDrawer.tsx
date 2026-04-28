"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatCOP } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, clearCart } =
    useCart();
  const cartTotal = total();
  const router = useRouter();

  if (!isOpen) return null;

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col glass border-l border-subtle shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-subtle">
          <h2 className="font-bold text-[#e8e8e8] text-lg">
            Carrito{" "}
            {items.length > 0 && (
              <span className="text-gold text-sm font-normal ml-1">
                ({items.length} {items.length === 1 ? "producto" : "productos"})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-[#e8e8e8] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted text-sm gap-2">
              <ShoppingCartEmpty />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.variantId}
                className="glass rounded-card p-3 flex gap-3"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[#e8e8e8] text-sm font-medium leading-snug truncate">
                    {item.productName}
                  </p>
                  <p className="text-muted text-xs truncate">
                    {item.sizeLabel} · {item.colorName}
                  </p>
                  <p className="text-gold text-sm font-semibold mt-0.5">
                    {formatCOP(item.price * item.quantity)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded border border-subtle flex items-center justify-center text-muted hover:text-[#e8e8e8] hover:border-gold/40 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-[#e8e8e8] text-sm w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                      className="w-6 h-6 rounded border border-subtle flex items-center justify-center text-muted hover:text-[#e8e8e8] hover:border-gold/40 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-auto text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-subtle flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">Total</span>
              <span className="text-gold font-bold text-xl">
                {formatCOP(cartTotal)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-gold flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Ir al pago
            </button>

            <button
              onClick={clearCart}
              className="text-xs text-muted hover:text-red-400 transition-colors text-center"
            >
              Vaciar carrito
            </button>
          </div>
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
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
