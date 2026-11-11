import type { Metadata } from "next";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import {
  getCatalogProducts,
  getCategories,
  getSubcategories,
  getPriceRange,
  type Category,
  type Subcategory,
} from "@/lib/supabase/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { CatalogSidebar, type SizeGroup } from "./CatalogSidebar";
import { catalogUrl, type CatalogParams } from "./catalogUrl";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60;

type Props = { searchParams: Promise<CatalogParams> };

const TECHNIQUES = ["DTF", "Sublimación"];

function resolveSelection(params: CatalogParams, categories: Category[], subcategories: Subcategory[]) {
  const category = categories.find((c) => c.slug === params.categoria);
  const subcategory = params.subcategoria
    ? subcategories.find(
        (s) => s.slug === params.subcategoria && (!category || s.parent_id === category.id)
      )
    : undefined;
  return { category, subcategory };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const [categories, subcategories] = await Promise.all([getCategories(), getSubcategories()]);
  const { category, subcategory } = resolveSelection(params, categories, subcategories);

  const name = subcategory
    ? `${category ? `${category.name} · ` : ""}${subcategory.name}`
    : category?.name;

  const title = name
    ? `${name} personalizados — Sublimación y estampación`
    : "Catálogo de productos personalizados — Sublimación y estampación";
  const description = name
    ? `Descubre ${name} en ${SITE_NAME}: productos personalizados con sublimación, estampación DTF y acabado premium. Elige tu talla, color y diseño.`
    : `Catálogo de ${SITE_NAME}: mugs, camisetas, buzos, gorras, cojines y regalos personalizados con sublimación y estampación DTF.`;

  // Canonical = the category/subcategory page; size/technique/price combos are
  // thin variations, so they're kept out of the index (links still followed).
  const canonical = catalogUrl({ categoria: category?.slug, subcategoria: subcategory?.slug });
  const isFilteredVariant = !!(params.talla || params.tecnica || params.precioMax);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    robots: isFilteredVariant ? { index: false, follow: true } : undefined,
  };
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const maxPrice = params.precioMax ? Number(params.precioMax) : undefined;

  const [categories, subcategories, priceRange, baseProducts] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getPriceRange(),
    getCatalogProducts({
      categorySlug: params.categoria,
      subcategorySlug: params.subcategoria,
      technique: params.tecnica,
      maxPrice,
    }),
  ]);

  const { category, subcategory } = resolveSelection(params, categories, subcategories);

  // Sizes offered = sizes present in the current selection (before the size filter itself).
  const groups = new Map<string, Map<string, number>>();
  for (const p of baseProducts) {
    for (const s of p.sizes) {
      if (!groups.has(s.typeName)) groups.set(s.typeName, new Map());
      groups.get(s.typeName)!.set(s.label, s.sortOrder);
    }
  }
  const sizeGroups: SizeGroup[] = Array.from(groups, ([typeName, labels]) => ({
    typeName,
    labels: Array.from(labels)
      // Tie-break equal sort_order numerically ("0-3 meses" before "3-6 meses").
      .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0], "es", { numeric: true }))
      .map(([label]) => label),
  })).sort((a, b) => a.typeName.localeCompare(b.typeName));

  const products = params.talla
    ? baseProducts.filter((p) => p.sizes.some((s) => s.label === params.talla))
    : baseProducts;

  const heading = subcategory?.name ?? category?.name ?? "Catálogo";
  const filterCount = [params.talla, params.tecnica, params.precioMax].filter(Boolean).length;

  const sidebar = (
    <CatalogSidebar
      categories={categories}
      subcategories={subcategories}
      sizeGroups={sizeGroups}
      techniques={TECHNIQUES}
      priceRange={priceRange}
      current={params}
    />
  );

  return (
    <div className="section">
      {/* Breadcrumb */}
      <nav aria-label="Ruta" className="text-xs text-muted mb-3">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-gold-700">Inicio</Link></li>
          <li aria-hidden>/</li>
          <li>
            {category ? <Link href="/catalogo" className="hover:text-gold-700">Catálogo</Link> : <span className="text-ink">Catálogo</span>}
          </li>
          {category && (
            <>
              <li aria-hidden>/</li>
              <li>
                {subcategory ? (
                  <Link href={catalogUrl({ categoria: category.slug })} className="hover:text-gold-700">{category.name}</Link>
                ) : (
                  <span className="text-ink">{category.name}</span>
                )}
              </li>
            </>
          )}
          {subcategory && (
            <>
              <li aria-hidden>/</li>
              <li className="text-ink">{subcategory.name}</li>
            </>
          )}
        </ol>
      </nav>

      <h1 className="section-title text-3xl mb-1">{heading}</h1>
      <p className="text-muted mb-8">
        Productos personalizados con sublimación y estampación ·{" "}
        {products.length} producto{products.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-8 items-start">
        {/* Mobile: filters collapse behind a toggle so the grid stays above the fold */}
        <details className="lg:hidden border border-subtle bg-white">
          <summary className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink cursor-pointer select-none">
            <SlidersHorizontal size={16} />
            Filtros{filterCount > 0 && <span className="text-gold-700">({filterCount})</span>}
          </summary>
          <div className="px-4 pb-5 pt-1">{sidebar}</div>
        </details>

        <aside className="hidden lg:block lg:sticky lg:top-24">{sidebar}</aside>

        {products.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-lg mb-2">No hay productos con esos filtros.</p>
            <Link href="/catalogo" className="text-gold-700 hover:underline">Ver todo el catálogo</Link>
          </div>
        ) : (
          <section aria-labelledby="catalog-products">
            <h2 id="catalog-products" className="sr-only">Productos de {heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
