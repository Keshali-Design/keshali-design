import Link from "next/link";
import type { Category, Subcategory } from "@/lib/supabase/queries";
import { PriceFilter } from "./CatalogFilters";
import { catalogUrl, type CatalogParams } from "./catalogUrl";

export type SizeGroup = { typeName: string; labels: string[] };

const LINK = "block px-2.5 py-1.5 text-xs transition-colors";
const LINK_ACTIVE = "bg-gold-100 text-gold-700 font-bold";
const LINK_IDLE = "text-body hover:bg-subtle2 hover:text-ink";

export function CatalogSidebar({
  categories,
  subcategories,
  sizeGroups,
  techniques,
  priceRange,
  current,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  sizeGroups: SizeGroup[];
  techniques: string[];
  priceRange: { min: number; max: number };
  current: CatalogParams;
}) {
  const hasExtraFilters = !!(current.talla || current.tecnica || current.precioMax);

  return (
    <div className="flex flex-col gap-7">
      {/* ── Categorías → subcategorías (filtro rápido) ── */}
      <nav aria-label="Categorías">
        <p className="label-sm mb-2.5">Categorías</p>
        <ul className="flex flex-col gap-0.5">
          <li>
            <Link
              href={catalogUrl(current, { categoria: null, subcategoria: null, talla: null })}
              className={`${LINK} ${!current.categoria && !current.subcategoria ? LINK_ACTIVE : LINK_IDLE}`}
            >
              Todo el catálogo
            </Link>
          </li>
          {categories.map((cat) => {
            const subs = subcategories.filter((s) => s.parent_id === cat.id);
            const catActive = current.categoria === cat.slug && !current.subcategoria;
            return (
              <li key={cat.id}>
                <Link
                  href={catalogUrl(current, { categoria: cat.slug, subcategoria: null, talla: null })}
                  className={`${LINK} font-semibold ${catActive ? LINK_ACTIVE : LINK_IDLE}`}
                >
                  {cat.name}
                </Link>
                {subs.length > 0 && (
                  <ul className="ml-2.5 border-l border-subtle pl-1.5 my-0.5 flex flex-col gap-0.5">
                    {subs.map((sub) => {
                      const subActive = current.categoria === cat.slug && current.subcategoria === sub.slug;
                      return (
                        <li key={sub.id}>
                          <Link
                            href={catalogUrl(current, { categoria: cat.slug, subcategoria: sub.slug, talla: null })}
                            className={`${LINK} ${subActive ? LINK_ACTIVE : LINK_IDLE}`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Tallas ── */}
      {sizeGroups.length > 0 && (
        <div>
          <p className="label-sm mb-2.5">Tallas</p>
          <div className="flex flex-col gap-3">
            {sizeGroups.map((group) => (
              <div key={group.typeName}>
                {sizeGroups.length > 1 && (
                  <p className="text-muted text-[10px] uppercase tracking-wide mb-1.5">{group.typeName}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {group.labels.map((label) => {
                    const active = current.talla === label;
                    return (
                      <Link
                        key={label}
                        href={catalogUrl(current, { talla: active ? null : label })}
                        aria-pressed={active}
                        className={`min-w-[2.5rem] text-center px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                          active
                            ? "bg-gold text-white border-gold"
                            : "bg-white text-body border-subtle hover:border-gold"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Técnica ── */}
      <div>
        <p className="label-sm mb-2.5">Técnica</p>
        <div className="flex flex-col gap-0.5">
          {techniques.map((t) => {
            const active = current.tecnica === t;
            return (
              <Link
                key={t}
                href={catalogUrl(current, { tecnica: active ? null : t })}
                aria-pressed={active}
                className={`${LINK} font-semibold ${active ? LINK_ACTIVE : LINK_IDLE}`}
              >
                {t}
              </Link>
            );
          })}
        </div>
      </div>

      {priceRange.max > priceRange.min && (
        // key: remount (reset the slider) when the URL's price changes, e.g. "Limpiar filtros".
        <PriceFilter key={current.precioMax ?? "max"} priceRange={priceRange} current={current} />
      )}

      {hasExtraFilters && (
        <Link
          href={catalogUrl(current, { talla: null, tecnica: null, precioMax: null })}
          className="border border-subtle bg-white text-body text-xs font-semibold px-3.5 py-2.5 hover:border-gold transition-colors w-full text-center"
        >
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}
