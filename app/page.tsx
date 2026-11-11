import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getCatalogProducts,
  getBestSellerIds,
  getMostViewedIds,
  type CatalogProduct,
} from "@/lib/supabase/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { CategoryCard } from "@/components/store/CategoryCard";
import { SITE_NAME, SITE_TAGLINE, WHATSAPP_NUMBER } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SECTION_SIZE = 8;
const MIN_SECTION_SIZE = 4;

type RankedItem = { product: CatalogProduct; ranked: boolean };

// Real ranking first; while there isn't enough sales/view data yet, top up with
// other catalog products (without the badge) so the section never looks empty.
function buildRanking(ids: string[], all: CatalogProduct[], exclude: Set<string>): RankedItem[] {
  const byId = new Map(all.map((p) => [p.product_id, p]));
  const ranked = ids
    .map((id) => byId.get(id))
    .filter((p): p is CatalogProduct => !!p)
    .slice(0, SECTION_SIZE)
    .map((product) => ({ product, ranked: true }));

  if (ranked.length >= MIN_SECTION_SIZE) return ranked;

  const used = new Set(ranked.map((r) => r.product.product_id));
  const fillers = all
    .filter((p) => !used.has(p.product_id) && !exclude.has(p.product_id) && p.total_stock > 0)
    .slice(0, MIN_SECTION_SIZE - ranked.length)
    .map((product) => ({ product, ranked: false }));

  return [...ranked, ...fillers];
}

function HeroButtons() {
  return (
    <>
      <Link href="/catalogo" className="btn-gold shadow-lg shadow-black/30">
        Ver catálogo
      </Link>
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-gold text-gold hover:bg-gold hover:text-white font-extrabold text-[13px] tracking-wide px-6 py-3.5 transition-colors duration-150 bg-[#0A1B2F]/60 backdrop-blur-sm"
      >
        Hablar por WhatsApp
      </a>
    </>
  );
}

function ProductSection({
  title,
  subtitle,
  badge,
  items,
  tone,
}: {
  title: string;
  subtitle: string;
  badge: string;
  items: RankedItem[];
  tone: "white" | "section";
}) {
  if (items.length === 0) return null;
  return (
    <section className={`${tone === "white" ? "bg-white" : "bg-section"} border-b border-subtle`}>
      <div className="section">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="text-body">{subtitle}</p>
          </div>
          <Link href="/catalogo" className="btn-ghost hidden sm:inline-flex">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(({ product, ranked }) => (
            <ProductCard key={product.product_id} product={product} badge={ranked ? badge : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [categories, allProducts, bestSellerIds, mostViewedIds] = await Promise.all([
    getCategories(),
    getCatalogProducts(),
    getBestSellerIds(SECTION_SIZE),
    getMostViewedIds(SECTION_SIZE),
  ]);

  const bestSellers = buildRanking(bestSellerIds, allProducts, new Set());
  const mostViewed = buildRanking(
    mostViewedIds,
    allProducts,
    new Set(bestSellers.map((b) => b.product.product_id))
  );

  return (
    <>
      {/* Hero — the banner artwork carries its own headline, so only the CTAs sit on top.
          Its text is baked into the image, so it's shown whole (never cropped). */}
      <section className="bg-[#0A1B2F]">
        {/* The visible headline lives in the artwork; this H1 states the same for search engines and screen readers. */}
        <h1 className="sr-only">
          {SITE_NAME}: sublimación, estampación y personalización. {SITE_TAGLINE}.
        </h1>
        <div className="relative max-w-[1600px] mx-auto">
          <Image
            src="/hero-banner.webp"
            alt={`${SITE_NAME}: personalización premium, sublimación y estampado. ${SITE_TAGLINE}.`}
            width={1600}
            height={525}
            priority
            sizes="100vw"
            className="w-full h-auto"
          />
          {/* Desktop: CTAs in the empty band between the tagline and the gold box (% of the artwork). */}
          <div className="hidden lg:flex absolute left-[52.5%] top-[62%] -translate-x-1/2 -translate-y-1/2 gap-4">
            <HeroButtons />
          </div>
        </div>
        {/* Below lg the artwork is too short to overlay; CTAs go under it. */}
        <div className="lg:hidden flex flex-wrap justify-center gap-3 px-4 py-5">
          <HeroButtons />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <h2 className="section-title">Categorías</h2>
          <p className="text-body mb-8">
            Explora nuestros productos personalizables con sublimación y estampación
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                slug={cat.slug}
                image={cat.image_url}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      <ProductSection
        title="Lo más vendido"
        subtitle="Los favoritos de nuestros clientes"
        badge="Más vendido"
        items={bestSellers}
        tone="white"
      />

      <ProductSection
        title="Lo más buscado"
        subtitle="Los productos que más están mirando en la tienda"
        badge="Tendencia"
        items={mostViewed}
        tone="section"
      />

      {/* About teaser */}
      <section className="section bg-white">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Misión",
              text: "Ofrecer productos personalizados de alta calidad que expresen la esencia única de cada cliente.",
            },
            {
              title: "Visión",
              text: "Ser la marca líder en personalización de productos en Colombia, reconocida por creatividad y excelencia.",
            },
            {
              title: "Valores",
              text: "Creatividad, calidad, puntualidad y compromiso con cada pedido que realizamos.",
            },
          ].map((item) => (
            <div key={item.title}>
              <div className="w-6 h-0.5 bg-gold mb-3" />
              <h3 className="text-ink font-semibold text-base mb-1.5">
                {item.title}
              </h3>
              <p className="text-body text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
