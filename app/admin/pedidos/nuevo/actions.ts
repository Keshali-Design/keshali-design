"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ManualOrderItem = {
  variantId: string;
  quantity: number;
  unitPrice: number;
};

export type ManualOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  notes: string;
  items: ManualOrderItem[];
  shippingCost: number;
  status: string;
};

export async function createManualOrder(input: ManualOrderInput) {
  const supabase = createAdminClient();

  const subtotal = input.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const total = subtotal + input.shippingCost;
  const orderNumber = `KD-${Date.now()}`;

  // 1. Create order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from("orders") as any)
    .insert({
      order_number: orderNumber,
      customer_name: input.customerName,
      customer_email: input.customerEmail || null,
      customer_phone: input.customerPhone || null,
      shipping_address: { city: input.city, address: input.address },
      subtotal,
      shipping_cost: input.shippingCost,
      total,
      status: input.status,
      notes: input.notes || null,
    })
    .select("id")
    .single();

  if (orderError) {
    return { error: `Error creando pedido: ${orderError.message}` };
  }

  // 2. Create order items
  if (input.items.length > 0) {
    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await (supabase.from("order_items") as any).insert(orderItems);
    if (itemsError) {
      return { error: `Error guardando productos: ${itemsError.message}` };
    }
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  redirect("/admin/pedidos");
}
