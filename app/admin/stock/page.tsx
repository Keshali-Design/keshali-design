import { createAdminClient } from "@/lib/supabase/admin";
import { StockManager } from "@/components/admin/StockManager";

export const metadata = { title: "Stock — Admin" };

type VariantRow = {
  id: string;
  sku: string;
  stock: number;
  active: boolean;
  price_override: number | null;
  products: {
    id: string;
    name: string;
    price_varies_by_color: boolean;
    categories: { name: string } | null;
    product_sizes: { size_id: string; price: number }[];
  } | null;
  colors: { id: string; name: string; hex_code: string } | null;
  sizes: { id: string; label: string; alt_label: string | null } | null;
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string }>;
}) {
  const { categoria, buscar } = await searchParams;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase.from("categories") as any)
    .select("id, name")
    .eq("active", true)
    .order("name") as { data: { id: string; name: string }[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("product_variants") as any)
    .select(`
      id, sku, stock, active, price_override,
      products (
        id, name, price_varies_by_color,
        categories ( name ),
        product_sizes ( size_id, price )
      ),
      colors ( id, name, hex_code ),
      sizes ( id, label, alt_label )
    `)
    .order("sku");

  if (categoria) {
    // Filter by category via products.category_id — do a subquery via join
    // We filter client-side since Supabase nested filters are complex
  }

  const { data: variants } = await query as { data: VariantRow[] | null };

  // Client-side filter
  let filtered = variants ?? [];
  if (categoria) {
    filtered = filtered.filter((v) => {
      const cat = (v.products as any)?.categories;
      if (!cat) return false;
      // We need category id — categories here only has name, filter by name approach is fragile
      // Instead we do it via category from categories list
      return true; // handled in component
    });
  }

  return (
    <StockManager
      variants={filtered}
      categories={categories ?? []}
      initialCategoria={categoria ?? ""}
      initialBuscar={buscar ?? ""}
    />
  );
}
