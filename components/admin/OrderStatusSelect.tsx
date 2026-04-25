"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const STATUSES = [
  { value: "pending", label: "Pendiente", color: "text-yellow-400" },
  { value: "confirmed", label: "Confirmado", color: "text-blue-400" },
  { value: "shipped", label: "Enviado", color: "text-purple-400" },
  { value: "delivered", label: "Entregado", color: "text-emerald-400" },
  { value: "cancelled", label: "Cancelado", color: "text-red-400" },
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const current = STATUSES.find((s) => s.value === status);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    setSaving(true);
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("orders") as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    setStatus(newStatus);
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`bg-white/5 border border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50 cursor-pointer ${current?.color ?? "text-muted"}`}
    >
      {STATUSES.map((s) => (
        <option
          key={s.value}
          value={s.value}
          className="bg-[#0f0f10] text-[#e8e8e8]"
        >
          {s.label}
        </option>
      ))}
    </select>
  );
}
