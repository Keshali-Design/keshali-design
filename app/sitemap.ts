import type { MetadataRoute } from "next";
import { getCategories, getSubcategories, getCatalogProducts } from "@/lib/supabase/queries";
import { absoluteUrl } from "@/lib/site";
import { catalogUrl } from "./catalogo/catalogUrl";

// Next writes <loc> verbatim, so "&" must be escaped or the XML is invalid.
const xmlUrl = (path: string) => absoluteUrl(path).replace(/&/g, "&amp;");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, subcategories, products] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getCatalogProducts(),
  ]);

  const now = new Date();
  const catSlugById = new Map(categories.map((c) => [c.id, c.slug]));

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/catalogo"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: xmlUrl(catalogUrl({ categoria: c.slug })),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...subcategories
      .filter((s) => catSlugById.has(s.parent_id))
      .map((s) => ({
        url: xmlUrl(catalogUrl({ categoria: catSlugById.get(s.parent_id), subcategoria: s.slug })),
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...products.map((p) => ({
      url: absoluteUrl(`/producto/${p.product_id}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.primary_image_url ? [p.primary_image_url] : undefined,
    })),
    { url: absoluteUrl("/nosotros"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contacto"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
