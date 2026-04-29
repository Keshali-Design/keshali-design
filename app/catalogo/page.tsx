import { Suspense } from "react";
import Link from "next/link";
import { getCatalogProducts, getCategories, getSubcategories } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

export const metadata = { title: "Catálogo — Keshali Design" };

type Props = { searchParams: Promise<{ categoria?: string; subcategoria?: string }> };

const PILL =
  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border";
const PILL_ACTIVE = "bg-gold text-bg border-gold";
const PILL_IDLE = "border-subtle text-muted hover:border-gold/40 hover:text-[#e8e8e8]";

export default async function CatalogoPage({ searchParams }: Props) {
  const { categoria, subcategoria } = await searchParams;

  const [categories, allSubcategories, products] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getCatalogProducts({ categorySlug: categoria, subcategorySlug: subcategoria }),
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

      {/* ── Category filter ── */}
      <div className="flex flex-wrap gap-2 mb-3">
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

      {/* ── Subcategory filter (only shown when subcategories exist) ── */}
      {visibleSubcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 pl-1 border-l-2 border-gold/20 ml-1">
          <Link
            href={categoria ? `/catalogo?categoria=${categoria}` : "/catalogo"}
            className={`${PILL} text-xs py-1.5 ${!subcategoria ? PILL_ACTIVE : PILL_IDLE}`}
          >
            Todas
          </Link>
          {visibleSubcategories.map((sub) => {
            const href = categoria
              ? `/catalogo?categoria=${categoria}&subcategoria=${sub.slug}`
              : `/catalogo?subcategoria=${sub.slug}`;
            return (
              <Link
                key={sub.id}
                href={href}
                className={`${PILL} text-xs py-1.5 ${subcategoria === sub.slug ? PILL_ACTIVE : PILL_IDLE}`}
              >
                {sub.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Product grid ── */}
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-card h-72 animate-pulse" />
          ))}
        </div>
      }>
        {products.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-lg mb-2">No hay productos en esta categoría.</p>
            <Link href="/catalogo" className="text-gold hover:underline">Ver todo el catálogo</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
