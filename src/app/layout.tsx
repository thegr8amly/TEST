import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["700", "800"], display: "swap" });

const SITE_DESCRIPTION =
  "Evaluación de inglés adaptativa y alineada al MCER: Reading, Listening, Writing y Speaking. Obtén tu perfil lingüístico y el módulo INTER recomendado.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "INTER Placement Test · Descubre tu nivel real de inglés", template: "%s · INTER Placement Test" },
  description: SITE_DESCRIPTION,
  applicationName: "INTER Placement Test",
  icons: { icon: "/brand/icon.png", apple: "/brand/icon.png" },
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: "/",
    siteName: "INTER · Instituto Interamericano de Lenguas",
    title: "INTER Placement Test · Descubre tu nivel real de inglés",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "INTER Placement Test · Descubre tu nivel real de inglés", description: SITE_DESCRIPTION },
};
export const viewport: Viewport = { themeColor: "#132544" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
