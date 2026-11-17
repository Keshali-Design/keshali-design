import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SITE_TAGLINE, WHATSAPP_NUMBER } from "@/lib/site";

export const metadata: Metadata = {
  title: "¿Cómo hacer mi pedido?",
  description:
    "Compra fácil y rápida en Keshali Design: elige tus productos personalizados, revisa tu carrito y envía tu pedido por WhatsApp en 7 sencillos pasos.",
  alternates: { canonical: "/como-hacer-pedido" },
};

const STEPS = [
  {
    emoji: "🔎",
    title: "Explora nuestro catálogo",
    text: "Navega por nuestras categorías y descubre camisetas, blusas, buzos, gorras, tazas y accesorios. Encuentra el producto que más te guste.",
  },
  {
    emoji: "👕",
    title: "Elige tus productos",
    text: "Selecciona los productos de tu preferencia. Consulta los colores, tallas, materiales y diseños disponibles.",
  },
  {
    emoji: "🎨",
    title: "Personaliza a tu gusto",
    text: "Elige el diseño que deseas o cuéntanos tu idea. Personalizamos tus prendas y accesorios mediante sublimación y DTF.",
  },
  {
    emoji: "💰",
    title: "Selecciona tu precio",
    text: "Consulta nuestros precios, según las condiciones de compra de cada producto.",
  },
  {
    emoji: "🛒",
    title: "Revisa tu pedido",
    text: "Abre tu carrito y verifica los productos seleccionados, las cantidades, las tallas y el valor total de tu compra.",
  },
  {
    emoji: "📲",
    title: "Envía tu pedido por WhatsApp",
    text: "Escribe tu nombre y ciudad, y pulsa el botón «Enviar pedido por WhatsApp». Recibiremos tu solicitud con los detalles de tu compra.",
  },
  {
    emoji: "✅",
    title: "Confirmación y pago",
    text: "Confirmaremos la disponibilidad de tus productos, te compartiremos los datos de pago y coordinaremos el envío. ¡Así de fácil!",
  },
];

export default function ComoHacerPedidoPage() {
  return (
    <div className="section max-w-3xl">
      <div className="text-center mb-10">
        <span className="inline-block eyebrow bg-gold-50 border border-gold-300 px-3 py-1 mb-4">Guía rápida</span>
        <h1 className="section-title text-3xl md:text-4xl mb-2">¿Cómo hacer mi pedido?</h1>
        <p className="text-ink font-semibold mb-2">Compra fácil y rápida en KESHALI DESIGN</p>
        <p className="text-body max-w-xl mx-auto leading-relaxed">
          En 7 sencillos pasos puedes elegir tus productos favoritos, personalizarlos y realizar tu pedido por
          WhatsApp. ¡Sin complicaciones!
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="bg-white border border-subtle p-5 flex gap-4 items-start">
            <span
              className="flex-shrink-0 w-10 h-10 rounded-full border border-gold-300 bg-gold-50 text-gold-700 text-xs font-extrabold flex items-center justify-center tabular-nums"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-ink font-bold text-base mb-1">
                <span className="sr-only">Paso {i + 1}: </span>
                <span aria-hidden className="mr-1.5">{step.emoji}</span>
                {step.title}
              </h2>
              <p className="text-body text-sm leading-relaxed">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="text-center mt-10 flex flex-col items-center gap-4">
        <Link href="/catalogo" className="btn-gold">
          Ir al catálogo
        </Link>

        <div className="border-t border-subtle pt-6 mt-2 w-full">
          <p className="text-ink font-semibold mb-1">¿Tienes dudas?</p>
          <p className="text-body text-sm mb-4">
            Estamos para ayudarte. Escríbenos por WhatsApp y recibe asesoría personalizada.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#128C7E] hover:bg-[#0E7A6E] text-white font-extrabold text-[13px] tracking-wide px-6 py-3.5 transition-colors"
          >
            <MessageCircle size={18} />
            Escríbenos por WhatsApp
          </a>
          <p className="text-muted text-xs mt-6">
            <span className="font-bold text-ink">KESHALI DESIGN</span> — {SITE_TAGLINE}.
          </p>
        </div>
      </div>
    </div>
  );
}
