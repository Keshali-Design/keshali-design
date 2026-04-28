import { createAdminClient } from "@/lib/supabase/admin";
import { formatCOP } from "@/lib/utils";
import type { Order } from "@/lib/supabase/types";

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

  const stats = [
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
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-8">Resumen de tu tienda</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`glass rounded-card p-5 ${s.alert ? "border border-yellow-500/30" : ""}`}
          >
            <p className="text-muted text-xs mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.alert ? "text-yellow-400" : "text-gold"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="glass rounded-card p-5">
          <h2 className="text-[#e8e8e8] font-semibold mb-4 text-sm">
            Últimos pedidos
          </h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-subtle last:border-0"
                >
                  <div>
                    <p className="text-[#e8e8e8] font-medium">
                      #{order.order_number}
                    </p>
                    <p className="text-muted text-xs">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gold font-semibold">
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

        {/* Low stock */}
        <div className="glass rounded-card p-5">
          <h2 className="text-[#e8e8e8] font-semibold mb-4 text-sm">
            Stock bajo (&le;5 uds.)
          </h2>
          {lowStock && lowStock.length > 0 ? (
            <div className="flex flex-col gap-2">
              {lowStock.map((inv, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm py-2 border-b border-subtle last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {inv.colors?.hex_code && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ background: inv.colors.hex_code }}
                      />
                    )}
                    <p className="text-[#e8e8e8] text-xs leading-snug truncate">
                      {inv.categories?.name} · {inv.sizes?.label} · {inv.colors?.name}
                    </p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ml-2 ${inv.stock === 0 ? "text-red-400" : "text-yellow-400"}`}>
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "text-yellow-400",
    confirmed: "text-blue-400",
    shipped: "text-purple-400",
    delivered: "text-emerald-400",
    cancelled: "text-red-400",
  };
  return (
    <span className={`text-xs capitalize ${map[status] ?? "text-muted"}`}>
      {status}
    </span>
  );
}
