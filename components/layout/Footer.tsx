import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-subtle mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="text-lg font-bold gold-text">Keshali Design</span>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              Tu esencia en cada diseño. Productos personalizados con el mejor
              acabado.
            </p>
          </div>

          <div>
            <p className="text-[#e8e8e8] font-semibold mb-3">Navegación</p>
            <ul className="space-y-2 text-sm text-muted">
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
            <p className="text-[#e8e8e8] font-semibold mb-3">Contacto</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="https://wa.me/573177301489"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: +57 317 7301489
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-subtle pt-6 text-center text-xs text-muted">
          &copy; {year} Keshali Design. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
