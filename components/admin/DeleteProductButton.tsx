"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/admin/productos/actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-400 hidden sm:inline">¿Eliminar?</span>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            await deleteProduct(id);
          }}
          disabled={loading}
          className="text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded hover:bg-red-400/10 transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "Sí"}
        </button>
        <button
          type="button"
          onClick={() => setConfirm(false)}
          className="text-xs text-muted hover:text-[#e8e8e8] px-2 py-1.5 rounded hover:bg-white/5 transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      title={`Eliminar ${name}`}
      className="p-1.5 text-muted hover:text-red-400 transition-colors rounded hover:bg-red-400/10"
    >
      <Trash2 size={13} />
    </button>
  );
}
