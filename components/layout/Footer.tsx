import Link from "next/link";
import { INSTAGRAM, TIKTOK, WHATSAPP_NUMBER, WHATSAPP_DISPLAY } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-sidebar text-sidebarText">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-base font-extrabold text-gold">KESHALI</div>
            <div className="text-[9px] font-normal uppercase tracking-[0.22em] text-muted mb-3">
              Design Sublimación
            </div>
            <p className="text-sidebarText/70 text-xs max-w-[240px] leading-relaxed">
              Tu esencia en cada diseño. Sublimación, estampación y personalización
              de productos con el mejor acabado.
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
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors break-all"
                >
                  Instagram: @{INSTAGRAM.handle}
                </a>
              </li>
              <li>
                <a
                  href={TIKTOK.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors break-all"
                >
                  TikTok: @{TIKTOK.handle}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="label-sm text-muted mb-3">Novedades</p>
            <div className="flex">
              <input
                type="email"
                aria-label="Tu correo para recibir novedades"
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
          &copy; {year} Keshali Design Sublimación. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
