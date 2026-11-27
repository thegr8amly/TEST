"use client";
import Image from "next/image";
import { useState } from "react";
import { bandInfo, CEFR_BANDS } from "@/lib/cefr";
import { MODULES, SKILL_LABEL_ES, type SkillKey } from "@/lib/placement";
import type { BaselineRecord, PublicRecord } from "@/lib/record";
import { BrandLockup } from "./Brand";

const SKILLS: { k: SkillKey; en: string }[] = [
  { k: "reading", en: "Reading" },
  { k: "listening", en: "Listening" },
  { k: "writing", en: "Writing" },
  { k: "speaking", en: "Speaking" },
];
const METHOD: Record<string, string> = { "irt-eap": "Adaptativa · modelo IRT", "ai-rubric": "Rúbrica MCER · asistida por IA", heuristic: "Automática preliminar", none: "Pendiente" };
const STATUS: Record<string, { t: string; c: string; icon: string }> = {
  scored: { t: "Calificado", c: "text-[#2c6e22] bg-sdg-green/10", icon: "✓" },
  provisional: { t: "Provisional", c: "text-[#7a4d00] bg-gold-100", icon: "◐" },
  pending_review: { t: "Revisión docente", c: "text-[#9b1c26] bg-sdg-red/10", icon: "!" },
};
const HATCH = "repeating-linear-gradient(135deg, #132544 0 4px, #5b6b8a 4px 7px)";

/** Position (%) of a score on the 0–100 scale. Bands are uneven (0–20, 21–30 … 71–100). */
const pos = (v: number) => Math.max(0, Math.min(100, v));

function BandAxis() {
  return (
    <div className="relative mt-1 h-4 text-[11px] text-slate-600" aria-hidden>
      {CEFR_BANDS.map((b) => (
        <span key={b.level} className="absolute -translate-x-1/2 font-semibold" style={{ left: `${(b.min + (b.level === "C2" ? 85 : b.max)) / 2}%` }}>{b.level}</span>
      ))}
    </div>
  );
}

function BandTrack({ children, height = "h-3" }: { children?: React.ReactNode; height?: string }) {
  return (
    <div className={`relative ${height} w-full rounded-full bg-mist ring-1 ring-line`}>
      {CEFR_BANDS.slice(0, -1).map((b) => <span key={b.level} aria-hidden className="absolute inset-y-0 w-px bg-line" style={{ left: `${b.max + 0.5}%` }} />)}
      {children}
    </div>
  );
}

