"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Main categories ───────────────────────────────────────────

export async function createCategory(data: {
  name: string;
  size_type_id: string;
}) {
  const supabase = createAdminClient();
  const slug = toSlug(data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("categories") as any).insert({
    name: data.name.trim(),
    slug,
    size_type_id: data.size_type_id,
    active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  return { error: null };
}

export async function toggleCategory(id: string, active: boolean) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("categories") as any)
    .update({ active })
    .eq("id", id);

  if (error) return { error: error.message };

  // Cascade to products in this category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("products") as any)
    .update({ active })
    .eq("category_id", id);

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { error: null };
}

// ── Subcategories ─────────────────────────────────────────────

export async function createSubcategory(data: {
  name: string;
  parent_id: string;
}) {
  const supabase = createAdminClient();
  const slug = toSlug(data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("categories") as any).insert({
    name: data.name.trim(),
    slug,
    parent_id: data.parent_id,
    active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  return { error: null };
}

export async function toggleSubcategory(id: string, active: boolean) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("categories") as any)
    .update({ active })
    .eq("id", id);

  if (error) return { error: error.message };

  // Cascade to products in this subcategory
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("products") as any)
    .update({ active })
    .eq("subcategory_id", id);

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
  revalidatePath("/");
  return { error: null };
}

// ── Category colors ───────────────────────────────────────────

export async function setCategoryColors(categoryId: string, colorIds: string[]) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("category_colors") as any)
    .delete()
    .eq("category_id", categoryId);

  if (colorIds.length > 0) {
    const rows = colorIds.map((color_id) => ({ category_id: categoryId, color_id, active: true }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("category_colors") as any).insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/categorias");
  return { error: null };
}

export async function toggleCategoryColor(id: string, active: boolean) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("category_colors") as any)
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  return { error: null };
}

// ── Category sizes ────────────────────────────────────────────

export async function setCategorySizes(categoryId: string, sizeIds: string[]) {
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("category_sizes") as any)
    .delete()
    .eq("category_id", categoryId);

  if (sizeIds.length > 0) {
    const rows = sizeIds.map((size_id) => ({ category_id: categoryId, size_id, active: true }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("category_sizes") as any).insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/categorias");
  return { error: null };
}

export async function toggleCategorySize(id: string, active: boolean) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("category_sizes") as any)
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/catalogo");
  return { error: null };
}
