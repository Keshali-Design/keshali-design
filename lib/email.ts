import { Resend } from "resend";
import { formatCOP } from "./utils";

const FROM = "Keshali Design <pedidos@keshalidesign.com>";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  city: string;
  address: string;
  items: Array<{
    title: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
};

function orderEmailHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a1b;color:#e8e8e8;font-size:13px;">
          ${item.title}<br/>
          <span style="color:#9a9a9a;font-size:11px;font-family:monospace;">${item.sku}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a1b;color:#9a9a9a;font-size:13px;text-align:center;">
          x${item.quantity}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #1a1a1b;color:#caa45a;font-size:13px;text-align:right;white-space:nowrap;">
          ${formatCOP(item.totalPrice)}
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0f0f10;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="margin:0;font-size:22px;color:#caa45a;letter-spacing:2px;">KESHALI DESIGN</h1>
      <p style="margin:4px 0 0;color:#9a9a9a;font-size:13px;">Nuevo pedido recibido</p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:16px;">
      <p style="margin:0 0 4px;color:#9a9a9a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Pedido</p>
      <p style="margin:0;color:#caa45a;font-size:20px;font-weight:700;">${data.orderNumber}</p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:16px;">
      <p style="margin:0 0 12px;color:#9a9a9a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Cliente</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="color:#9a9a9a;font-size:12px;padding:2px 0;width:90px;">Nombre</td><td style="color:#e8e8e8;font-size:13px;">${data.customerName}</td></tr>
        <tr><td style="color:#9a9a9a;font-size:12px;padding:2px 0;">Email</td><td style="color:#e8e8e8;font-size:13px;">${data.customerEmail}</td></tr>
        ${data.customerPhone ? `<tr><td style="color:#9a9a9a;font-size:12px;padding:2px 0;">Teléfono</td><td style="color:#e8e8e8;font-size:13px;">${data.customerPhone}</td></tr>` : ""}
        <tr><td style="color:#9a9a9a;font-size:12px;padding:2px 0;">Ciudad</td><td style="color:#e8e8e8;font-size:13px;">${data.city}</td></tr>
        <tr><td style="color:#9a9a9a;font-size:12px;padding:2px 0;">Dirección</td><td style="color:#e8e8e8;font-size:13px;">${data.address}</td></tr>
      </table>
    </div>

    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:16px;">
      <p style="margin:0 0 12px;color:#9a9a9a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Productos</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
            <th style="text-align:left;padding:6px 12px;color:#9a9a9a;font-size:11px;font-weight:500;">Producto</th>
            <th style="text-align:center;padding:6px 12px;color:#9a9a9a;font-size:11px;font-weight:500;">Cant.</th>
            <th style="text-align:right;padding:6px 12px;color:#9a9a9a;font-size:11px;font-weight:500;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="border-top:1px solid rgba(202,164,90,0.2);margin-top:12px;padding-top:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#9a9a9a;font-size:12px;">Subtotal</span>
          <span style="color:#e8e8e8;font-size:12px;">${formatCOP(data.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#9a9a9a;font-size:12px;">Envío</span>
          <span style="color:#e8e8e8;font-size:12px;">${data.shippingCost > 0 ? formatCOP(data.shippingCost) : "Por coordinar"}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#e8e8e8;font-size:15px;font-weight:700;">Total</span>
          <span style="color:#caa45a;font-size:18px;font-weight:700;">${formatCOP(data.total)}</span>
        </div>
      </div>
    </div>

    <div style="text-align:center;padding:16px;">
      <p style="color:#9a9a9a;font-size:12px;margin:0;">© ${new Date().getFullYear()} Keshali Design</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendNewOrderNotification(data: OrderEmailData) {
  const ownerEmail = process.env.OWNER_EMAIL ?? "";
  if (!ownerEmail) {
    console.warn("OWNER_EMAIL no configurado — omitiendo email de notificación");
    return;
  }

  await getResend().emails.send({
    from: FROM,
    to: ownerEmail,
    subject: `🛍️ Nuevo pedido ${data.orderNumber} — ${formatCOP(data.total)}`,
    html: orderEmailHtml(data),
  });
}

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  await getResend().emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `Tu pedido ${data.orderNumber} está confirmado ✨`,
    html: orderEmailHtml({ ...data }),
  });
}
