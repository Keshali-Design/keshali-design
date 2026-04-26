import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { NuevoPedidoForm } from "@/components/admin/NuevoPedidoForm";

export const metadata = { title: "Nuevo pedido — Admin" };

export default async function NuevoPedidoPage() {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: variants } = await (supabase.from("product_variants") as any)
    .select("id, sku, title, price, stock")
    .eq("active", true)
    .order("title");

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
