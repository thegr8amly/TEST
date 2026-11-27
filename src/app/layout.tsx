import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["700", "800"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: "INTER Placement Test · Instituto Interamericano de Lenguas",
  description: "Evaluación de inglés alineada al MCER (CEFR) en las cuatro habilidades: lectura, comprensión auditiva, escritura y expresión oral.",
  icons: { icon: "/brand/icon.png", apple: "/brand/icon.png" },
  openGraph: { title: "INTER Placement Test", description: "Descubre tu nivel real de inglés en las cuatro habilidades.", images: ["/brand/inter-logo.png"] },
};
export const viewport: Viewport = { themeColor: "#132544" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
