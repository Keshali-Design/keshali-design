import { createClient } from "@/lib/supabase/server";
import { NuevoProductoForm } from "@/components/admin/NuevoProductoForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Category, Product, Design, Color, Size } from "@/lib/supabase/types";

export const metadata = { title: "Nuevo producto — Admin" };

export default async function NuevoProductoPage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: products },
    { data: designs },
    { data: colors },
    { data: sizes },
  ] = await Promise.all([
    supabase.from("categories").select("*").eq("active", true).order("name").returns<Category[]>(),
    supabase.from("products").select("id, model_code, name, category_id").order("name").returns<Pick<Product, "id" | "model_code" | "name" | "category_id">[]>(),
    supabase.from("designs").select("id, design_ref, name").eq("active", true).order("name").returns<Pick<Design, "id" | "design_ref" | "name">[]>(),
    supabase.from("colors").select("id, name, hex_code").eq("active", true).order("name").returns<Pick<Color, "id" | "name" | "hex_code">[]>(),
    supabase.from("sizes").select("id, name, abbreviation").eq("active", true).order("sort_order").returns<Pick<Size, "id" | "name" | "abbreviation">[]>(),
  ]);

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
        Crea una nueva variante de producto en el catálogo.
      </p>

      <NuevoProductoForm
        categories={categories ?? []}
        products={products ?? []}
        designs={designs ?? []}
        colors={colors ?? []}
        sizes={sizes ?? []}
      />
    </div>
  );
}
