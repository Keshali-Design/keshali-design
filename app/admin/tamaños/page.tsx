import { createAdminClient } from "@/lib/supabase/admin";
import { TamañosManager } from "@/components/admin/TamañosManager";

export const metadata = { title: "Tamaños — Admin" };

export default async function TamañosPage() {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sizeTypes, error: stErr } = await (supabase.from("size_types") as any)
    .select("id, name, unit_label, active")
    .order("name") as { data: SizeType[] | null; error: { message: string } | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sizes } = await (supabase.from("sizes") as any)
    .select("id, size_type_id, label, alt_value, alt_label, sort_order, active")
    .order("sort_order") as { data: Size[] | null; error: unknown };

  if (stErr) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-[#e8e8e8] mb-4">Tipos de tamaño</h1>
        <div className="glass rounded-card p-6 border border-red-400/20">
          <p className="text-red-400 text-sm font-semibold mb-1">Error al cargar la tabla</p>
          <p className="text-muted text-xs">{stErr.message}</p>
          <p className="text-muted text-xs mt-3">
            Asegúrate de haber ejecutado las migraciones SQL (001_restructure.sql y 003_seed_sizes.sql)
            en el editor SQL de Supabase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TamañosManager
      sizeTypes={sizeTypes ?? []}
      sizes={sizes ?? []}
    />
  );
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
