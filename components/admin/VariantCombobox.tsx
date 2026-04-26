"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import { formatCOP } from "@/lib/utils";

type Variant = { id: string; sku: string; title: string; price: number; stock: number };

export function VariantCombobox({
  variants,
  value,
  onChange,
}: {
  variants: Variant[];
  value: string;
  onChange: (variantId: string, price: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = variants.find((v) => v.id === value);

  const filtered = query.trim()
    ? variants.filter(
        (v) =>
          v.title.toLowerCase().includes(query.toLowerCase()) ||
          v.sku.toLowerCase().includes(query.toLowerCase())
      )
    : variants;

  function openDropdown() {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (!triggerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onScroll() { setOpen(false); setQuery(""); }
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  function select(v: Variant) {
    onChange(v.id, v.price);
    setOpen(false);
    setQuery("");
  }

  const dropdown = open && rect ? (
    <div
      style={{
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      }}
      className="bg-[#1a1a1b] border border-subtle rounded-lg shadow-card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-subtle">
        <Search size={13} className="text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="flex-1 bg-transparent text-sm text-[#e8e8e8] placeholder:text-muted focus:outline-none"
        />
      </div>
      <div className="max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-muted text-xs text-center py-4">Sin resultados</p>
        ) : (
          filtered.map((v) => (
            <button
              key={v.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(v); }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center justify-between gap-3 ${
                v.id === value ? "bg-white/5 text-gold" : "text-[#e8e8e8]"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate leading-snug">{v.title}</p>
                <p className="text-muted text-xs font-mono">{v.sku}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-gold text-xs font-semibold">{formatCOP(v.price)}</p>
                <p className="text-muted text-xs">{v.stock} uds.</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        className="w-full bg-white/5 border border-subtle rounded-lg px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:border-gold/50 transition-colors hover:border-gold/30"
      >
        <span className={`truncate ${selected ? "text-[#e8e8e8]" : "text-muted"}`}>
          {selected ? `${selected.title} — ${formatCOP(selected.price)}` : "Seleccionar producto..."}
        </span>
        <ChevronDown size={14} className={`text-muted flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}
