import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWompiWebhook, type WompiWebhookBody } from "@/lib/wompi";
import { sendNewOrderNotification, sendOrderConfirmationToCustomer } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: WompiWebhookBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[wompi webhook] body:", JSON.stringify(body, null, 2));

  // Validate signature
  if (!verifyWompiWebhook(body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (body.event !== "transaction.updated") {
    return NextResponse.json({ ok: true });
  }

  const tx = body.data.transaction;
  const supabase = createAdminClient();

  type OrderItemRow = {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_variants: {
      id: string;
      sku: string;
      size_id: string;
      color_id: string;
      products: { name: string; category_id: string } | null;
      sizes: { label: string } | null;
      colors: { name: string } | null;
    } | null;
  };

  // Find the order by reference (= order_number)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from("orders") as any)
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, total, status, shipping_address,
      order_items (
        id, quantity, unit_price, total_price,
        product_variants (
          id, sku, size_id, color_id,
          products ( name, category_id ),
          sizes ( label ),
          colors ( name )
        )
      )
    `)
    .eq("order_number", tx.reference)
    .single() as { data: { id: string; order_number: string; customer_name: string; customer_email: string; customer_phone: string | null; subtotal: number; shipping_cost: number; total: number; status: string; shipping_address: { city?: string; address?: string } | null; order_items: OrderItemRow[] } | null; error: unknown };

  if (orderError || !order) {
    console.error("Order not found for reference:", tx.reference);
    return NextResponse.json({ ok: true });
  }

  // Map Wompi status → our status
  const statusMap: Record<string, string> = {
    APPROVED: "confirmed",
    DECLINED: "cancelled",
    VOIDED: "cancelled",
    ERROR: "cancelled",
    PENDING: "pending",
  };

  const newStatus = statusMap[tx.status] ?? "pending";

  // Skip if status hasn't changed
  if (order.status === newStatus) {
    return NextResponse.json({ ok: true });
  }

  // Update order status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("orders") as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", order.id);

  // On approval: send emails (stock was already decremented at checkout time)
  if (tx.status === "APPROVED") {
    const items: OrderItemRow[] = order.order_items ?? [];

    // Build email data — construct variant title from product + size + color
    const shippingAddr = order.shipping_address;
    const emailData = {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      city: shippingAddr?.city ?? "",
      address: shippingAddr?.address ?? "",
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      total: order.total,
      items: items.map((item) => {
        const pv = item.product_variants;
        const title = pv
          ? [pv.products?.name, pv.sizes?.label, pv.colors?.name].filter(Boolean).join(" · ")
          : "Producto";
        return {
          title,
          sku: pv?.sku ?? "",
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        };
      }),
    };

    // Send emails in parallel (non-blocking failures)
    await Promise.allSettled([
      sendNewOrderNotification(emailData),
      sendOrderConfirmationToCustomer(emailData),
    ]);
  }

  return NextResponse.json({ ok: true });
}
