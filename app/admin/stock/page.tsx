import { createAdminClient } from "@/lib/supabase/admin";
import { StockManager } from "@/components/admin/StockManager";

export const metadata = { title: "Stock — Admin" };

export type InventoryRow = {
  id: string;
  category_id: string;
  size_id: string;
  color_id: string;
  stock: number;
  categories: { name: string } | null;
  sizes: { label: string; alt_label: string | null } | null;
  colors: { name: string; hex_code: string } | null;
};

export type CategoryOpt = { id: string; name: string };
export type SizeOpt = { id: string; size_type_id: string; label: string; alt_label: string | null };
export type ColorOpt = { id: string; name: string; hex_code: string };

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string }>;
}) {
  const { categoria, buscar } = await searchParams;
  const supabase = createAdminClient();

  const [
    { data: categories },
    { data: allSizes },
    { data: allColors },
    { data: categorySizes },
    { data: categoryColors },
    { data: inventory },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("categories") as any)
      .select("id, name")
      .eq("active", true)
      .is("parent_id", null)
      .order("name") as Promise<{ data: CategoryOpt[] | null }>,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("sizes") as any)
      .select("id, size_type_id, label, alt_label")
      .eq("active", true)
      .order("sort_order") as Promise<{ data: SizeOpt[] | null }>,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("colors") as any)
      .select("id, name, hex_code")
      .eq("active", true)
      .order("name") as Promise<{ data: ColorOpt[] | null }>,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("category_sizes") as any)
      .select("category_id, size_id")
      .eq("active", true) as Promise<{ data: { category_id: string; size_id: string }[] | null }>,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("category_colors") as any)
      .select("category_id, color_id")
      .eq("active", true) as Promise<{ data: { category_id: string; color_id: string }[] | null }>,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("inventory") as any)
      .select("id, category_id, size_id, color_id, stock")
      .order("category_id") as Promise<{ data: { id: string; category_id: string; size_id: string; color_id: string; stock: number }[] | null }>,
  ]);

  return (
    <StockManager
      categories={categories ?? []}
      allSizes={allSizes ?? []}
      allColors={allColors ?? []}
      categorySizes={categorySizes ?? []}
      categoryColors={categoryColors ?? []}
      inventory={inventory ?? []}
      initialCategoria={categoria ?? ""}
      initialBuscar={buscar ?? ""}
    />
  );
}
