"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReportView } from "@/components/ReportView";
import type { PublicRecord } from "@/lib/record";

export default function Page() {
  const [rec, setRec] = useState<PublicRecord | null | undefined>(undefined);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("inter-ipt-last-result");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available after hydration
      setRec(raw ? JSON.parse(raw) : null);
    } catch {
      setRec(null);
    }
  }, []);
  if (rec === undefined) return null;
  if (!rec)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-500">No hay un reporte guardado en este navegador.</p>
        <Link href="/" className="font-semibold text-navy underline">Volver al inicio</Link>
      </div>
    );
  return <ReportView rec={rec} />;
}
