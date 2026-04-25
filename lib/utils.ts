import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public`;

/**
 * Builds a full Supabase Storage URL from a relative path or returns null.
 * Priority: SKU-based file (matches actual storage filenames) → design_image path fallback.
 */
export function getImageUrl(
  sku: string | null,
  designImage?: string | null
): string | null {
  if (sku) return `${STORAGE_BASE}/product-images/${sku}.png`;
  if (designImage) {
    // designImage is like "/product-images/taza1.png" — prefix with storage base
    return `${STORAGE_BASE}${designImage}`;
  }
  return null;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStockLabel(stock: number | null): {
  label: string;
  color: string;
} {
  if (!stock || stock === 0)
    return { label: "Agotado", color: "text-red-400" };
  if (stock <= 5)
    return { label: "Pocas unidades", color: "text-yellow-400" };
  return { label: "Disponible", color: "text-emerald-400" };
}

export function buildWhatsAppUrl(
  phone: string,
  items: { title: string; quantity: number; price: number }[]
): string {
  const lines = items.map(
    (i) => `• ${i.title} x${i.quantity} — ${formatCOP(i.price * i.quantity)}`
  );
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const message = [
    "¡Hola! Quiero hacer un pedido:",
    "",
    ...lines,
    "",
    `*Total: ${formatCOP(total)}*`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
