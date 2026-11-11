"use client";

import { useEffect } from "react";
import { trackProductView } from "@/app/producto/[sku]/actions";

// Counts one view per product per browser session (refreshes don't inflate it).
export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    const key = `kd-viewed:${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked (private mode) — still count the view
    }
    trackProductView(productId).catch(() => {});
  }, [productId]);

  return null;
}
