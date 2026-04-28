import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoProductoForm } from "@/components/admin/NuevoProductoForm";

export const metadata = { title: "Nuevo producto — Admin" };

export default async function NuevoProductoPage() {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase.from("categories") as any)
    .select("id, name, size_type_id, size_types ( name, unit_label )")
    .eq("active", true)
    .order("name") as { data: CategoryOpt[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allColors } = await (supabase.from("colors") as any)
    .select("id, name, hex_code, color_code")
    .eq("active", true)
    .order("name") as { data: ColorOpt[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allSizes } = await (supabase.from("sizes") as any)
    .select("id, size_type_id, label, alt_label, sort_order")
    .eq("active", true)
    .order("sort_order") as { data: SizeOpt[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categoryColors } = await (supabase.from("category_colors") as any)
    .select("category_id, color_id, active") as { data: { category_id: string; color_id: string; active: boolean }[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categorySizes } = await (supabase.from("category_sizes") as any)
    .select("category_id, size_id, active") as { data: { category_id: string; size_id: string; active: boolean }[] | null };

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-6"
      >
        <ChevronLeft size={16} />
        Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Nuevo producto</h1>
      <p className="text-muted text-sm mb-8">
        Las variantes (color × tamaño) se generan automáticamente.
      </p>

      <NuevoProductoForm
        categories={categories ?? []}
        allColors={allColors ?? []}
        allSizes={allSizes ?? []}
        categoryColors={categoryColors ?? []}
        categorySizes={categorySizes ?? []}
      />
    </div>
  );
}

export type CategoryOpt = {
  id: string;
  name: string;
  size_type_id: string | null;
  size_types: { name: string; unit_label: string } | null;
};
export type ColorOpt = { id: string; name: string; hex_code: string; color_code: string };
export type SizeOpt = { id: string; size_type_id: string; label: string; alt_label: string | null; sort_order: number };
