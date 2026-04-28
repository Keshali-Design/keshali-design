import { createAdminClient } from "@/lib/supabase/admin";
import { TamañosManager } from "@/components/admin/TamañosManager";

export const metadata = { title: "Tamaños — Admin" };

export default async function TamañosPage() {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sizeTypes } = await (supabase.from("size_types") as any)
    .select("id, name, unit_label, active")
    .order("name") as { data: SizeType[] | null };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sizes } = await (supabase.from("sizes") as any)
    .select("id, size_type_id, label, alt_value, alt_label, sort_order, active")
    .order("sort_order") as { data: Size[] | null };

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
