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
  { href: "/admin/tamaños", label: "Tamaños", icon: Ruler, exact: false },
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
    <aside className="w-56 flex-shrink-0 glass border-r border-subtle flex flex-col min-h-screen">
      <div className="p-5 border-b border-subtle">
        <span className="font-bold gold-text text-base">Keshali</span>
        <p className="text-muted text-xs mt-0.5">Panel Admin</p>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-gold/10 text-gold"
                  : "text-muted hover:text-[#e8e8e8] hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-subtle flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-[#e8e8e8] hover:bg-white/5 transition-colors"
        >
          <ExternalLink size={16} />
          Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-red-400 hover:bg-white/5 transition-colors w-full text-left"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
