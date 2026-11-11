import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contáctanos para cotizar tus productos personalizados: sublimación, estampación DTF y personalización. Escríbenos por WhatsApp, Instagram o TikTok.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
