import { createAdminClient } from "@/lib/supabase/admin";
import { TamañosManager } from "@/components/admin/TamañosManager";

export const metadata = { title: "Tamaños — Admin" };

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#e8e8e8] mb-4">Tipos de tamaño</h1>
      <div className="glass rounded-card p-6 border border-red-400/20">
        <p className="text-red-400 text-sm font-semibold mb-1">Error al cargar</p>
        <p className="text-muted text-xs font-mono break-all">{message}</p>
        <p className="text-muted text-xs mt-3">
          Asegúrate de haber ejecutado las migraciones SQL en el editor de Supabase
          y de que las variables de entorno estén configuradas en Vercel.
        </p>
      </div>
    </div>
  );
}

export default async function TamañosPage() {
  try {
    const supabase = createAdminClient();

    const [sizeTypesRes, sizesRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("size_types") as any)
        .select("id, name, unit_label, active")
        .order("name"),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("sizes") as any)
        .select("id, size_type_id, label, alt_value, alt_label, sort_order, active")
        .order("sort_order"),
    ]) as [
      { data: SizeType[] | null; error: { message: string } | null },
      { data: Size[] | null; error: { message: string } | null },
    ];

    if (sizeTypesRes.error) {
      return <ErrorCard message={sizeTypesRes.error.message} />;
    }

    return (
      <TamañosManager
        sizeTypes={sizeTypesRes.data ?? []}
        sizes={sizesRes.data ?? []}
      />
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return <ErrorCard message={message} />;
  }
}

export type SizeType = {
  id: string;
  name: string;
  unit_label: string;
  active: boolean;
};

export type Size = {
  id: string;
  size_type_id: string;
  label: string;
  alt_value: string | null;
  alt_label: string | null;
  sort_order: number;
  active: boolean;
};
