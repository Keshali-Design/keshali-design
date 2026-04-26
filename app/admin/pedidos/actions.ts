"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";

export async function updateOrderStatus(
  orderId: string,
  status: string,
  shipping?: { trackingCode: string; shippingCompany: string }
) {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (shipping && status === "shipped") {
    updateData.tracking_code = shipping.trackingCode || null;
    updateData.shipping_company = shipping.shippingCompany || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("orders") as any)
    .update(updateData)
    .eq("id", orderId);

  if (error) return { error: error.message };

  // Fetch order for email
  if (status === "shipped" || status === "delivered") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (supabase.from("orders") as any)
      .select("order_number, customer_name, customer_email, tracking_code, shipping_company")
      .eq("id", orderId)
      .single();

    if (order) {
      if (status === "shipped") {
        await sendOrderShippedEmail({
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          trackingCode: shipping?.trackingCode || order.tracking_code || null,
          shippingCompany: shipping?.shippingCompany || order.shipping_company || null,
        }).catch(console.error);
      } else if (status === "delivered") {
        await sendOrderDeliveredEmail({
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
        }).catch(console.error);
      }
    }
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return { error: null };
}
