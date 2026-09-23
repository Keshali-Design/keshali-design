"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildWompiUrl } from "@/lib/wompi";

const SHIPPING_COST = 0; // Por coordinar con el cliente

export type CheckoutItem = {
  variantId: string;
  sku: string;
  title: string;
  quantity: number;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  notes: string;
  items: CheckoutItem[];
};

type CatalogRow = {
  variant_id: string;
  price: number;
  stock: number;
  variant_active: boolean;
  product_active: boolean;
  category_active: boolean;
};

export async function createOrder(
  input: CheckoutInput
): Promise<{ error: string | null; wompiUrl: string | null; orderNumber: string | null }> {
  if (input.items.length === 0) {
    return { error: "Tu carrito está vacío.", wompiUrl: null, orderNumber: null };
  }

  const supabase = createAdminClient();

  // 1. Look up authoritative price + stock for every item. Never trust
  //    price/subtotal/total sent by the client — a "server action" is still
  //    just a POST endpoint, so those values can be tampered with.
  const variantIds = input.items.map((item) => item.variantId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error: catalogError } = await (supabase.from("catalog_view") as any)
    .select("variant_id, price, stock, variant_active, product_active, category_active")
    .in("variant_id", variantIds) as { data: CatalogRow[] | null; error: unknown };

  if (catalogError || !rows) {
    return { error: "Error verificando los productos.", wompiUrl: null, orderNumber: null };
  }

  const catalogByVariant = new Map(rows.map((row) => [row.variant_id, row]));

  for (const item of input.items) {
    const row = catalogByVariant.get(item.variantId);
    if (!row || !row.variant_active || !row.product_active || !row.category_active) {
      return { error: `"${item.title}" ya no está disponible.`, wompiUrl: null, orderNumber: null };
    }
    if (row.stock < item.quantity) {
      return { error: `No hay stock suficiente de "${item.title}".`, wompiUrl: null, orderNumber: null };
    }
  }

  const subtotal = input.items.reduce(
    (sum, item) => sum + catalogByVariant.get(item.variantId)!.price * item.quantity,
    0
  );
  const shippingCost = SHIPPING_COST;
  const total = subtotal + shippingCost;

  const orderNumber = `KD-${Date.now()}`;

  // 2. Create order (with server-computed totals)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from("orders") as any)
    .insert({
      order_number: orderNumber,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone || null,
      shipping_address: {
        city: input.city,
        address: input.address,
      },
      subtotal,
      shipping_cost: shippingCost,
      total,
      status: "pending",
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (orderError) {
    return { error: `Error creando pedido: ${orderError.message}`, wompiUrl: null, orderNumber: null };
  }

  // 3. Create order items (with server-computed unit prices)
  const orderItems = input.items.map((item) => {
    const price = catalogByVariant.get(item.variantId)!.price;
    return {
      order_id: order.id,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: price,
      total_price: price * item.quantity,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase.from("order_items") as any).insert(orderItems);

  if (itemsError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("orders") as any).delete().eq("id", order.id);
    return { error: `Error guardando productos: ${itemsError.message}`, wompiUrl: null, orderNumber: null };
  }

  // Inventory is intentionally NOT decremented here — the order isn't paid
  // yet. It's decremented in the Wompi webhook once the transaction is
  // APPROVED, so abandoned/declined checkouts never touch stock.

  // 4. Build Wompi redirect URL
  // Wompi expects amount in centavos (COP pesos × 100)
  const amountInCents = total * 100;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const wompiUrl = buildWompiUrl({
    reference: orderNumber,
    amountInCents,
    redirectUrl: `${baseUrl}/checkout/resultado`,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
  });

  return { error: null, wompiUrl, orderNumber };
}
