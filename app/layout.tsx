import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";

export const metadata: Metadata = {
  title: "Keshali Design — Tu esencia en cada diseño",
  description:
    "Productos personalizados de alta calidad: mugs, camisetas, cojines, sudaderas y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-bg text-[#e8e8e8] antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
