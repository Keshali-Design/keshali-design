"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function trackProductView(productId: string) {
  if (!UUID.test(productId)) return;
  const supabase = createAdminClient();
  // Best-effort: a failed count must never break the product page.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("increment_product_view", { p_product_id: productId });
}
