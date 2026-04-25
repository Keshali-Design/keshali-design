"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { buildWompiUrl } from "@/lib/wompi";

export type CheckoutItem = {
  variantId: string;
  sku: string;
  title: string;
  quantity: number;
  price: number;
};

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  notes: string;
  items: CheckoutItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
};

export async function createOrder(
  input: CheckoutInput
): Promise<{ error: string | null; wompiUrl: string | null; orderNumber: string | null }> {
  const supabase = createAdminClient();

  const orderNumber = `KD-${Date.now()}`;

  // 1. Create order
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
      subtotal: input.subtotal,
      shipping_cost: input.shippingCost,
      total: input.total,
      status: "pending",
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (orderError) {
    return { error: `Error creando pedido: ${orderError.message}`, wompiUrl: null, orderNumber: null };
  }

  // 2. Create order items
  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    variant_id: item.variantId,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase.from("order_items") as any).insert(orderItems);

  if (itemsError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("orders") as any).delete().eq("id", order.id);
    return { error: `Error guardando productos: ${itemsError.message}`, wompiUrl: null, orderNumber: null };
  }

  // 3. Build Wompi redirect URL
  // Wompi expects amount in centavos (COP pesos × 100)
  const amountInCents = input.total * 100;
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
