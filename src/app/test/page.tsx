import type { Metadata } from "next";
import TestApp from "@/components/test/TestApp";

export const metadata: Metadata = {
  title: "Evaluación",
  description: "Inicia tu INTER Placement Test: Reading, Listening, Writing y Speaking en unos 60 minutos. Necesitas computadora, audífonos y micrófono.",
  openGraph: { title: "Inicia tu INTER Placement Test", description: "Reading, Listening, Writing y Speaking en unos 60 minutos. Resultado y módulo recomendado al finalizar.", url: "/test" },
  robots: { index: false, follow: true },
};
export default function Page() {
  return <TestApp />;
}
