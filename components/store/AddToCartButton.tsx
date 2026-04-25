"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import type { CatalogItem } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type Props = {
  item: CatalogItem;
  disabled?: boolean;
  size?: "sm" | "md";
};

export function AddToCartButton({ item, disabled, size = "md" }: Props) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem(item)}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
        size === "sm"
          ? "px-3 py-2 text-xs w-full"
          : "px-6 py-3 text-sm w-full sm:w-auto",
        disabled
          ? "bg-white/5 text-muted cursor-not-allowed border border-subtle"
          : "bg-gold hover:bg-gold-light text-bg shadow-[0_4px_16px_rgba(202,164,90,0.3)] hover:shadow-[0_6px_24px_rgba(202,164,90,0.45)] hover:-translate-y-0.5"
      )}
    >
      <ShoppingCart size={size === "sm" ? 14 : 16} />
      {disabled ? "Agotado" : "Agregar al carrito"}
    </button>
  );
}
