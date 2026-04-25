import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CatalogItem } from "@/lib/supabase/types";
import { getImageUrl } from "@/lib/utils";

export type CartItem = {
  variantId: string;
  sku: string;
  title: string;
  productName: string;
  price: number;
  quantity: number;
  image: string | null;
  categoryName: string | null;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CatalogItem, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  total: () => number;
  itemCount: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (catalogItem, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.variantId === catalogItem.variant_id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === catalogItem.variant_id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...items,
              {
                variantId: catalogItem.variant_id!,
                sku: catalogItem.sku!,
                title: catalogItem.title!,
                productName: catalogItem.product_name!,
                price: catalogItem.price!,
                quantity,
                image: getImageUrl(catalogItem.sku, catalogItem.design_image),
                categoryName: catalogItem.category_name ?? null,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "keshali-cart" }
  )
);
