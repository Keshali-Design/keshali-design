"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  price: number;
  stock: number;
  active: boolean;
};

export function EditVariantForm({ id, price, stock, active }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ price, stock, active });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("product_variants") as any).update({
      price: values.price,
      stock: values.stock,
      active: values.active,
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) {
      setError("Error al guardar");
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded hover:bg-white/5 text-muted hover:text-gold transition-colors"
        title="Editar"
      >
        <Pencil size={14} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-1">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            value={values.price}
            onChange={(e) =>
              setValues({ ...values, price: Number(e.target.value) })
            }
            className="w-24 bg-white/5 border border-subtle rounded px-2 py-1 text-xs text-[#e8e8e8] focus:outline-none focus:border-gold/50"
            placeholder="Precio"
          />
          <input
            type="number"
            value={values.stock}
            onChange={(e) =>
              setValues({ ...values, stock: Number(e.target.value) })
            }
            className="w-16 bg-white/5 border border-subtle rounded px-2 py-1 text-xs text-[#e8e8e8] focus:outline-none focus:border-gold/50"
            placeholder="Stock"
          />
          <label className="flex items-center gap-1 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) =>
                setValues({ ...values, active: e.target.checked })
              }
              className="accent-[#caa45a]"
            />
            Activo
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1.5 rounded hover:bg-emerald-400/10 text-emerald-400 transition-colors disabled:opacity-50"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setValues({ price, stock, active });
              setError(null);
            }}
            className="p-1.5 rounded hover:bg-white/5 text-muted transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
