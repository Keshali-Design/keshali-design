"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/pedidos/actions";

const STATUSES = [
  { value: "pending",   label: "Pendiente",  color: "text-yellow-400" },
  { value: "confirmed", label: "Confirmado", color: "text-blue-400" },
  { value: "shipped",   label: "Enviado",    color: "text-purple-400" },
  { value: "delivered", label: "Entregado",  color: "text-emerald-400" },
  { value: "cancelled", label: "Cancelado",  color: "text-red-400" },
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
  currentTrackingCode,
  currentShippingCompany,
}: {
  orderId: string;
  currentStatus: string;
  currentTrackingCode?: string | null;
  currentShippingCompany?: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [pending, setPending] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState(currentTrackingCode ?? "");
  const [shippingCompany, setShippingCompany] = useState(currentShippingCompany ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STATUSES.find((s) => s.value === status);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === "shipped") {
      // Show tracking form before saving
      setPending(newStatus);
      return;
    }
    await save(newStatus);
  }

  async function save(newStatus: string, shipping?: { trackingCode: string; shippingCompany: string }) {
    setSaving(true);
    setError(null);
    const { error: err } = await updateOrderStatus(orderId, newStatus, shipping);
    if (err) {
      setError("Error al guardar");
      setSaving(false);
      return;
    }
    setStatus(newStatus);
    setPending(null);
    setSaving(false);
  }

  async function confirmShipping() {
    await save("shipped", { trackingCode, shippingCompany });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className={`bg-white/5 border border-subtle rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50 cursor-pointer ${current?.color ?? "text-muted"}`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value} className="bg-[#0f0f10] text-[#e8e8e8]">
            {s.label}
          </option>
        ))}
      </select>

      {/* Tracking form — shown when changing to "shipped" */}
      {pending === "shipped" && (
        <div className="bg-white/5 border border-subtle rounded-lg p-3 flex flex-col gap-2 w-64">
          <p className="text-xs text-muted">Datos de envío (opcional)</p>
          <input
            type="text"
            placeholder="Transportadora (ej. Servientrega)"
            value={shippingCompany}
            onChange={(e) => setShippingCompany(e.target.value)}
            className="bg-white/5 border border-subtle rounded px-2 py-1.5 text-xs text-[#e8e8e8] focus:outline-none focus:border-gold/50 w-full"
          />
          <input
            type="text"
            placeholder="Código de rastreo"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="bg-white/5 border border-subtle rounded px-2 py-1.5 text-xs text-[#e8e8e8] focus:outline-none focus:border-gold/50 w-full"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={confirmShipping}
              disabled={saving}
              className="flex-1 btn-gold text-xs py-1.5 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Confirmar envío"}
            </button>
            <button
              onClick={() => setPending(null)}
              className="px-3 py-1.5 rounded-lg text-xs text-muted hover:text-[#e8e8e8] border border-subtle hover:border-gold/30 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
