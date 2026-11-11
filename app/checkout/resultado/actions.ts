"use server";

export type PaymentResult = {
  status: "approved" | "pending" | "declined" | "error";
  orderNumber: string | null;
};

const TRANSACTION_ID = /^[\w-]{1,64}$/;

function wompiApiBase() {
  const isProd = process.env.WOMPI_PUBLIC_KEY?.startsWith("pub_prod_");
  return isProd ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1";
}

// Looks up the transaction Wompi redirected the customer back with. The
// customer only learns their own order number/status — the orders table is
// never read from the browser.
export async function getPaymentResult(transactionId: string): Promise<PaymentResult> {
  if (!TRANSACTION_ID.test(transactionId)) return { status: "error", orderNumber: null };

  try {
    const res = await fetch(`${wompiApiBase()}/transactions/${transactionId}`, { cache: "no-store" });
    if (!res.ok) return { status: "pending", orderNumber: null };

    const body = (await res.json()) as { data?: { reference?: string; status?: string } };
    const tx = body.data;
    if (!tx) return { status: "pending", orderNumber: null };

    const status =
      tx.status === "APPROVED"
        ? "approved"
        : tx.status === "DECLINED" || tx.status === "VOIDED"
        ? "declined"
        : tx.status === "ERROR"
        ? "error"
        : "pending";

    return { status, orderNumber: tx.reference ?? null };
  } catch {
    return { status: "pending", orderNumber: null };
  }
}
