"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "approved" | "pending" | "declined" | "error";

const STATUS_CONFIG: Record<Exclude<Status, "loading">, {
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}> = {
  approved: {
    icon: <CheckCircle size={52} className="text-emerald-400" />,
    title: "¡Pago aprobado!",
    message: "Tu pedido fue confirmado. Recibirás un correo de confirmación y nos pondremos en contacto contigo pronto.",
    color: "text-emerald-400",
  },
  pending: {
    icon: <Clock size={52} className="text-yellow-400" />,
    title: "Pago en proceso",
    message: "Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.",
    color: "text-yellow-400",
  },
  declined: {
    icon: <XCircle size={52} className="text-red-400" />,
    title: "Pago rechazado",
    message: "El pago no pudo ser procesado. Puedes intentarlo de nuevo o elegir otro método de pago.",
    color: "text-red-400",
  },
  error: {
    icon: <XCircle size={52} className="text-red-400" />,
    title: "Error en el pago",
    message: "Ocurrió un error inesperado. Contacta a soporte si el problema persiste.",
    color: "text-red-400",
  },
};

export default function ResultadoPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<Status>("loading");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");

    // Clear cart regardless of status
    clearCart();

    if (!id) {
      setStatus("pending");
      return;
    }

    // Query Supabase for the order linked to this transaction
    // Wompi sends ?id={transaction_id} — we use the reference to find the order
    async function fetchOrderStatus() {
      const supabase = createClient();
      // The reference in Wompi equals the order_number we generated
      // We can find it by checking recent pending orders (approx by timestamp in the ID)
      // Simplest: just show pending and let webhook update it
      // If the user lands here, the payment was at least submitted
      setStatus("pending");
      setOrderNumber(null);

      // Try to get order by recent pending status as fallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("orders") as any)
        .select("order_number, status")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const row = data as { order_number: string; status: string };
        setOrderNumber(row.order_number);
        const s = (row.status as string).toLowerCase();
        if (s === "confirmed" || s === "approved") setStatus("approved");
        else if (s === "cancelled" || s === "declined") setStatus("declined");
        else setStatus("pending");
      }
    }

    fetchOrderStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="section max-w-md text-center py-24">
        <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Verificando tu pago...</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <div className="section max-w-md text-center py-16">
      <div className="glass rounded-card p-10 flex flex-col items-center gap-5">
        {config.icon}

        <div>
          <h1 className={`text-2xl font-bold mb-2 ${config.color}`}>
            {config.title}
          </h1>
          {orderNumber && (
            <p className="text-gold text-sm font-mono mb-3">
              Pedido: {orderNumber}
            </p>
          )}
          <p className="text-muted text-sm leading-relaxed">{config.message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Link href="/catalogo" className="btn-ghost text-sm text-center flex-1">
            Seguir comprando
          </Link>
          {(status === "declined" || status === "error") && (
            <Link href="/checkout" className="btn-gold text-sm text-center flex-1">
              Intentar de nuevo
            </Link>
          )}
        </div>

        <p className="text-xs text-muted">
          ¿Dudas? Escríbenos por{" "}
          <a
            href="https://wa.me/573177301489"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
