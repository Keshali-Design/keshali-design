import { Suspense } from "react";
import Link from "next/link";
import { getCatalogItems, getCategories } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/store/ProductCard";

export const revalidate = 60;

export const metadata = {
  title: "Catálogo — Keshali Design",
};

type Props = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function CatalogoPage({ searchParams }: Props) {
  const { categoria } = await searchParams;

  const [categories, items] = await Promise.all([
    getCategories(),
    getCatalogItems({ categorySlug: categoria }),
  ]);

  return (
    <div className="section">
      <h1 className="section-title text-3xl mb-1">Catálogo</h1>
      <p className="text-muted mb-8">
        {items.length} producto{items.length !== 1 ? "s" : ""} encontrado
        {items.length !== 1 ? "s" : ""}
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/catalogo"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border ${
            !categoria
              ? "bg-gold text-bg border-gold"
              : "border-subtle text-muted hover:border-gold/40 hover:text-[#e8e8e8]"
          }`}
        >
          Todos
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalogo?categoria=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border ${
              categoria === cat.slug
                ? "bg-gold text-bg border-gold"
                : "border-subtle text-muted hover:border-gold/40 hover:text-[#e8e8e8]"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="glass rounded-card h-72 animate-pulse"
              />
            ))}
          </div>
        }
      >
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-lg mb-2">No hay productos en esta categoría.</p>
            <Link href="/catalogo" className="text-gold hover:underline">
              Ver todo el catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.variant_id} item={item} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
