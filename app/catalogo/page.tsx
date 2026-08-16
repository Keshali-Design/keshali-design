import { Suspense } from "react";
import Link from "next/link";
import { getCatalogProducts, getCategories, getSubcategories, getPriceRange } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { SubcategorySelect } from "./SubcategorySelect";
import { CatalogFilters } from "./CatalogFilters";

export const revalidate = 60;

export const metadata = { title: "Catálogo — Keshali Design" };

type Props = {
  searchParams: Promise<{
    categoria?: string;
    subcategoria?: string;
    tecnica?: string;
    precioMax?: string;
  }>;
};

const PILL =
  "px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors duration-150 border";
const PILL_ACTIVE = "bg-gold text-white border-gold";
const PILL_IDLE = "bg-white border-subtle text-body hover:border-gold";

const TECHNIQUES = ["DTF", "Sublimación"];

export default async function CatalogoPage({ searchParams }: Props) {
  const { categoria, subcategoria, tecnica, precioMax } = await searchParams;
  const maxPrice = precioMax ? Number(precioMax) : undefined;

  const [categories, allSubcategories, priceRange, products] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getPriceRange(),
    getCatalogProducts({
      categorySlug: categoria,
      subcategorySlug: subcategoria,
      technique: tecnica,
      maxPrice,
    }),
  ]);

  // When a category is selected, only show its subcategories.
  // When "Todos" is active, show all subcategories.
  const selectedCategory = categories.find((c) => c.slug === categoria);
  const visibleSubcategories = selectedCategory
    ? allSubcategories.filter((s) => s.parent_id === selectedCategory.id)
    : allSubcategories;

  return (
    <div className="section">
      <h1 className="section-title text-3xl mb-1">Catálogo</h1>
      <p className="text-muted mb-8">
        {products.length} producto{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}
      </p>

      {/* ── Category filter + subcategory select ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/catalogo"
            className={`${PILL} ${!categoria ? PILL_ACTIVE : PILL_IDLE}`}
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className={`${PILL} ${categoria === cat.slug ? PILL_ACTIVE : PILL_IDLE}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {visibleSubcategories.length > 0 && (
          <SubcategorySelect
            subcategories={visibleSubcategories}
            current={subcategoria}
            categoria={categoria}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
        {/* ── Sidebar: technique + price filters ── */}
        <CatalogFilters
          techniques={TECHNIQUES}
          currentTechnique={tecnica}
          priceRange={priceRange}
          currentMaxPrice={maxPrice}
          categoria={categoria}
          subcategoria={subcategoria}
        />

        {/* ── Product grid ── */}
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-subtle h-72 animate-pulse" />
            ))}
          </div>
        }>
          {products.length === 0 ? (
            <div className="text-center py-20 text-muted">
              <p className="text-lg mb-2">No hay productos con esos filtros.</p>
              <Link href="/catalogo" className="text-gold-700 hover:underline">Ver todo el catálogo</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
