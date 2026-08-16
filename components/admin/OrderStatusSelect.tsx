"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/pedidos/actions";

const STATUSES = [
  { value: "pending",   label: "Pendiente",  className: "bg-gold-50 text-gold-700" },
  { value: "confirmed", label: "Confirmado", className: "bg-gold-100 text-gold-800" },
  { value: "shipped",   label: "Enviado",    className: "bg-emerald-50 text-emerald-700" },
  { value: "delivered", label: "Entregado",  className: "bg-subtle2 text-body" },
  { value: "cancelled", label: "Cancelado",  className: "bg-red-50 text-red-700" },
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
  currentTrackingCode,
  currentShippingCompany,
  knownCompanies = [],
}: {
  orderId: string;
  currentStatus: string;
  currentTrackingCode?: string | null;
  currentShippingCompany?: string | null;
  knownCompanies?: string[];
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
        className={`border border-subtle px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors disabled:opacity-50 cursor-pointer ${current?.className ?? "text-muted bg-white"}`}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Tracking form — shown when changing to "shipped" */}
      {pending === "shipped" && (
        <div className="bg-white border border-subtle p-3 flex flex-col gap-2 w-64">
          <p className="label-sm">Datos de envío (opcional)</p>
          <input
            type="text"
            list="companies-list"
            placeholder="Transportadora (ej. Servientrega)"
            value={shippingCompany}
            onChange={(e) => setShippingCompany(e.target.value)}
            className="bg-white border border-subtle px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold w-full"
          />
          {knownCompanies.length > 0 && (
            <datalist id="companies-list">
              {knownCompanies.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          )}
          <input
            type="text"
            placeholder="Código de rastreo"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="bg-white border border-subtle px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold w-full"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
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
              className="px-3 py-1.5 text-xs text-muted hover:text-ink border border-subtle hover:border-gold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
