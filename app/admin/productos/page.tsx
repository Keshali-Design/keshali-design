import Link from "next/link";
import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCOP } from "@/lib/utils";
import { EditVariantForm } from "@/components/admin/EditVariantForm";

type VariantRow = {
  id: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
  active: boolean;
  products: {
    name: string;
    model_code: string;
    categories: { name: string } | null;
  } | null;
};

export default async function AdminProductosPage() {
  const supabase = createAdminClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select(
      "id, sku, title, price, stock, active, products ( name, model_code, categories ( name ) )"
    )
    .order("active", { ascending: false })
    .order("title")
    .returns<VariantRow[]>();

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#e8e8e8]">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-gold flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>
      <p className="text-muted text-sm mb-8">
        Gestiona stock y precios de variantes
      </p>

      <div className="glass rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle text-muted text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">SKU</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {variants?.map((v) => (
              <tr
                key={v.id}
                className="border-b border-subtle last:border-0 hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-[#e8e8e8] font-medium line-clamp-1">
                    {v.title}
                  </p>
                  <p className="text-muted text-xs mt-0.5">
                    {v.products?.categories?.name} · {v.products?.name}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted font-mono text-xs hidden md:table-cell">
                  {v.sku}
                </td>
                <td className="px-4 py-3 text-right text-gold font-semibold">
                  {formatCOP(v.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      v.stock === 0
                        ? "text-red-400"
                        : v.stock <= 5
                          ? "text-yellow-400"
                          : "text-emerald-400"
                    }
                  >
                    {v.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      v.active
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10"
                        : "border-muted/20 text-muted bg-white/5"
                    }`}
                  >
                    {v.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <EditVariantForm
                    id={v.id}
                    price={v.price}
                    stock={v.stock}
                    active={v.active}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!variants || variants.length === 0) && (
          <p className="text-muted text-sm text-center py-10">
            No hay variantes. Agrega productos desde Supabase.
          </p>
        )}
      </div>
    </div>
  );
}
