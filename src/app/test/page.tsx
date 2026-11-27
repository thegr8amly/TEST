import type { Metadata } from "next";
import TestApp from "@/components/test/TestApp";

export const metadata: Metadata = { title: "Evaluación · INTER Placement Test" };
export default function Page() {
  return <TestApp />;
}
