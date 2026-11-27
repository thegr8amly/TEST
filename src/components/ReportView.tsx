"use client";
import Image from "next/image";
import { bandInfo } from "@/lib/cefr";
import { MODULES, SKILL_LABEL_ES, type SkillKey } from "@/lib/placement";
import type { BaselineRecord } from "@/lib/record";
import { BrandLockup } from "./Brand";
import { CefrScale } from "./CefrScale";
import { cefrColor, ScoreRing } from "./ScoreRing";

const SKILLS: { k: SkillKey; en: string }[] = [
  { k: "reading", en: "Reading" },
  { k: "listening", en: "Listening" },
  { k: "writing", en: "Writing" },
  { k: "speaking", en: "Speaking" },
];
const METHOD: Record<string, string> = { "irt-eap": "Adaptativo · IRT", "ai-rubric": "Rúbrica MCER · IA", heuristic: "Automática provisional", none: "Pendiente" };
const STATUS: Record<string, { t: string; c: string }> = {
  scored: { t: "Calificado", c: "bg-sdg-green/10 text-sdg-green" },
  provisional: { t: "Provisional", c: "bg-gold-100 text-[#9a6200]" },
  pending_review: { t: "Revisión docente", c: "bg-sdg-red/10 text-sdg-red" },
};

export function ReportView({ rec, admin = false, adminKey }: { rec: BaselineRecord; admin?: boolean; adminKey?: string }) {
  const band = bandInfo(rec.overall.cefr);
  const date = new Date(rec.completedAt).toLocaleDateString("es-DO", { day: "2-digit", month: "long", year: "numeric" });
  const mod = MODULES.find((m) => m.id === rec.placement.moduleId);

  const download = () => {
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `INTER-placement-${rec.id}.json`;
    a.click();
  };

  return (
    <div className="min-h-dvh bg-mist print:bg-white">
      {/* toolbar */}
      <div className="no-print sticky top-0 z-30 border-b border-line bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <BrandLockup />
          <div className="flex gap-2">
            <button onClick={download} className="rounded-xl px-4 py-2 text-sm font-semibold text-navy ring-1 ring-line hover:bg-mist">JSON</button>
            <button onClick={() => window.print()} className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-white hover:bg-navy-700">Descargar PDF</button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 print:max-w-none print:p-0">
        {/* ── CERTIFICATE HEADER ─────────────────────── */}
        <section className="relative overflow-hidden rounded-[2rem] bg-navy text-white shadow-2xl shadow-navy/20 print:rounded-2xl">
          <div className="grid-bg absolute inset-0" />
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-royal/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative grid gap-8 p-8 sm:p-12 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <Image src="/brand/inter-wordmark-white.png" alt="INTER" width={900} height={240} className="h-10 w-auto" />
              <span className="mt-6 inline-block rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-navy-950">Reporte de ubicación · MCER</span>
              <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{rec.candidate.fullName}</h1>
              <p className="mt-2 text-sm text-white/60">completó el INTER Placement Test y obtuvo el nivel:</p>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs text-white/60">
                <span>Fecha: <strong className="text-white">{date}</strong></span>
                {rec.candidate.organization && <span>Institución: <strong className="text-white">{rec.candidate.organization}</strong></span>}
                {rec.candidate.studentId && <span>ID: <strong className="text-white">{rec.candidate.studentId}</strong></span>}
                <span>Código: <strong className="font-mono text-white">{rec.id}</strong></span>
              </div>
            </div>
            <div className="relative mx-auto flex aspect-square w-64 items-center justify-center">
              <Image src="/brand/inter-emblem.png" alt="" fill sizes="256px" className="object-contain opacity-25" />
              <div className="glass-dark relative flex h-44 w-44 flex-col items-center justify-center rounded-full ring-4 ring-gold/60">
                <span className="font-display text-6xl font-extrabold tabular-nums">{rec.overall.score}</span>
                <span className="text-xs text-white/50">/100</span>
                <span className="mt-1 font-display text-xl font-extrabold text-gold">{rec.overall.cefr} <span className="text-sm font-semibold text-white">{band.es}</span></span>
              </div>
            </div>
          </div>
          <div className="sdg-bar h-1.5" />
        </section>

        {/* ── SKILLS ────────────────────────────────── */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-line sm:p-10">
          <h2 className="font-display text-xl font-extrabold text-navy">Resultados por habilidad</h2>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            {SKILLS.map(({ k, en }) => {
              const s = rec.skills[k];
              return (
                <div key={k} className="flex flex-col items-center">
                  <ScoreRing score={s.score} cefr={s.cefr} size={128} label={en} sub={s.cefr ? `${s.cefr} · ${bandInfo(s.cefr).es}` : SKILL_LABEL_ES[k]} />
                  <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS[s.status].c}`}>{STATUS[s.status].t}</span>
                  <span className="mt-1 text-[10px] text-slate-400">{METHOD[s.method]}{s.sem ? ` · ±${Math.round(s.sem)}` : ""}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-10">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Entendiendo los resultados</div>
            <CefrScale active={rec.overall.cefr} />
            <p className="mt-4 text-center text-xs text-slate-500">
              El nivel global es el promedio de las habilidades calificadas ({rec.overall.skillsCounted.length}/4). Evaluación diagnóstica interna alineada a los descriptores del MCER; no es una certificación externa.
            </p>
          </div>
        </section>

        {/* ── PROFILE + PLACEMENT ───────────────────── */}
        <section className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-line sm:p-8">
            <h2 className="font-display text-lg font-extrabold text-navy">Perfil de habilidades</h2>
            <div className="relative mt-6 space-y-5">
              {SKILLS.map(({ k, en }) => {
                const s = rec.skills[k];
                return (
                  <div key={k}>
                    <div className="mb-1.5 flex justify-between text-sm"><span className="font-semibold text-navy">{en}</span><span className="tabular-nums text-slate-500">{s.score ?? "—"} {s.cefr && <b style={{ color: cefrColor(s.cefr) }}>{s.cefr}</b>}</span></div>
                    <div className="relative h-3 rounded-full bg-mist ring-1 ring-line">
                      {[20, 30, 40, 50, 60, 70].map((t) => <span key={t} className="absolute top-0 h-full w-px bg-line" style={{ left: `${t}%` }} />)}
                      <div className="h-full rounded-full" style={{ width: `${s.score ?? 0}%`, background: cefrColor(s.cefr) }} />
                    </div>
                  </div>
                );
              })}
              <div className="pointer-events-none absolute -bottom-2 top-0 w-0.5 bg-navy/60" style={{ left: `${rec.overall.score}%` }} title="Promedio" />
            </div>
            <div className="mt-4 flex justify-between text-[10px] text-slate-400"><span>A0</span><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span></div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold-100 to-white p-6 shadow-xl shadow-navy/5 ring-1 ring-gold/40 sm:p-8">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6200]">Ubicación recomendada</div>
            <div className="mt-3 font-display text-3xl font-extrabold text-navy">{rec.placement.moduleName}</div>
            <div className="mt-1 text-sm text-slate-600">Programa {rec.placement.program} · Meta MCER {rec.placement.cefrTarget}</div>
            {mod && <p className="mt-4 text-sm text-slate-600">{mod.description}</p>}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {MODULES.map((m) => <span key={m.id} className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${m.id === rec.placement.moduleId ? "bg-navy text-gold" : "bg-white text-slate-400 ring-1 ring-line"}`}>{m.name}</span>)}
            </div>
            {rec.placement.focusAreas.length > 0 && (
              <p className="mt-5 text-sm text-navy"><strong>Áreas de enfoque:</strong> {rec.placement.focusAreas.map((f) => SKILL_LABEL_ES[f]).join(", ")}.</p>
            )}
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">Recomendación orientativa; la coordinación académica valida la asignación final.</p>
          </div>
        </section>

        {/* ── FEEDBACK ──────────────────────────────── */}
        {(["writing", "speaking"] as const).some((k) => rec.skills[k].assessment || rec.skills[k].note) && (
          <section className="print-break mt-6 grid gap-6 md:grid-cols-2">
            {(["writing", "speaking"] as const).map((k) => {
              const s = rec.skills[k];
              const a = s.assessment;
              return (
                <div key={k} className="rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-line sm:p-8">
                  <h2 className="font-display text-lg font-extrabold text-navy">{k === "writing" ? "Writing" : "Speaking"} · retroalimentación</h2>
                  {s.note && <p className="mt-3 rounded-2xl bg-mist p-3 text-xs text-slate-600">{s.note}</p>}
                  {a && (
                    <>
                      <table className="mt-5 w-full text-sm">
                        <tbody>
                          {a.criteria.map((c) => (
                            <tr key={c.name} className="border-b border-line last:border-0">
                              <td className="py-2.5 pr-2 align-top"><div className="font-semibold text-navy">{c.name}</div><div className="text-xs text-slate-500">{c.comment_es}</div></td>
                              <td className="py-2.5 text-right align-top"><span className="rounded-md px-2 py-0.5 font-display text-xs font-bold text-white" style={{ background: cefrColor(c.cefr) }}>{c.cefr}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div><div className="text-xs font-bold uppercase tracking-wider text-sdg-green">Fortalezas</div><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{a.strengths_es.map((t) => <li key={t}>• {t}</li>)}</ul></div>
                        <div><div className="text-xs font-bold uppercase tracking-wider text-sdg-orange">Por mejorar</div><ul className="mt-2 space-y-1.5 text-xs text-slate-600">{a.improvements_es.map((t) => <li key={t}>• {t}</li>)}</ul></div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ── ELR BASELINE ─────────────────────────── */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-line sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold text-navy">Línea base · Executive Learning Report</h2>
              <p className="text-xs text-slate-500">Medición T0 — punto de partida de la curva de aprendizaje en el Campus Virtual.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${rec.placement.reviewRequired ? "bg-gold-100 text-[#9a6200]" : "bg-sdg-green/10 text-sdg-green"}`}>{rec.placement.reviewRequired ? "Monitoring" : "On Track"}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat l="Baseline MCER" v={rec.elr.baselineCefr} />
            {SKILLS.map(({ k, en }) => <Stat key={k} l={`${en} T0`} v={rec.elr.skills[k] ?? "—"} />)}
          </div>
          {rec.elr.alerts.length > 0 && (
            <ul className="mt-5 space-y-2">
              {rec.elr.alerts.map((a, i) => (
                <li key={i} className={`flex gap-3 rounded-2xl px-4 py-3 text-sm ${a.severity === "critical" ? "bg-sdg-red/10 text-sdg-red" : a.severity === "warning" ? "bg-gold-100 text-[#7a4d00]" : "bg-mist text-slate-600"}`}>
                  <span className="font-mono text-[10px] font-bold uppercase opacity-70">{a.code}</span>{a.message}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-slate-400">{rec.placement.rationale}</p>
        </section>

        {admin && <AdminDetail rec={rec} adminKey={adminKey} />}

        <footer className="mt-10 flex flex-col items-center gap-2 pb-10 text-center text-xs text-slate-400">
          <Image src="/brand/inter-emblem.png" alt="" width={36} height={36} />
          Instituto Interamericano de Lenguas · INTER Placement Test v{rec.test.version}
          {!rec.persisted && <span className="no-print text-sdg-orange">Este reporte solo está guardado en este navegador. Descárgalo en PDF o JSON.</span>}
        </footer>
      </div>
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string | number }) {
  return (
    <div className="rounded-2xl bg-mist px-4 py-3 ring-1 ring-line">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{l}</div>
      <div className="font-display text-2xl font-extrabold text-navy tabular-nums">{v}</div>
    </div>
  );
}

function AdminDetail({ rec, adminKey }: { rec: BaselineRecord; adminKey?: string }) {
  return (
    <section className="print-break mt-6 space-y-6 rounded-3xl bg-white p-6 ring-1 ring-line sm:p-8">
      <h2 className="font-display text-lg font-extrabold text-navy">Evidencias (solo administración)</h2>
      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 sm:grid-cols-5">
        <Stat l="Duración" v={`${Math.round(rec.durationSec / 60)} min`} />
        <Stat l="Cambios de pestaña" v={rec.integrity.tabSwitches} />
        <Stat l="Salidas de ventana" v={rec.integrity.focusLosses ?? 0} />
        <Stat l="Salidas pantalla compl." v={rec.integrity.fullscreenExits ?? 0} />
        <Stat l="Capturas bloqueadas" v={rec.integrity.screenshotAttempts ?? 0} />
        <Stat l="Copiar bloqueado" v={rec.integrity.copyAttempts ?? 0} />
        <Stat l="Pegar bloqueado" v={rec.integrity.pasteAttempts} />
        <Stat l="Imprimir" v={rec.integrity.printAttempts ?? 0} />
        <Stat l="DevTools" v={rec.integrity.devtoolsAttempts ?? 0} />
        <Stat l="ASR navegador" v={rec.integrity.speechRecognition ? "Sí" : "No"} />
      </div>
      <div>
        <h3 className="font-display font-bold text-navy">Reading / Listening</h3>
        <p className="mt-1 text-xs text-slate-500">Ruta Reading: {rec.responses.readingRoute.join(" → ")} · {rec.skills.reading.correct}/{rec.skills.reading.total} correctas</p>
        <p className="text-xs text-slate-500">Ruta Listening: {rec.responses.listeningRoute.join(" → ")} · {rec.skills.listening.correct}/{rec.skills.listening.total} correctas</p>
      </div>
      {rec.responses.writing.map((w) => (
        <div key={w.taskId}>
          <h3 className="font-display font-bold text-navy">Writing {w.taskId} · {w.words} palabras</h3>
          <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-mist p-4 text-sm text-slate-700">{w.text || "(vacío)"}</p>
        </div>
      ))}
      {rec.responses.speaking.map((s) => (
        <div key={s.taskId}>
          <h3 className="font-display font-bold text-navy">Speaking {s.taskId} · {s.durationSec}s · ASR {s.asrConfidence?.toFixed(2) ?? "n/d"}</h3>
          {s.audioPath && adminKey && <audio controls preload="none" className="mt-2 w-full" src={`/api/admin/audio?key=${encodeURIComponent(adminKey)}&path=${encodeURIComponent(s.audioPath)}`} />}
          <p className="mt-2 rounded-2xl bg-mist p-4 text-sm italic text-slate-700">{s.transcript || "(sin transcripción)"}</p>
        </div>
      ))}
      {(["writing", "speaking"] as const).map((k) => rec.skills[k].model && <p key={k} className="text-[10px] text-slate-400">{k}: {rec.skills[k].method} · {rec.skills[k].model}</p>)}
    </section>
  );
}
