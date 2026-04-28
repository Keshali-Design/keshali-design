"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ── Size types ────────────────────────────────────────────────

export async function createSizeType(data: { name: string; unit_label: string }) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("size_types") as any).insert({
    name: data.name.trim(),
    unit_label: data.unit_label.trim(),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/tamanos");
  return { error: null };
}

export async function toggleSizeType(id: string, active: boolean) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("size_types") as any)
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/tamanos");
  return { error: null };
}

// ── Sizes ─────────────────────────────────────────────────────

export async function createSize(data: {
  size_type_id: string;
  label: string;
  alt_value?: string;
  alt_label?: string;
  sort_order: number;
}) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("sizes") as any).insert({
    size_type_id: data.size_type_id,
    label: data.label.trim(),
    alt_value: data.alt_value?.trim() || null,
    alt_label: data.alt_label?.trim() || null,
    sort_order: data.sort_order,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/tamanos");
  return { error: null };
}

export async function updateSize(
  id: string,
  data: { label: string; alt_value?: string; alt_label?: string; sort_order: number }
) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("sizes") as any)
    .update({
      label: data.label.trim(),
      alt_value: data.alt_value?.trim() || null,
      alt_label: data.alt_label?.trim() || null,
      sort_order: data.sort_order,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/tamanos");
  return { error: null };
}

export async function toggleSize(id: string, active: boolean) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("sizes") as any)
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/tamanos");
  return { error: null };
}
