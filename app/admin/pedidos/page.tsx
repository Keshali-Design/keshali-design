import { createAdminClient } from "@/lib/supabase/admin";
import { formatCOP } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import type { Order } from "@/lib/supabase/types";

type OrderWithItems = Order & {
  tracking_code?: string | null;
  shipping_company?: string | null;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_variants: { sku: string; title: string } | null;
  }>;
};

export default async function AdminPedidosPage() {
  const supabase = createAdminClient();

  const [{ data: orders }, { data: companiesRaw }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
        id, order_number, customer_name, customer_email, customer_phone,
        subtotal, shipping_cost, total, status, notes, created_at, updated_at,
        tracking_code, shipping_company,
        order_items ( id, quantity, unit_price, total_price,
          product_variants ( sku, title )
        )
      `
      )
      .order("created_at", { ascending: false })
      .returns<OrderWithItems[]>(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("orders") as any)
      .select("shipping_company")
      .not("shipping_company", "is", null),
  ]);

  // Unique non-empty companies, sorted alphabetically
  const knownCompanies = [
    ...new Set(
      (companiesRaw ?? [])
        .map((r: { shipping_company: string }) => r.shipping_company)
        .filter(Boolean)
    ),
  ].sort() as string[];

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Pedidos</h1>
      <p className="text-muted text-sm mb-8">
        {orders?.length ?? 0} pedido{(orders?.length ?? 0) !== 1 ? "s" : ""} en
        total
      </p>

      <div className="flex flex-col gap-4">
        {orders?.map((order) => (
          <div key={order.id} className="glass rounded-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[#e8e8e8] font-bold">
                  #{order.order_number}
                </p>
                <p className="text-muted text-xs mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gold font-bold text-lg">
                  {formatCOP(order.total)}
                </span>
                <OrderStatusSelect
                  orderId={order.id}
                  currentStatus={order.status}
                  currentTrackingCode={order.tracking_code}
                  currentShippingCompany={order.shipping_company}
                  knownCompanies={knownCompanies}
                />
              </div>
            </div>

            {/* Customer */}
            <div className="flex flex-wrap gap-4 text-sm mb-3 pb-3 border-b border-subtle">
              <div>
                <p className="text-muted text-xs">Cliente</p>
                <p className="text-[#e8e8e8]">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Email</p>
                <p className="text-[#e8e8e8]">{order.customer_email}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-muted text-xs">Teléfono</p>
                  <a
                    href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    {order.customer_phone}
                  </a>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1.5">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <p className="text-[#e8e8e8] text-xs leading-snug">
                    <span className="text-muted mr-1">x{item.quantity}</span>
                    {item.product_variants?.title ?? "Producto eliminado"}
                  </p>
                  <span className="text-muted text-xs">
                    {formatCOP(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {(order.shipping_company || order.tracking_code) && (
              <div className="mt-3 border-t border-subtle pt-3 flex gap-4 text-xs">
                {order.shipping_company && (
                  <div>
                    <p className="text-muted">Transportadora</p>
                    <p className="text-[#e8e8e8]">{order.shipping_company}</p>
                  </div>
                )}
                {order.tracking_code && (
                  <div>
                    <p className="text-muted">Rastreo</p>
                    <p className="text-gold font-mono">{order.tracking_code}</p>
                  </div>
                )}
              </div>
            )}

            {order.notes && (
              <p className="mt-3 text-xs text-muted border-t border-subtle pt-3">
                <span className="text-[#e8e8e8]">Nota: </span>
                {order.notes}
              </p>
            )}
          </div>
        ))}

        {(!orders || orders.length === 0) && (
          <div className="glass rounded-card p-10 text-center text-muted text-sm">
            No hay pedidos aún.
          </div>
        )}
      </div>
    </div>
  );
}
