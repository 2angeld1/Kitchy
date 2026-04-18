import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kitchy-gosen.vercel.app/"),
  title: "Kitchy | Conectando Negocios con Clientes",
  description: "Kitchy es la plataforma definitiva para la gestión de ventas, inventario y comunicación directa con tus clientes vía WhatsApp.",
  keywords: ["kitchy", "gestión de negocios", "ventas", "inventario", "whatsapp automation", "barberia", "restaurante"],
  openGraph: {
    title: "Kitchy | Conectando Negocios con Clientes",
    description: "Kitchy es la plataforma definitiva para la gestión de ventas, inventario y comunicación directa con tus clientes vía WhatsApp.",
    url: "https://kitchy-gosen.vercel.app/",
    siteName: "Kitchy",
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitchy | Conectando Negocios con Clientes",
    description: "Kitchy es la plataforma definitiva para la gestión de ventas, inventario y comunicación directa con tus clientes vía WhatsApp.",
  },
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
