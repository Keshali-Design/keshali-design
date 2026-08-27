import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-sidebar text-sidebarText">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-base font-extrabold text-gold">KESHALI</div>
            <div className="text-[9px] font-normal uppercase tracking-[0.34em] text-muted mb-3">
              Design
            </div>
            <p className="text-sidebarText/70 text-xs max-w-[220px] leading-relaxed">
              Tu esencia en cada diseño. Productos personalizados con el mejor
              acabado.
            </p>
          </div>

          <div>
            <p className="label-sm text-muted mb-3">Navegación</p>
            <ul className="space-y-1.5 text-xs text-muted">
              {[
                { href: "/catalogo", label: "Catálogo" },
                { href: "/nosotros", label: "Nosotros" },
                { href: "/contacto", label: "Contacto" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-sm text-muted mb-3">Contacto</p>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>
                <a
                  href="https://wa.me/573159635343"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: +57 315 9635343
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/keshalidesign/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Instagram: @keshalidesign
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@keshalidesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  Tiktok: @keshalidesign
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="label-sm text-muted mb-3">Novedades</p>
            <div className="flex">
              <input
                placeholder="Tu correo"
                className="flex-1 min-w-0 border border-[#43392F] bg-[#2C251F] text-sidebarText placeholder:text-muted px-3 py-2.5 text-xs"
              />
              <button className="bg-gold text-sidebar font-extrabold text-xs px-4 shrink-0">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[#3A312A] pt-6 text-center text-xs text-muted">
          &copy; {year} Keshali Design. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
