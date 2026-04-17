import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kitchy | Conectando Negocios con Clientes",
  description: "Kitchy es la plataforma definitiva para la gestión de ventas, inventario y comunicación directa con tus clientes vía WhatsApp.",
  keywords: ["kitchy", "gestión de negocios", "ventas", "inventario", "whatsapp automation", "barberia", "restaurante"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
