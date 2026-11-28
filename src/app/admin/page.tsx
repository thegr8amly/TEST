import Link from "next/link";
import type { Metadata } from "next";
import { BrandLockup } from "@/components/Brand";
import { adminConfigured, isAdminSession } from "@/lib/admin-auth";
import { CEFR_LEVELS } from "@/lib/cefr";
import { cefrColorStatic } from "@/lib/colors";
import type { BaselineRecord } from "@/lib/record";
import { applyFilter, cohortOf, orgOf, periodOf, type SegmentFilter } from "@/lib/segments";
import { listResults, storageEnabled } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };

type SP = SegmentFilter & { error?: string };

export default async function Admin({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  if (!(await isAdminSession())) return <Login error={!!sp.error} configured={adminConfigured()} />;

  const all = await listResults(1000);
  const opts = (f: (r: BaselineRecord) => string, label: (r: BaselineRecord) => string) => {
    const m = new Map<string, string>();
    for (const r of all) if (f(r)) m.set(f(r), label(r));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  };
  const orgs = opts(orgOf, (r) => r.candidate.organization ?? orgOf(r));
  const cohorts = opts(cohortOf, (r) => r.candidate.cohort ?? cohortOf(r));
  const periods = [...new Set(all.map(periodOf))].sort().reverse();

  const rows = applyFilter(all, sp);
  const dist = CEFR_LEVELS.map((l) => ({ l, n: rows.filter((r) => r.overall.cefr === l).length }));
  const max = Math.max(1, ...dist.map((d) => d.n));
  const avg = (k: "reading" | "listening" | "writing" | "speaking") => {
    const v = rows.map((r) => r.skills[k].score).filter((x): x is number => typeof x === "number");
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
  };
  const exportQs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "error") as [string, string][]).toString();
  const sel = "rounded-lg border border-line bg-white px-3 py-2 text-sm text-navy focus-visible:outline-2 focus-visible:outline-royal";

  return (
    <div className="min-h-dvh bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <BrandLockup />
          <div className="flex items-center gap-2">
            <a href={`/api/admin/export${exportQs ? `?${exportQs}` : ""}`} className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700">Exportar CSV</a>
            <form action="/api/admin/logout" method="post"><button className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-navy">Salir</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {!storageEnabled() && <p className="mb-4 rounded-lg border border-gold/50 bg-gold-100 p-3 text-sm text-navy">Almacenamiento no configurado: conecta un Vercel Blob store para guardar resultados.</p>}

        <form className="flex flex-wrap items-end gap-2" role="search" aria-label="Filtrar resultados">
          <label className="text-xs font-semibold text-slate-600">Buscar<input name="q" defaultValue={sp.q} placeholder="Nombre, correo, ID" className={`${sel} mt-1 block w-56`} /></label>
          <label className="text-xs font-semibold text-slate-600">Institución<select name="org" defaultValue={sp.org ?? ""} className={`${sel} mt-1 block`}><option value="">Todas</option>{orgs.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Cohorte<select name="cohort" defaultValue={sp.cohort ?? ""} className={`${sel} mt-1 block`}><option value="">Todas</option>{cohorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Período<select name="period" defaultValue={sp.period ?? ""} className={`${sel} mt-1 block`}><option value="">Todos</option>{periods.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Nivel<select name="level" defaultValue={sp.level ?? ""} className={`${sel} mt-1 block`}><option value="">Todos</option>{CEFR_LEVELS.map((l) => <option key={l}>{l}</option>)}</select></label>
          <label className="text-xs font-semibold text-slate-600">Estado<select name="status" defaultValue={sp.status ?? ""} className={`${sel} mt-1 block`}><option value="">Todos</option><option value="review">Requiere revisión</option><option value="ok">Sin alertas</option></select></label>
          <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Aplicar</button>
          <Link href="/admin" className="px-2 py-2 text-sm font-semibold text-royal hover:underline">Limpiar</Link>
        </form>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="Resumen">
          <Stat l="Evaluaciones" v={rows.length} />
          <Stat l="Promedio global" v={rows.length ? Math.round(rows.reduce((a, r) => a + r.overall.score, 0) / rows.length) : "—"} />
          <Stat l="Reading · prom." v={avg("reading") ?? "—"} />
          <Stat l="Listening · prom." v={avg("listening") ?? "—"} />
          <Stat l="Writing · prom." v={avg("writing") ?? "—"} />
          <Stat l="Speaking · prom." v={avg("speaking") ?? "—"} />
        </section>
        <section className="mt-3 rounded-xl border border-line bg-white p-4" aria-label="Distribución MCER">
          <div className="text-xs font-semibold text-slate-600">Distribución por nivel global</div>
          <div className="mt-2 flex h-20 items-end gap-2">
            {dist.map((d) => (
              <div key={d.l} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] font-semibold tabular-nums text-slate-600">{d.n}</span>
                <div className="w-full rounded-t" style={{ height: `${(d.n / max) * 44 + 2}px`, background: cefrColorStatic(d.l) }} />
                <span className="text-[11px] font-bold text-slate-600">{d.l}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[960px] text-sm">
            <caption className="sr-only">Resultados del INTER Placement Test</caption>
            <thead className="bg-mist text-left text-xs uppercase tracking-wider text-slate-600">
              <tr>{["Fecha", "Candidato", "Institución · Cohorte", "Global", "R", "L", "W", "S", "Módulo", "Estado", ""].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line hover:bg-mist/60">
                  <td className="px-4 py-3 text-xs text-slate-600">{new Date(r.completedAt).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-3"><div className="font-semibold text-navy">{r.candidate.fullName}</div><div className="text-xs text-slate-600">{r.candidate.email}{r.candidate.studentId ? ` · ${r.candidate.studentId}` : ""}</div></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{[r.candidate.organization, r.candidate.cohort].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-3"><span className="font-display font-extrabold text-navy">{r.overall.score}</span> <span className="rounded px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: cefrColorStatic(r.overall.cefr) }}>{r.overall.cefr}</span></td>
                  {(["reading", "listening", "writing", "speaking"] as const).map((s) => <td key={s} className="px-4 py-3 tabular-nums text-slate-700">{r.skills[s].score ?? "—"}{r.skills[s].status !== "scored" && <span className="ml-0.5 text-sdg-orange" title={r.skills[s].status}>*</span>}</td>)}
                  <td className="px-4 py-3 text-xs font-semibold text-navy">{r.placement.moduleName}</td>
                  <td className="px-4 py-3">{r.placement.reviewRequired ? <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-bold text-[#7a4d00]">Revisar</span> : <span className="rounded-full bg-sdg-green/10 px-2 py-0.5 text-[11px] font-bold text-[#2c6e22]">OK</span>}</td>
                  <td className="px-4 py-3"><Link className="text-xs font-semibold text-royal hover:underline" href={`/report/${r.id}`}>Ver</Link></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-600">No hay evaluaciones con estos filtros.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-600">* Puntuación provisional o pendiente de revisión docente.</p>
      </main>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-white px-4 py-3">
      <div className="text-xs text-slate-600">{l}</div>
      <div className="font-display text-2xl font-extrabold tabular-nums text-navy">{v}</div>
    </div>
  );
}

function Login({ error, configured }: { error: boolean; configured: boolean }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-mist px-4">
      <form action="/api/admin/login" method="post" className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <BrandLockup />
        <h1 className="mt-6 font-display text-xl font-extrabold text-navy">Panel administrativo</h1>
        <p className="mt-1 text-sm text-slate-600">{configured ? "Introduce la clave de administración." : "Configura ADMIN_KEY (mín. 12 caracteres) en Vercel para habilitar el panel."}</p>
        <label htmlFor="key" className="mt-5 block text-xs font-semibold text-slate-600">Clave</label>
        <input id="key" name="key" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-royal" />
        {error && <p role="alert" className="mt-2 text-sm text-sdg-red">Clave incorrecta.</p>}
        <button className="mt-4 w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white hover:bg-navy-700">Entrar</button>
      </form>
    </div>
  );
}
