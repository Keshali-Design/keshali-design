"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const count = itemCount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-nav border-b border-subtle">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-gold-700">
            KESHALI
          </span>
          <span className="text-[9.5px] font-normal uppercase tracking-[0.34em] text-label mt-1">
            Design
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors duration-150",
                pathname === link.href
                  ? "text-gold-700 bg-gold-50"
                  : "text-body hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative p-2.5 text-ink hover:text-gold-700 transition-colors"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          <button
            className="md:hidden p-2 text-ink hover:text-gold-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-subtle px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors duration-150",
                pathname === link.href
                  ? "text-gold-700 bg-gold-50"
                  : "text-body hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
