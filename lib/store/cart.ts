import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  sku: string;
  productName: string;
  colorName: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  image: string | null;
  categoryName: string | null;
  // Optional: carts persisted before this field existed don't have it.
  subcategoryName?: string | null;
};

export type CartContact = { name: string; city: string };

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  // Remembered between the cart drawer and checkout so it's typed once.
  contact: CartContact;
  setContact: (contact: Partial<CartContact>) => void;
  addItem: (item: CartItem) => void;
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
      contact: { name: "", city: "" },
      setContact: (contact) => set({ contact: { ...get().contact, ...contact } }),

      addItem: (newItem) => {
        const { items } = get();
        const existing = items.find((i) => i.variantId === newItem.variantId);

        if (existing) {
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({ items: [...items, newItem], isOpen: true });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) { get().removeItem(variantId); return; }
        set({ items: get().items.map((i) => i.variantId === variantId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "keshali-cart",
      // Rehydrated after mount by <CartHydrator />: the server renders an empty
      // cart, so reading localStorage during the first client render made the
      // header badge mismatch and React threw away the whole hydrated tree.
      skipHydration: true,
      // Never persist the open/closed flag: a reload shouldn't pop the drawer open.
      partialize: (state) => ({ items: state.items, contact: state.contact }),
      // Older saved carts have no `contact`; keep the default instead of undefined.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<CartStore>;
        return { ...current, ...saved, contact: { ...current.contact, ...saved.contact } };
      },
    }
  )
);
