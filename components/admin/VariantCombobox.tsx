"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import { formatCOP } from "@/lib/utils";
import type { VariantOpt } from "@/app/admin/pedidos/nuevo/page";

function getVariantPrice(v: VariantOpt): number {
  if (v.price_override != null) return v.price_override;
  const ps = v.products?.product_sizes?.find((ps) => ps.size_id === v.sizes?.id);
  return ps?.price ?? 0;
}

function getVariantLabel(v: VariantOpt): string {
  const parts = [v.products?.name, v.sizes?.label, v.colors?.name].filter(Boolean);
  return parts.join(" · ");
}

export function VariantCombobox({
  variants,
  value,
  onChange,
}: {
  variants: VariantOpt[];
  value: string;
  onChange: (variantId: string, price: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = variants.find((v) => v.id === value);

  const filtered = query.trim()
    ? variants.filter(
        (v) =>
          getVariantLabel(v).toLowerCase().includes(query.toLowerCase()) ||
          v.sku.toLowerCase().includes(query.toLowerCase()) ||
          v.colors?.name.toLowerCase().includes(query.toLowerCase()) ||
          v.sizes?.label.toLowerCase().includes(query.toLowerCase())
      )
    : variants;

  function openDropdown() {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) close();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function select(v: VariantOpt) {
    onChange(v.id, getVariantPrice(v));
    close();
  }

  const selectedLabel = selected ? getVariantLabel(selected) : null;
  const selectedPrice = selected ? getVariantPrice(selected) : null;

  return (
    <div className="w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? close : openDropdown}
        className="w-full bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:border-gold/50 transition-colors hover:border-gold/30"
      >
        <span className={`truncate ${selected ? "text-[#e8e8e8]" : "text-muted"}`}>
          {selectedLabel
            ? `${selectedLabel}${selectedPrice != null ? ` — ${formatCOP(selectedPrice)}` : ""}`
            : "Seleccionar producto..."}
        </span>
        <ChevronDown size={14} className={`text-muted flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && rect && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width, zIndex: 9999 }}
          className="bg-[#1a1a1b] border border-subtle rounded-lg shadow-card overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-subtle">
            <Search size={13} className="text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, talla, color, SKU…"
              className="flex-1 bg-transparent text-sm text-[#e8e8e8] placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-muted text-xs text-center py-4">Sin resultados</p>
            ) : (
              filtered.map((v) => {
                const price = getVariantPrice(v);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => select(v)}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center justify-between gap-3 ${
                      v.id === value ? "bg-white/5 text-gold" : "text-[#e8e8e8]"
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      {v.colors?.hex_code && (
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                          style={{ background: v.colors.hex_code }}
                        />
                      )}
                      <div>
                        <p className="truncate leading-snug text-xs font-medium">{v.products?.name}</p>
                        <p className="text-muted text-xs">{v.sizes?.label} · {v.colors?.name}</p>
                        <p className="text-muted text-[10px] font-mono">{v.sku}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-gold text-xs font-semibold">{formatCOP(price)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
