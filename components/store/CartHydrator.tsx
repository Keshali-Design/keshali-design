"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

// Loads the saved cart only after hydration (see `skipHydration` in lib/store/cart.ts).
export function CartHydrator() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  return null;
}
