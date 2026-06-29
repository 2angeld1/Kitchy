import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kitchy-one.vercel.app/"),
  title: "Vesta | POS Inteligente para tu Negocio",
  description: "Vesta es la plataforma POS inteligente con IA que se adapta a tu negocio: gastronomía, belleza, lavautos, jardinería y frutería en Panamá.",
  keywords: ["vesta", "POS inteligente", "gestión de negocios", "ventas", "inventario", "caitlyn ai", "barberia", "restaurante", "lavautos", "jardineria"],
  openGraph: {
    title: "Vesta | POS Inteligente para tu Negocio",
    description: "Vesta es la plataforma POS inteligente con IA que se adapta a tu negocio: gastronomía, belleza, lavautos, jardinería y frutería en Panamá.",
    url: "https://kitchy-one.vercel.app/",
    siteName: "Vesta",
    locale: "es_PA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vesta | POS Inteligente para tu Negocio",
    description: "Vesta es la plataforma POS inteligente con IA que se adapta a tu negocio: gastronomía, belleza, lavautos, jardinería y frutería en Panamá.",
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
