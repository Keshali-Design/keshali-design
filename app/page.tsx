import Link from "next/link";
import Image from "next/image";
import { getCategories, getFeaturedCatalogItems } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/store/ProductCard";
import { CategoryCard } from "@/components/store/CategoryCard";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedCatalogItems(12),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[560px] flex items-center overflow-hidden bg-black">
        <Image
          src="/hero-banner.png"
          alt="Keshali Design"
          fill
          className="object-cover object-center opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="section relative z-10">
          <p className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
            Personalización Premium
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Tu esencia en{" "}
            <span className="gold-text">cada diseño</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mb-8 leading-relaxed">
            Creamos productos únicos que reflejan tu identidad. Sublimación,
            bordado y estampado de alta calidad.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/catalogo" className="btn-gold">
              Ver catálogo
            </Link>
            <a
              href="https://wa.me/573177301489"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <h2 className="section-title">Categorías</h2>
          <p className="text-muted mb-8">
            Explora nuestra colección de productos personalizables
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                name={cat.name}
                slug={cat.slug}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="bg-[#0a0a0b] py-16">
          <div className="section">
            <h2 className="section-title">Catálogo destacado</h2>
            <p className="text-muted mb-8">
              Los productos más populares de nuestra tienda
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((item) => (
                <ProductCard key={item.variant_id} item={item} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/catalogo" className="btn-ghost">
                Ver todos los productos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="section">
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
            <div key={item.title} className="glass rounded-card p-6">
              <h3 className="text-gold font-semibold text-lg mb-3">
                {item.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
