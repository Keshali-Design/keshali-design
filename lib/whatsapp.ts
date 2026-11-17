import type { CartItem } from "@/lib/store/cart";
import { formatCOP } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/site";

// "$ 55.000" → "$55.000" (Intl puts a non-breaking space after the sign).
const cop = (n: number) => formatCOP(n).replace(/\s/g, "");

export type WhatsAppOrder = {
  name: string;
  city: string;
  items: CartItem[];
  shippingCost?: number;
  // Extra details only checkout collects; omitted from the message when empty.
  address?: string;
  notes?: string;
};

function itemLine(item: CartItem) {
  const variant = [item.sizeLabel, item.colorName].filter(Boolean).join(" / ");
  const category = [item.categoryName, item.subcategoryName].filter(Boolean).join(": ");
  return [
    `${item.quantity}x ${item.productName}${variant ? ` (${variant})` : ""}`,
    category,
    cop(item.price * item.quantity),
  ]
    .filter(Boolean)
    .join(" — ");
}

export function buildOrderMessage(order: WhatsAppOrder) {
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + (order.shippingCost ?? 0);

  return [
    "🛍️ Pedido KESHALI Design",
    "",
    `👤 Nombre: ${order.name.trim()}`,
    `📍 Ciudad: ${order.city.trim() || "Por confirmar"}`,
    ...(order.address?.trim() ? [`🏠 Dirección: ${order.address.trim()}`] : []),
    "",
    "💰 Precio:",
    ...order.items.map(itemLine),
    "",
    `🧾 Subtotal: ${cop(subtotal)}`,
    `💵 Total: ${cop(total)}`,
    ...(order.notes?.trim() ? ["", `📝 Notas: ${order.notes.trim()}`] : []),
    "",
    "¡Hola! Me gustaría realizar este pedido 🙌",
  ].join("\n");
}

export function buildOrderWhatsAppUrl(order: WhatsAppOrder) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage(order))}`;
}
