import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCOP } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

type ProductRow = {
  id: string;
  name: string;
  active: boolean;
  description: string | null;
  price_varies_by_color: boolean;
  categories: { name: string } | null;
  product_sizes: { price: number }[];
  product_variants: { id: string }[];
};

export default async function AdminProductosPage() {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products } = await (supabase.from("products") as any)
    .select(`
      id, name, active, description, price_varies_by_color,
      categories!category_id ( name ),
      product_sizes ( price ),
      product_variants ( id )
    `)
    .order("active", { ascending: false })
    .order("name") as { data: ProductRow[] | null };

  const minPrice = (sizes: { price: number }[]) =>
    sizes.length ? Math.min(...sizes.map((s) => s.price)) : 0;
  const maxPrice = (sizes: { price: number }[]) =>
    sizes.length ? Math.max(...sizes.map((s) => s.price)) : 0;

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
        Cada producto agrupa variantes por color y tamaño. El stock se gestiona en la sección Stock.
      </p>

      <div className="glass rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-subtle text-muted text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Categoría</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-center px-4 py-3">Variantes</th>
              <th className="text-center px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const min = minPrice(p.product_sizes);
              const max = maxPrice(p.product_sizes);
              const priceLabel = min === max ? formatCOP(min) : `${formatCOP(min)} – ${formatCOP(max)}`;

              return (
                <tr key={p.id} className="border-b border-subtle last:border-0 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[#e8e8e8] font-medium line-clamp-1">{p.name}</p>
                    {p.description && (
                      <p className="text-muted text-xs mt-0.5 line-clamp-1">{p.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs hidden md:table-cell">
                    {p.categories?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gold font-semibold text-xs">
                    {p.product_sizes.length ? priceLabel : "—"}
                    {p.price_varies_by_color && (
                      <span className="text-muted font-normal ml-1 text-[10px]">+color</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted text-xs">
                    {p.product_variants.length}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      p.active
                        ? "border-emerald-500/30 text-emerald-400 bg-emerald-400/10"
                        : "border-muted/20 text-muted bg-white/5"
                    }`}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-muted hover:text-gold transition-colors px-2 py-1.5 rounded hover:bg-white/5"
                      >
                        <Pencil size={12} />
                        Editar
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!products || products.length === 0) && (
          <p className="text-muted text-sm text-center py-10">
            Sin productos. <Link href="/admin/productos/nuevo" className="text-gold hover:underline">Crea el primero.</Link>
          </p>
        )}
      </div>
    </div>
  );
}
