"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Tags,
  Ruler,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package, exact: false },
  { href: "/admin/stock", label: "Stock", icon: Layers, exact: false },
  { href: "/admin/categorias", label: "Categorías", icon: Tags, exact: false },
  { href: "/admin/tamanos", label: "Tamaños", icon: Ruler, exact: false },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-56 flex-shrink-0 bg-sidebar text-sidebarText border-r border-[rgba(192,148,73,.25)] flex flex-col min-h-screen">
      <div className="px-5 py-[18px] border-b-2 border-[rgba(192,148,73,.45)]">
        <div className="text-[9px] tracking-[0.22em] uppercase text-gold">Panel</div>
        <span className="font-extrabold text-[19px] tracking-tight block mt-[5px]">Keshali</span>
        <p className="text-sidebarText/55 text-[11px] mt-0.5">Panel Admin</p>
      </div>

      <div className="px-5 pt-4 pb-1.5 text-[9px] tracking-[0.2em] uppercase text-sidebarText/50">
        Administración
      </div>
      <nav className="flex flex-col">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-5 py-2 text-[12.5px] border-l-[3px] transition-colors",
                active
                  ? "font-extrabold bg-[rgba(192,148,73,.18)] text-gold-200 border-gold"
                  : "font-normal text-sidebarText/70 border-transparent hover:bg-white/5 hover:text-sidebarText"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-6 pt-4 border-t border-white/10 flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] text-sidebarText/70 border-l-[3px] border-transparent hover:text-sidebarText hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={16} />
          Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] text-sidebarText/70 border-l-[3px] border-transparent hover:text-red-300 hover:bg-white/5 transition-colors w-full text-left"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
