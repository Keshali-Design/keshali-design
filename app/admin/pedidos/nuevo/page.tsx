import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoPedidoForm } from "@/components/admin/NuevoPedidoForm";

export const metadata = { title: "Nuevo pedido — Admin" };

export default async function NuevoPedidoPage() {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: variants } = await (supabase.from("product_variants") as any)
    .select(`
      id, sku, price_override,
      products ( name, price_varies_by_color, product_sizes ( size_id, price ) ),
      colors ( id, name, hex_code ),
      sizes ( id, label, alt_label )
    `)
    .eq("active", true)
    .order("sku") as { data: VariantOpt[] | null };

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1 text-muted hover:text-gold transition-colors text-sm mb-6"
      >
        <ChevronLeft size={16} />
        Volver a pedidos
      </Link>

      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-1">Nuevo pedido manual</h1>
      <p className="text-muted text-sm mb-8">Para pedidos recibidos por WhatsApp u otros canales.</p>

      <NuevoPedidoForm variants={variants ?? []} />
    </div>
  );
}

export type VariantOpt = {
  id: string;
  sku: string;
  price_override: number | null;
  products: {
    name: string;
    price_varies_by_color: boolean;
    product_sizes: { size_id: string; price: number }[];
  } | null;
  colors: { id: string; name: string; hex_code: string } | null;
  sizes: { id: string; label: string; alt_label: string | null } | null;
};
