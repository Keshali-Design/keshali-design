export type CatalogParams = {
  categoria?: string;
  subcategoria?: string;
  talla?: string;
  tecnica?: string;
  precioMax?: string;
};

const ORDER: (keyof CatalogParams)[] = ["categoria", "subcategoria", "talla", "tecnica", "precioMax"];

// `null` removes a param, `undefined` keeps the current value.
export function catalogUrl(
  current: CatalogParams,
  overrides: Partial<Record<keyof CatalogParams, string | null>> = {}
) {
  const params = new URLSearchParams();
  for (const key of ORDER) {
    const value = key in overrides ? overrides[key] : current[key];
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}
