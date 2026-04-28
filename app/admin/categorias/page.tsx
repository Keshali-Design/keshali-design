import { createAdminClient } from "@/lib/supabase/admin";
import { CategoriasManager } from "@/components/admin/CategoriasManager";

export const metadata = { title: "Categorías — Admin" };

export default async function CategoriasPage() {
  const supabase = createAdminClient();

  // Load all categories (main + sub) with parent info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase.from("categories") as any)
    .select("id, name, slug, active, size_type_id, parent_id, size_types ( name, unit_label )")
    .order("name") as { data: Category[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sizeTypes } = await (supabase.from("size_types") as any)
    .select("id, name, unit_label")
    .eq("active", true)
    .order("name") as { data: SizeTypeOption[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allColors } = await (supabase.from("colors") as any)
    .select("id, name, hex_code, color_code")
    .eq("active", true)
    .order("name") as { data: ColorOption[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allSizes } = await (supabase.from("sizes") as any)
    .select("id, size_type_id, label, alt_label, sort_order")
    .eq("active", true)
    .order("sort_order") as { data: SizeOption[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categoryColors } = await (supabase.from("category_colors") as any)
    .select("id, category_id, color_id, active") as { data: CategoryColor[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categorySizes } = await (supabase.from("category_sizes") as any)
    .select("id, category_id, size_id, active") as { data: CategorySize[] | null };

  const allCats = categories ?? [];
  const mainCategories = allCats.filter((c) => !c.parent_id);
  const subcategories = allCats.filter((c) => !!c.parent_id);

  return (
    <CategoriasManager
      mainCategories={mainCategories}
      subcategories={subcategories}
      sizeTypes={sizeTypes ?? []}
      allColors={allColors ?? []}
      allSizes={allSizes ?? []}
      categoryColors={categoryColors ?? []}
      categorySizes={categorySizes ?? []}
    />
  );
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  size_type_id: string | null;
  parent_id: string | null;
  size_types: { name: string; unit_label: string } | null;
};
export type SizeTypeOption = { id: string; name: string; unit_label: string };
export type ColorOption = { id: string; name: string; hex_code: string; color_code: string };
export type SizeOption = { id: string; size_type_id: string; label: string; alt_label: string | null; sort_order: number };
export type CategoryColor = { id: string; category_id: string; color_id: string; active: boolean };
export type CategorySize = { id: string; category_id: string; size_id: string; active: boolean };
