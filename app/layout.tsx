import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SOCIAL_LINKS,
  WHATSAPP_DISPLAY,
  absoluteUrl,
} from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Sublimación, estampación y personalización`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — sublimación y estampado personalizado`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  formatDetection: { telephone: false },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
      alternateName: "Keshali Design",
      url: SITE_URL,
      logo: absoluteUrl("/logo.png"),
      image: absoluteUrl("/og-image.jpg"),
      description: SITE_DESCRIPTION,
      slogan: SITE_TAGLINE,
      sameAs: SOCIAL_LINKS,
      areaServed: { "@type": "Country", name: "Colombia" },
      knowsAbout: ["Sublimación", "Estampación", "Estampado DTF", "Personalización de productos"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: WHATSAPP_DISPLAY.replace(/\s/g, ""),
        contactType: "customer service",
        areaServed: "CO",
        availableLanguage: "Spanish",
      },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "es-CO",
      publisher: { "@id": absoluteUrl("/#organization") },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={archivo.variable}>
      <body className="bg-bg text-ink antialiased">
        <JsonLd data={organizationLd} />
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
