import crypto from "crypto";

const CHECKOUT_URL = "https://checkout.wompi.co/p/";

export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string
): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET!;
  return crypto
    .createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${secret}`)
    .digest("hex");
}

export function buildWompiUrl({
  reference,
  amountInCents,
  redirectUrl,
  customerEmail,
  customerName,
  customerPhone,
}: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}): string {
  const signature = generateIntegritySignature(reference, amountInCents, "COP");

  const params = new URLSearchParams({
    "public-key": process.env.WOMPI_PUBLIC_KEY!,
    currency: "COP",
    "amount-in-cents": amountInCents.toString(),
    reference,
    "redirect-url": redirectUrl,
    "signature:integrity": signature,
  });

  if (customerEmail) params.set("customer-data:email", customerEmail);
  if (customerName) params.set("customer-data:full-name", customerName);
  if (customerPhone) params.set("customer-data:phone-number", customerPhone);

  return `${CHECKOUT_URL}?${params.toString()}`;
}

export function verifyWompiWebhook(body: WompiWebhookBody): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET?.trim();
  if (!secret) {
    console.error("[wompi] WOMPI_EVENTS_SECRET not set");
    return false;
  }

  const { properties, checksum } = body.signature;
  // Cast to Record so we can access any field Wompi sends
  const tx = body.data.transaction as Record<string, unknown>;

  const values = properties.map((prop) => {
    const key = prop.replace("transaction.", "");
    const val = tx[key];
    return val ?? "";
  });

  const str = [...values, body.timestamp, secret].join("");
  const expected = crypto.createHash("sha256").update(str).digest("hex");

  console.log("[wompi] checksum expected:", expected);
  console.log("[wompi] checksum received:", checksum);

  return expected === checksum;
}

export type WompiTransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

export type WompiWebhookBody = {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: WompiTransactionStatus;
      amount_in_cents: number;
      currency: string;
      payment_method_type: string;
      customer_email: string;
    };
  };
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
};
