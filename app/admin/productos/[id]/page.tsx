import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditVariantFullForm } from "@/components/admin/EditVariantFullForm";

export const metadata = { title: "Editar variante — Admin" };

export default async function EditVariantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: variant } = await (supabase.from("product_variants") as any)
    .select(`
      id, sku, price_override, active,
      products ( name, category_id, categories ( name ) ),
      colors ( name, hex_code ),
      sizes ( label, alt_label )
    `)
    .eq("id", id)
    .single() as {
      data: {
        id: string;
        sku: string;
        price_override: number | null;
        active: boolean;
        products: { name: string; category_id: string; categories: { name: string } | null } | null;
        colors: { name: string; hex_code: string } | null;
        sizes: { label: string; alt_label: string | null } | null;
      } | null;
    };

  if (!variant) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: images } = await (supabase.from("product_images") as any)
    .select("id, url, alt_text, sort_order, is_primary")
    .eq("variant_id", id)
    .order("sort_order") as { data: { id: string; url: string; alt_text?: string; sort_order: number; is_primary: boolean }[] | null };

  const sizeLabel = [variant.sizes?.label, variant.sizes?.alt_label].filter(Boolean).join(" / ");

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-6"
      >
        <ChevronLeft size={16} />
        Volver a productos
      </Link>

      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Editar variante</h1>
      <p className="text-muted text-sm mb-1">
        <span className="font-mono text-xs bg-white/5 border border-subtle rounded px-1.5 py-0.5">{variant.sku}</span>
      </p>
      <p className="text-muted text-xs mb-8">
        {variant.products?.categories?.name} · {variant.products?.name}
        {variant.colors && <> · <span style={{ color: variant.colors.hex_code }}>{variant.colors.name}</span></>}
        {sizeLabel && <> · {sizeLabel}</>}
      </p>

      <EditVariantFullForm
        id={variant.id}
        sku={variant.sku}
        priceOverride={variant.price_override}
        active={variant.active}
        images={images ?? []}
      />
    </div>
  );
}
