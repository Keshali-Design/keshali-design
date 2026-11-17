const PAGE_SIZE = 1000;

// PostgREST (Supabase "max rows") caps every response at 1000 rows and cuts
// the rest silently. For tables that can outgrow that (catalog_view,
// inventory, product_variants), fetch page by page. `page` must apply a
// stable .order() so rows don't shift between pages.
export async function fetchAllPages<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error || !data) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }
  return rows;
}
