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

  // Find the order by reference (= order_number)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderError } = await (supabase.from("orders") as any)
    .select(`
      id, order_number, customer_name, customer_email, customer_phone,
      subtotal, shipping_cost, total, status, shipping_address,
      order_items (
        id, quantity, unit_price, total_price,
        product_variants ( id, sku, title, stock )
      )
    `)
    .eq("order_number", tx.reference)
    .single();

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

  // On approval: decrement stock + send emails
  if (tx.status === "APPROVED") {
    type OrderItemWithVariant = {
      id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      product_variants: { id: string; sku: string; title: string; stock: number } | null;
    };

    const items: OrderItemWithVariant[] = order.order_items ?? [];

    // Decrement stock for each variant
    for (const item of items) {
      if (!item.product_variants) continue;
      const newStock = Math.max(0, item.product_variants.stock - item.quantity);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("product_variants") as any)
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", item.product_variants.id);
    }

    // Build email data
    const shippingAddr = order.shipping_address as { city?: string; address?: string } | null;
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
      items: items.map((item) => ({
        title: item.product_variants?.title ?? "Producto",
        sku: item.product_variants?.sku ?? "",
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      })),
    };

    // Send emails in parallel (non-blocking failures)
    await Promise.allSettled([
      sendNewOrderNotification(emailData),
      sendOrderConfirmationToCustomer(emailData),
    ]);
  }

  return NextResponse.json({ ok: true });
}
