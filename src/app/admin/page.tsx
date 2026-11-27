import Link from "next/link";
import type { Metadata } from "next";
import { BrandLockup } from "@/components/Brand";
import { cefrColorStatic } from "@/lib/colors";
import { isAdmin, listResults, storageEnabled } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel · INTER Placement Test", robots: { index: false } };

export default async function Admin({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  if (!isAdmin(key)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-mist px-4">
        <form className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl ring-1 ring-line">
          <BrandLockup />
          <h1 className="mt-6 font-display text-xl font-extrabold text-navy">Panel administrativo</h1>
          <p className="mt-1 text-sm text-slate-500">{process.env.ADMIN_KEY ? "Introduce la clave de administración." : "Configura la variable ADMIN_KEY en Vercel para habilitar el panel."}</p>
          <input name="key" type="password" className="mt-5 w-full rounded-xl bg-mist px-4 py-3 text-sm ring-1 ring-line outline-none focus:ring-2 focus:ring-navy" placeholder="ADMIN_KEY" />
          <button className="mt-4 w-full rounded-xl bg-navy py-3 text-sm font-bold text-white">Entrar</button>
        </form>
      </div>
    );
  }
  const rows = await listResults(500);
  const k = encodeURIComponent(key!);
  const dist = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"].map((l) => ({ l, n: rows.filter((r) => r.overall.cefr === l).length }));
  const max = Math.max(1, ...dist.map((d) => d.n));
  return (
    <div className="min-h-dvh bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <BrandLockup />
          <a href={`/api/admin/export?key=${k}`} className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white">Exportar CSV (ELR)</a>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {!storageEnabled() && <p className="mb-6 rounded-2xl bg-gold-100 p-4 text-sm text-navy">Almacenamiento no configurado: conecta un Vercel Blob store al proyecto para guardar resultados.</p>}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-line"><div className="text-xs text-slate-400">Evaluaciones</div><div className="font-display text-4xl font-extrabold text-navy">{rows.length}</div></div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-line"><div className="text-xs text-slate-400">Promedio global</div><div className="font-display text-4xl font-extrabold text-navy">{rows.length ? Math.round(rows.reduce((a, r) => a + r.overall.score, 0) / rows.length) : "—"}</div></div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-line sm:col-span-2">
            <div className="text-xs text-slate-400">Distribución MCER</div>
            <div className="mt-2 flex h-16 items-end gap-2">
              {dist.map((d) => (
                <div key={d.l} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-md" style={{ height: `${(d.n / max) * 48 + 2}px`, background: cefrColorStatic(d.l) }} title={`${d.n}`} />
                  <span className="text-[10px] font-bold text-slate-500">{d.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl bg-white ring-1 ring-line">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>{["Fecha", "Estudiante", "Institución / Cohorte", "Global", "R", "L", "W", "S", "Módulo", "Estado", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line hover:bg-mist/50">
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(r.completedAt).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-3"><div className="font-semibold text-navy">{r.candidate.fullName}</div><div className="text-xs text-slate-400">{r.candidate.email}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{[r.candidate.organization, r.candidate.cohort].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3"><span className="font-display font-extrabold text-navy">{r.overall.score}</span> <span className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: cefrColorStatic(r.overall.cefr) }}>{r.overall.cefr}</span></td>
                  {(["reading", "listening", "writing", "speaking"] as const).map((s) => <td key={s} className="px-4 py-3 tabular-nums text-slate-600">{r.skills[s].score ?? "—"}</td>)}
                  <td className="px-4 py-3 text-xs font-semibold text-navy">{r.placement.moduleName}</td>
                  <td className="px-4 py-3">{r.placement.reviewRequired ? <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-[#9a6200]">Revisar</span> : <span className="rounded-full bg-sdg-green/10 px-2 py-0.5 text-[10px] font-bold text-sdg-green">OK</span>}</td>
                  <td className="px-4 py-3"><Link className="text-xs font-semibold text-royal hover:underline" href={`/report/${r.id}?key=${k}`}>Ver</Link></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-400">Aún no hay evaluaciones.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