function SkillRow({ en, k, s }: { en: string; k: SkillKey; s: PublicRecord["skills"][SkillKey] }) {
  const [hover, setHover] = useState(false);
  const st = STATUS[s.status];
  const sem = s.sem ?? 0;
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[130px_1fr_150px]">
      <div>
        <div className="font-display text-sm font-bold text-navy">{en}</div>
        <div className="text-xs text-slate-600">{SKILL_LABEL_ES[k]}</div>
      </div>
      <div
        className="relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-royal"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        {...(s.score !== null
          ? { role: "meter", tabIndex: 0, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": s.score, "aria-label": en, "aria-valuetext": `${s.score} de 100, nivel ${s.cefr}${sem ? `, margen ±${Math.round(sem)}` : ""}, ${st.t}` }
          : { role: "img", "aria-label": `${en}: pendiente de revisión docente` })}
      >
        <BandTrack>
          {s.score !== null && (
            <>
              <div className="absolute inset-y-0 left-0 rounded-r-[4px]" style={{ width: `${pos(s.score)}%`, background: s.status === "scored" ? "#132544" : HATCH }} />
              {sem > 0 && (
                <span aria-hidden className="absolute top-1/2 h-4 -translate-y-1/2 border-x-2 border-gold" style={{ left: `${pos(s.score - sem)}%`, width: `${pos(s.score + sem) - pos(s.score - sem)}%` }}>
                  <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-gold" />
                </span>
              )}
            </>
          )}
        </BandTrack>
        {hover && s.score !== null && (
          <div role="tooltip" className="pointer-events-none absolute -top-11 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs text-white shadow-lg" style={{ left: `${pos(s.score)}%` }}>
            {en}: <strong>{s.score}</strong>/100 · {s.cefr}{sem ? ` · ±${Math.round(sem)}` : ""}
          </div>
        )}
      </div>
      <div className="col-start-2 flex items-center gap-2 sm:col-start-3 sm:justify-end">
        <span className="font-display text-lg font-extrabold tabular-nums text-navy">{s.score ?? "—"}</span>
        {s.cefr && <span className="rounded-md bg-navy px-1.5 py-0.5 font-display text-xs font-bold text-white">{s.cefr}</span>}
        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${st.c}`}><span aria-hidden>{st.icon} </span>{st.t}</span>
      </div>
    </div>
  );
}

export function ReportView({ rec, evidence }: { rec: PublicRecord; evidence?: BaselineRecord }) {
  const band = bandInfo(rec.overall.cefr);
  const date = new Date(rec.completedAt).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
  const mod = MODULES.find((m) => m.id === rec.placement.moduleId);
  const provisional = rec.placement.reviewRequired || SKILLS.some(({ k }) => rec.skills[k].status !== "scored");
  const qualitative = (["writing", "speaking"] as const).filter((k) => rec.skills[k].assessment);

  const download = () => {
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `INTER-placement-${rec.id}.json`;
    a.click();
  };

  return (
    <div className="min-h-dvh bg-mist print:bg-white">
      <div className="no-print sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <BrandLockup />
          <div className="flex gap-2">
            <button onClick={download} className="min-h-10 rounded-lg border border-line px-4 text-sm font-semibold text-navy hover:border-navy/40 focus-visible:outline-2 focus-visible:outline-royal">Datos (JSON)</button>
            <button onClick={() => window.print()} className="min-h-10 rounded-lg bg-navy px-4 text-sm font-semibold text-white hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal">Descargar PDF</button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-8 print:max-w-none print:space-y-4 print:p-0">
        {/* ── Header ─────────────────────────────────────── */}
        <section className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-navy px-6 py-5 text-white sm:px-8">
            <Image src="/brand/inter-wordmark-white.png" alt="INTER · Instituto Interamericano de Lenguas" width={900} height={240} className="h-9 w-auto" />
            <div className="text-right text-xs text-white/80">
              <div className="font-semibold uppercase tracking-[0.14em] text-gold">Perfil lingüístico</div>
              INTER Placement Test · v{rec.ids?.assessmentVersion ?? rec.test.version}
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <h1 className="font-display text-2xl font-extrabold leading-tight text-navy sm:text-3xl">{rec.candidate.fullName}</h1>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <dt className="text-slate-600">Fecha</dt><dd className="font-medium text-navy">{date}</dd>
                {rec.candidate.organization && <><dt className="text-slate-600">Institución</dt><dd className="font-medium text-navy">{rec.candidate.organization}</dd></>}
                {rec.candidate.cohort && <><dt className="text-slate-600">Grupo</dt><dd className="font-medium text-navy">{rec.candidate.cohort}</dd></>}
                {rec.candidate.studentId && <><dt className="text-slate-600">ID estudiante</dt><dd className="font-medium text-navy">{rec.candidate.studentId}</dd></>}
                <dt className="text-slate-600">Código</dt><dd className="font-mono text-[13px] text-navy">{rec.id}</dd>
              </dl>
            </div>
            <div className="rounded-xl border border-line bg-mist p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Nivel global MCER</div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-display text-5xl font-extrabold text-navy">{rec.overall.cefr}</span>
                <span className="font-display text-lg font-bold text-navy">{band.es}</span>
              </div>
              <div className="mt-1 text-sm text-slate-700">Índice <strong className="tabular-nums">{rec.overall.score}</strong>/100 · promedio de {rec.overall.skillsCounted.length} de 4 habilidades</div>
              {provisional && <div className="mt-3 rounded-lg bg-gold-100 px-3 py-2 text-xs font-medium text-[#5c3b00]"><span aria-hidden>◐ </span>Resultado provisional: una o más habilidades requieren revisión docente.</div>}
            </div>
          </div>
          <div className="border-t border-line px-6 py-5 sm:px-8">
            <div className="mb-2 text-xs font-semibold text-slate-600">Escala INTER 0–100 · bandas MCER</div>
            <BandTrack height="h-4">
              <span aria-hidden className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold ring-2 ring-white" style={{ left: `${pos(rec.overall.score)}%` }} />
            </BandTrack>
            <BandAxis />
          </div>
        </section>

        {/* ── Skills profile ─────────────────────────────── */}
        <section className="rounded-2xl border border-line bg-white p-6 sm:p-8" aria-labelledby="perfil">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="perfil" className="font-display text-lg font-extrabold text-navy">Perfil por habilidad</h2>
            <div className="flex flex-wrap gap-4 text-xs text-slate-600" aria-label="Leyenda">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-sm bg-navy" />Calificado</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-sm" style={{ background: HATCH }} />Provisional</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-5 border-x-2 border-gold"><span className="block h-0.5 translate-y-[5px] bg-gold" /></span>Margen de error (±1 EE)</span>
            </div>
          </div>
          <div className="mt-3 divide-y divide-line">
            {SKILLS.map(({ k, en }) => <SkillRow key={k} k={k} en={en} s={rec.skills[k]} />)}
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-x-4 sm:grid-cols-[130px_1fr_150px]"><span /><BandAxis /></div>
          <ul className="mt-4 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
            {SKILLS.map(({ k, en }) => <li key={k}><strong className="text-navy">{en}:</strong> {METHOD[rec.skills[k].method]}{rec.skills[k].note ? ` — ${rec.skills[k].note}` : ""}</li>)}
          </ul>
        </section>

        {/* ── Strengths & areas ──────────────────────────── */}
        <section className="rounded-2xl border border-line bg-white p-6 sm:p-8 print:break-inside-avoid" aria-labelledby="fortalezas">
          <h2 id="fortalezas" className="font-display text-lg font-extrabold text-navy">Fortalezas y áreas de mejora</h2>
          {qualitative.length === 0 ? (
            <p className="mt-2 text-sm text-slate-700">La retroalimentación cualitativa de Writing y Speaking estará disponible tras la revisión docente. Reading y Listening se reportan solo con puntuación y nivel.</p>
          ) : (
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              {qualitative.map((k) => {
                const a = rec.skills[k].assessment!;
                return (
                  <div key={k}>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-royal">{k === "writing" ? "Writing" : "Speaking"}</h3>
                    <table className="mt-2 w-full text-sm">
                      <caption className="sr-only">Criterios de {k}</caption>
                      <tbody>
                        {a.criteria.map((c) => (
                          <tr key={c.name} className="border-b border-line last:border-0">
                            <th scope="row" className="py-2 pr-2 text-left align-top font-normal"><div className="font-semibold text-navy">{c.name}</div><div className="text-xs text-slate-600">{c.comment_es}</div></th>
                            <td className="py-2 text-right align-top"><span className="rounded-md bg-navy px-1.5 py-0.5 font-display text-xs font-bold text-white">{c.cefr}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div><div className="text-xs font-bold uppercase tracking-wider text-[#2c6e22]">Fortalezas</div><ul className="mt-1.5 space-y-1 text-sm text-slate-700">{a.strengths_es.map((t) => <li key={t}>· {t}</li>)}</ul></div>
                      <div><div className="text-xs font-bold uppercase tracking-wider text-[#7a4d00]">Por desarrollar</div><ul className="mt-1.5 space-y-1 text-sm text-slate-700">{a.improvements_es.map((t) => <li key={t}>· {t}</li>)}</ul></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Placement ─────────────────────────────────── */}
        <section className="rounded-2xl border border-line bg-white p-6 sm:p-8 print:break-inside-avoid" aria-labelledby="ubicacion">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="ubicacion" className="text-xs font-bold uppercase tracking-[0.14em] text-royal">Módulo INTER recomendado</h2>
              <div className="mt-1 font-display text-3xl font-extrabold text-navy">{rec.placement.moduleName}</div>
              <div className="text-sm text-slate-700">Programa {rec.placement.program} · meta MCER {rec.placement.cefrTarget}{rec.placement.provisionalModuleName ? " · nombre de módulo provisional" : ""}</div>
            </div>
          </div>
          {mod && <p className="mt-3 max-w-2xl text-sm text-slate-700">{mod.description}</p>}
          <ol className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-6" aria-label="Ruta de módulos INTER">
            {MODULES.map((m) => {
              const on = m.id === rec.placement.moduleId;
              return (
                <li key={m.id} aria-current={on ? "true" : undefined} className={`rounded-lg border px-2.5 py-2 text-xs ${on ? "border-navy bg-navy text-white" : "border-line text-slate-700"}`}>
                  <div className={`font-semibold ${on ? "text-gold" : "text-navy"}`}>{m.cefrTarget}</div>
                  {m.name}
                </li>
              );
            })}
          </ol>
          {rec.placement.focusAreas.length > 0 && <p className="mt-4 text-sm text-navy"><strong>Áreas de enfoque:</strong> {rec.placement.focusAreas.map((f) => SKILL_LABEL_ES[f]).join(", ")}.</p>}
          <p className="mt-3 text-xs text-slate-600">{rec.placement.rationale} Recomendación orientativa: la coordinación académica valida la asignación final.</p>
        </section>

        {/* ── ELR baseline (table view of the chart data) ── */}
        <section className="rounded-2xl border border-line bg-white p-6 sm:p-8 print:break-inside-avoid" aria-labelledby="t0">
          <h2 id="t0" className="font-display text-lg font-extrabold text-navy">Línea base T0 · Executive Learning Report</h2>
          <p className="mt-1 text-sm text-slate-600">Punto de partida de la curva de aprendizaje en INTERclassrooms. Las mediciones posteriores (T1, T2…) se comparan con estos valores.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead><tr className="border-b border-line text-left text-xs uppercase tracking-wider text-slate-600"><th scope="col" className="py-2 font-semibold">Habilidad</th><th scope="col" className="py-2 font-semibold">T0 (0–100)</th><th scope="col" className="py-2 font-semibold">MCER</th><th scope="col" className="py-2 font-semibold">Estado</th></tr></thead>
              <tbody>
                {SKILLS.map(({ k, en }) => (
                  <tr key={k} className="border-b border-line">
                    <th scope="row" className="py-2 text-left font-semibold text-navy">{en}</th>
                    <td className="py-2 tabular-nums text-slate-800">{rec.elr.skills[k] ?? "—"}{rec.skills[k].sem ? <span className="text-slate-600"> ±{Math.round(rec.skills[k].sem!)}</span> : null}</td>
                    <td className="py-2 text-slate-800">{rec.skills[k].cefr ?? "—"}</td>
                    <td className="py-2 text-slate-800">{STATUS[rec.skills[k].status].t}</td>
                  </tr>
                ))}
                <tr><th scope="row" className="py-2 text-left font-bold text-navy">Global</th><td className="py-2 font-bold tabular-nums text-navy">{rec.overall.score}</td><td className="py-2 font-bold text-navy">{rec.elr.baselineCefr}</td><td className="py-2 text-slate-800">{provisional ? "Provisional" : "Calificado"}</td></tr>
              </tbody>
            </table>
          </div>
          {rec.elr.alerts.length > 0 && (
            <ul className="mt-4 space-y-2">
              {rec.elr.alerts.map((a, i) => (
                <li key={i} className={`rounded-lg border px-3 py-2 text-sm ${a.severity === "critical" ? "border-sdg-red/40 bg-sdg-red/5 text-[#9b1c26]" : a.severity === "warning" ? "border-gold/60 bg-gold-100 text-[#5c3b00]" : "border-line bg-mist text-slate-700"}`}>
                  <span aria-hidden>{a.severity === "critical" ? "! " : a.severity === "warning" ? "▲ " : "i "}</span>{a.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 text-xs leading-relaxed text-slate-600 sm:p-8">
          <h2 className="font-display text-sm font-bold text-navy">Nota metodológica</h2>
          <p className="mt-2">Reading y Listening se califican con un modelo de respuesta al ítem (IRT) sobre un recorrido adaptativo; el margen indicado es ±1 error estándar. Writing y Speaking se califican con una rúbrica alineada a los descriptores del MCER y quedan sujetos a revisión docente cuando se marcan como provisionales. Esta es una evaluación diagnóstica interna de INTER, alineada conceptualmente al MCER; no es una certificación oficial ni ha sido sometida aún a una validación psicométrica formal.</p>
        </section>

        {evidence && <AdminEvidence rec={evidence} />}

        <footer className="flex flex-col items-center gap-2 pb-6 text-center text-xs text-slate-600">
          <Image src="/brand/inter-emblem.png" alt="" width={32} height={32} />
          Instituto Interamericano de Lenguas · INTER Placement Test v{rec.ids?.assessmentVersion ?? rec.test.version}
          {!rec.persisted && <span className="no-print text-[#9b1c26]">Este reporte solo está guardado en este navegador. Descárgalo en PDF.</span>}
        </footer>
      </main>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-mist px-3 py-2">
      <div className="text-[11px] font-semibold text-slate-600">{l}</div>
      <div className="font-display text-lg font-extrabold tabular-nums text-navy">{v}</div>
    </div>
  );
}

function AdminEvidence({ rec }: { rec: BaselineRecord }) {
  const ig = rec.integrity;
  return (
    <section className="no-print space-y-6 rounded-2xl border-2 border-dashed border-royal/40 bg-white p-6 sm:p-8" aria-labelledby="evid">
      <div>
        <h2 id="evid" className="font-display text-lg font-extrabold text-navy">Evidencias · solo administración</h2>
        <p className="text-xs text-slate-600">Visible únicamente con sesión de administrador. No se incluye en el reporte del candidato.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat l="Duración" v={`${Math.round(rec.durationSec / 60)} min`} />
        <Stat l="Cambios de pestaña" v={ig.tabSwitches} />
        <Stat l="Salidas de ventana" v={ig.focusLosses ?? 0} />
        <Stat l="Salidas pantalla compl." v={ig.fullscreenExits ?? 0} />
        <Stat l="Capturas bloqueadas" v={ig.screenshotAttempts ?? 0} />
        <Stat l="Copiar bloqueado" v={ig.copyAttempts ?? 0} />
        <Stat l="Pegar bloqueado" v={ig.pasteAttempts} />
        <Stat l="Imprimir / DevTools" v={(ig.printAttempts ?? 0) + (ig.devtoolsAttempts ?? 0)} />
        <Stat l="Reanudaciones" v={ig.sessionResumes ?? 0} />
        <Stat l="ASR navegador" v={ig.speechRecognition ? "Sí" : "No"} />
      </div>
      {rec.ids && (
        <dl className="grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
          {Object.entries({ ...rec.ids, ...(rec.scoring ?? {}), period: rec.period }).map(([k, v]) => v ? <div key={k} className="flex gap-2"><dt className="w-36 text-slate-600">{k}</dt><dd className="font-mono text-navy">{String(v)}</dd></div> : null)}
        </dl>
      )}
      <div className="text-sm text-slate-700">
        <p>Ruta Reading: {rec.responses.readingRoute.join(" → ") || "—"} · {rec.skills.reading.correct}/{rec.skills.reading.total} correctas</p>
        <p>Ruta Listening: {rec.responses.listeningRoute.join(" → ") || "—"} · {rec.skills.listening.correct}/{rec.skills.listening.total} correctas</p>
      </div>
      {rec.responses.writing.map((w) => (
        <div key={w.taskId}>
          <h3 className="font-display text-sm font-bold text-navy">Writing {w.taskId} · {w.words} palabras</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-mist p-4 text-sm text-slate-800">{w.text || "(vacío)"}</p>
        </div>
      ))}
      {rec.responses.speaking.map((s) => (
        <div key={s.taskId}>
          <h3 className="font-display text-sm font-bold text-navy">Speaking {s.taskId} · {s.durationSec}s · ASR {s.asrConfidence?.toFixed(2) ?? "n/d"}</h3>
          {s.audioPath && <audio controls preload="none" className="mt-2 w-full" src={`/api/admin/audio?path=${encodeURIComponent(s.audioPath)}`} />}
          <p className="mt-2 rounded-lg bg-mist p-4 text-sm italic text-slate-800">{s.transcript || "(sin transcripción)"}</p>
        </div>
      ))}
    </section>
  );
}
