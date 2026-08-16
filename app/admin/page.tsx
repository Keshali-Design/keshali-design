import { createAdminClient } from "@/lib/supabase/admin";
import { formatCOP } from "@/lib/utils";
import type { Order } from "@/lib/supabase/types";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const { count: variantCount } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .eq("active", true);

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentOrders } = await (supabase.from("orders") as any)
    .select("id, order_number, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5) as { data: Pick<Order, "id" | "order_number" | "customer_name" | "total" | "status" | "created_at">[] | null };

  // Low-stock entries from shared inventory table (category+size+color combos)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lowStock } = await (supabase.from("inventory") as any)
    .select(`
      stock,
      categories ( name ),
      sizes ( label ),
      colors ( name, hex_code )
    `)
    .lte("stock", 5)
    .order("stock")
    .limit(8) as {
      data: {
        stock: number;
        categories: { name: string } | null;
        sizes: { label: string } | null;
        colors: { name: string; hex_code: string } | null;
      }[] | null;
    };

  // ── KPIs: sales this month, active orders, average ticket ─────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: monthOrders } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", startOfMonth)
    .neq("status", "cancelled") as { data: { total: number }[] | null };

  const ventasDelMes = (monthOrders ?? []).reduce((sum, o) => sum + o.total, 0);
  const pedidosDelMes = monthOrders?.length ?? 0;
  const ticketPromedio = pedidosDelMes > 0 ? ventasDelMes / pedidosDelMes : 0;

  const { count: pedidosActivos } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .not("status", "in", "(delivered,cancelled)");

  // ── Weekly sales bar chart (last 7 days) ───────────────────────
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: weekOrders } = await supabase
    .from("orders")
    .select("total, created_at")
    .gte("created_at", sevenDaysAgo.toISOString())
    .neq("status", "cancelled") as { data: { total: number; created_at: string }[] | null };

  const dayBuckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    return { date: d, label: DAY_LABELS[d.getDay()], total: 0 };
  });

  for (const o of weekOrders ?? []) {
    const od = new Date(o.created_at);
    const bucket = dayBuckets.find((b) => b.date.toDateString() === od.toDateString());
    if (bucket) bucket.total += o.total;
  }

  const maxBar = Math.max(...dayBuckets.map((b) => b.total), 1);
  const todayStr = now.toDateString();

  const stats = [
    { label: "Ventas del mes", value: formatCOP(ventasDelMes), note: `${pedidosDelMes} pedidos` },
    { label: "Pedidos activos", value: pedidosActivos ?? 0 },
    { label: "Ticket promedio", value: pedidosDelMes > 0 ? formatCOP(ticketPromedio) : "—" },
    { label: "Variantes activas", value: variantCount ?? 0 },
    { label: "Pedidos totales", value: orderCount ?? 0 },
    {
      label: "Stock crítico",
      value: lowStock?.length ?? 0,
      alert: (lowStock?.length ?? 0) > 0,
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="eyebrow mb-1">Panel</h1>
      <p className="text-2xl font-bold text-ink mb-1">Dashboard</p>
      <p className="text-body text-sm mb-8">Resumen de tu tienda</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-surface border p-5 ${s.alert ? "border-gold" : "border-subtle"}`}
          >
            <p className="label-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.alert ? "text-gold-700" : "text-gold"}`}>
              {s.value}
            </p>
            {"note" in s && s.note && (
              <p className="text-muted text-xs mt-0.5">{s.note}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="bg-surface border border-subtle p-5 md:col-span-2">
          <h2 className="section-title text-sm mb-4">
            Últimos pedidos
          </h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-subtle2 last:border-0"
                >
                  <div>
                    <p className="text-ink font-medium">
                      #{order.order_number}
                    </p>
                    <p className="text-muted text-xs">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold-700 font-semibold">
                      {formatCOP(order.total)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No hay pedidos aún.</p>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Weekly sales bar chart */}
          <div className="bg-surface border border-subtle p-5">
            <h2 className="section-title text-sm mb-4">Ventas por semana</h2>
            <div className="flex items-end gap-2 h-28">
              {dayBuckets.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                  <div
                    className={`w-full ${b.date.toDateString() === todayStr ? "bg-gold" : "bg-gold-200"}`}
                    style={{ height: `${Math.max((b.total / maxBar) * 100, 2)}%` }}
                    title={formatCOP(b.total)}
                  />
                  <span className="text-[10px] text-muted">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock */}
          <div className="bg-surface border border-subtle p-5">
            <h2 className="section-title text-sm mb-4">
              Stock bajo (&le;5 uds.)
            </h2>
            {lowStock && lowStock.length > 0 ? (
              <div className="flex flex-col gap-2">
                {lowStock.map((inv, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm py-2 border-b border-subtle2 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {inv.colors?.hex_code && (
                        <span
                          className="w-2.5 h-2.5 border border-subtle flex-shrink-0"
                          style={{ background: inv.colors.hex_code }}
                        />
                      )}
                      <p className="text-ink text-xs leading-snug truncate">
                        {inv.categories?.name} · {inv.sizes?.label} · {inv.colors?.name}
                      </p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ml-2 ${inv.stock === 0 ? "text-red-600" : "text-gold-700"}`}>
                      {inv.stock} uds.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">Todo el stock está bien.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "text-yellow-600",
    confirmed: "text-blue-600",
    shipped: "text-purple-600",
    delivered: "text-emerald-600",
    cancelled: "text-red-600",
  };
  return (
    <span className={`text-xs capitalize ${map[status] ?? "text-muted"}`}>
      {status}
    </span>
  );
}
