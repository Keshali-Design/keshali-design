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
        <h1 className="text-2xl font-bold text-ink">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-gold flex items-center gap-2 text-sm py-2 px-4">
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>
      <p className="text-body text-sm mb-8">
        Cada producto agrupa variantes por color y tamaño. El stock se gestiona en la sección Stock.
      </p>

      <div className="bg-surface border border-subtle overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-subtle">
              <th className="text-left px-4 py-3 label-sm">Producto</th>
              <th className="text-left px-4 py-3 hidden md:table-cell label-sm">Categoría</th>
              <th className="text-right px-4 py-3 label-sm">Precio</th>
              <th className="text-center px-4 py-3 label-sm">Variantes</th>
              <th className="text-center px-4 py-3 label-sm">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => {
              const min = minPrice(p.product_sizes);
              const max = maxPrice(p.product_sizes);
              const priceLabel = min === max ? formatCOP(min) : `${formatCOP(min)} – ${formatCOP(max)}`;

              return (
                <tr key={p.id} className="border-b border-subtle2 last:border-0 hover:bg-bg transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-ink font-medium line-clamp-1">{p.name}</p>
                    {p.description && (
                      <p className="text-body text-xs mt-0.5 line-clamp-1">{p.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-body text-xs hidden md:table-cell">
                    {p.categories?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gold-700 font-bold text-xs">
                    {p.product_sizes.length ? priceLabel : "—"}
                    {p.price_varies_by_color && (
                      <span className="text-muted font-normal ml-1 text-[10px]">+color</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-body text-xs">
                    {p.product_variants.length}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 border ${
                      p.active
                        ? "border-emerald-600/30 text-emerald-700 bg-emerald-50"
                        : "border-subtle text-muted bg-bg"
                    }`}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-body hover:text-gold-700 transition-colors px-2 py-1.5 border border-subtle bg-bg"
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
            Sin productos. <Link href="/admin/productos/nuevo" className="text-gold-700 hover:underline">Crea el primero.</Link>
          </p>
        )}
      </div>
    </div>
  );
}
