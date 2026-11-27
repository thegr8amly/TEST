"use client";
import { useEffect, useRef, useState } from "react";
import { asrAvailable, speakLines, ttsAvailable } from "./speech";
import { Card, PrimaryButton, type CandidateIn } from "./shared";

// ── Registration ──────────────────────────────────────────────
export function Register({ initial, onSubmit }: { initial?: CandidateIn; onSubmit: (c: CandidateIn) => void }) {
  const [c, setC] = useState<CandidateIn>(initial ?? { fullName: "", email: "" });
  const [consent, setConsent] = useState(false);
  const set = (k: keyof CandidateIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setC({ ...c, [k]: e.target.value });
  const valid = c.fullName.trim().length > 3 && /^\S+@\S+\.\S+$/.test(c.email) && consent;
  const field = "mt-1.5 w-full rounded-xl border-0 bg-mist px-4 py-3 text-sm text-navy ring-1 ring-line outline-none transition focus:bg-white focus:ring-2 focus:ring-navy";
  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <div className="mb-6 text-center">
        <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Paso 1 de 2</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl">Datos del estudiante</h1>
        <p className="mt-2 text-slate-500">Usaremos esta información para tu reporte y tu expediente en el Campus Virtual.</p>
      </div>
      <Card>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit({ ...c, fullName: c.fullName.trim(), email: c.email.trim() }); }}>
          <label className="sm:col-span-2 text-sm font-semibold text-navy">Nombre completo *<input className={field} value={c.fullName} onChange={set("fullName")} autoComplete="name" required /></label>
          <label className="text-sm font-semibold text-navy">Correo electrónico *<input className={field} type="email" value={c.email} onChange={set("email")} autoComplete="email" required /></label>
          <label className="text-sm font-semibold text-navy">Teléfono<input className={field} value={c.phone ?? ""} onChange={set("phone")} autoComplete="tel" /></label>
          <label className="text-sm font-semibold text-navy">ID de estudiante / Cédula<input className={field} value={c.studentId ?? ""} onChange={set("studentId")} /></label>
          <label className="text-sm font-semibold text-navy">Institución / Empresa<input className={field} value={c.organization ?? ""} onChange={set("organization")} placeholder="Ej. INTER Corporate, LMD…" /></label>
          <label className="text-sm font-semibold text-navy">Grupo / Cohorte<input className={field} value={c.cohort ?? ""} onChange={set("cohort")} /></label>
          <label className="text-sm font-semibold text-navy">Objetivo principal
            <select className={field} value={c.purpose ?? ""} onChange={set("purpose")}>
              <option value="">Seleccionar…</option>
              <option>Trabajo / desarrollo profesional</option>
              <option>Atención al cliente / servicio</option>
              <option>Estudios / becas</option>
              <option>Viajes / uso personal</option>
              <option>Certificación / entrevista</option>
            </select>
          </label>
          <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl bg-mist p-4 text-xs leading-relaxed text-slate-600 ring-1 ring-line">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-navy" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            Autorizo a INTER a grabar mis respuestas orales y a procesar mis resultados con fines académicos (ubicación, seguimiento y reportes de progreso). Haré el examen sin ayuda externa.
          </label>
          <div className="sm:col-span-2 flex justify-end"><PrimaryButton type="submit" disabled={!valid}>Continuar</PrimaryButton></div>
        </form>
      </Card>
    </div>
  );
}

// ── System check ──────────────────────────────────────────────
export function SystemCheck({ onReady }: { onReady: () => void }) {
  const [audioOk, setAudioOk] = useState<boolean | null>(null);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [lvl, setLvl] = useState(0);
  const [peak, setPeak] = useState(0);
  const raf = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const tts = typeof window !== "undefined" && ttsAvailable();
  const asr = typeof window !== "undefined" && asrAvailable();

  useEffect(() => () => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); }, []);

  const testMic = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      ctx.createMediaStreamSource(stream.current).connect(an);
      const d = new Uint8Array(an.frequencyBinCount);
      const loop = () => {
        an.getByteTimeDomainData(d);
        let m = 0;
        for (const v of d) m = Math.max(m, Math.abs(v - 128));
        const l = Math.min(1, m / 64);
        setLvl(l);
        setPeak((p) => Math.max(p, l));
        raf.current = requestAnimationFrame(loop);
      };
      loop();
      setMicOk(true);
    } catch {
      setMicOk(false);
    }
  };

  const Row = ({ ok, title, children }: { ok: boolean | null; title: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-4 rounded-2xl bg-mist p-5 ring-1 ring-line sm:flex-row sm:items-center">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ok ? "bg-sdg-green text-white" : ok === false ? "bg-sdg-red text-white" : "bg-white text-slate-400 ring-1 ring-line"}`}>
        {ok ? "✓" : ok === false ? "!" : "•"}
      </span>
      <div className="flex-1"><div className="font-display font-bold text-navy">{title}</div>{children}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <div className="mb-6 text-center">
        <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Paso 2 de 2</div>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl">Prueba técnica</h1>
        <p className="mt-2 text-slate-500">Verifiquemos tu audio y micrófono antes de comenzar.</p>
      </div>
      <Card className="space-y-4">
        <Row ok={audioOk} title="Audio / audífonos">
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <button className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white" onClick={() => speakLines([{ voice: "f", text: "Hello! This is the INTER sound check. If you can hear this clearly, you are ready." }])}>▶ Reproducir prueba</button>
            <span>¿Lo escuchas bien?</span>
            <button className="font-semibold text-sdg-green" onClick={() => setAudioOk(true)}>Sí</button>
            <button className="font-semibold text-sdg-red" onClick={() => setAudioOk(false)}>No</button>
          </div>
          {!tts && <p className="mt-2 text-sm text-sdg-red">Tu navegador no soporta audio sintetizado. Usa Chrome o Edge.</p>}
          {audioOk === false && <p className="mt-2 text-sm text-slate-500">Sube el volumen, revisa tus audífonos e inténtalo de nuevo.</p>}
        </Row>
        <Row ok={micOk && peak > 0.15 ? true : micOk === false ? false : null} title="Micrófono">
          <div className="mt-2 flex items-center gap-3">
            {micOk === null ? (
              <button className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white" onClick={testMic}>Permitir micrófono</button>
            ) : micOk ? (
              <>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-line"><div className="h-full rounded-full bg-gradient-to-r from-sdg-teal to-sdg-green transition-[width] duration-75" style={{ width: `${lvl * 100}%` }} /></div>
                <span className="text-xs text-slate-500">{peak > 0.15 ? "¡Te escuchamos!" : "Di algo en voz alta…"}</span>
              </>
            ) : (
              <p className="text-sm text-sdg-red">Acceso denegado. Habilita el micrófono en la barra de direcciones (ícono 🔒) y recarga.</p>
            )}
          </div>
        </Row>
        <Row ok={asr ? true : false} title="Reconocimiento de voz">
          <p className="mt-1 text-sm text-slate-600">{asr ? "Compatible. Tus respuestas orales se transcribirán automáticamente." : "Tu navegador no transcribe voz. Tu audio se guardará para evaluación docente; para resultados inmediatos usa Google Chrome o Microsoft Edge."}</p>
        </Row>
        <div className="flex gap-3 rounded-2xl bg-navy p-5 text-sm text-white/80">
          <svg className="h-6 w-6 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m5.6-4.4A11.9 11.9 0 0112 2.9 11.9 11.9 0 013.4 5.6 12 12 0 0012 21.1a12 12 0 008.6-15.5z" /></svg>
          <div>
            <div className="font-display font-bold text-white">Examen protegido</div>
            El examen se abre en pantalla completa. Copiar, pegar, imprimir y las capturas de pantalla están bloqueados; si sales de la ventana las preguntas se ocultan. Cada incidente queda registrado en tu reporte y el contenido lleva tu nombre como marca de agua.
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
          <p className="text-xs text-slate-500">Cada sección tiene tiempo límite, con cuenta regresiva visible.</p>
          <PrimaryButton disabled={!audioOk || !micOk} onClick={onReady}>Comenzar el examen</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

// ── Section intro ─────────────────────────────────────────────
const INTROS = {
  reading: { n: 1, t: "Reading", es: "Lectura", time: "20 minutos", pts: ["5 bloques de textos con 3 preguntas cada uno", "La dificultad se adapta a tus respuestas", "No podrás volver a un bloque anterior"] },
  listening: { n: 2, t: "Listening", es: "Comprensión auditiva", time: "15 minutos", pts: ["5 audios con 3 preguntas cada uno", "Puedes escuchar cada audio máximo 2 veces", "Usa audífonos y lee las preguntas antes de reproducir"] },
  writing: { n: 3, t: "Writing", es: "Escritura", time: "25 minutos", pts: ["Tarea 1: correo (60–120 palabras)", "Tarea 2: ensayo de opinión (150–250 palabras)", "Pegar texto está deshabilitado"] },
  speaking: { n: 4, t: "Speaking", es: "Expresión oral", time: "≈ 6 minutos", pts: ["3 tareas orales grabadas", "Tiempo de preparación antes de cada respuesta", "Habla con claridad, en un lugar sin ruido"] },
} as const;

export function SectionIntro({ skill, onStart }: { skill: keyof typeof INTROS; onStart: () => void }) {
  const s = INTROS[skill];
  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <div className="relative overflow-hidden rounded-[2rem] bg-navy p-8 text-white shadow-2xl shadow-navy/30 sm:p-10">
        <img src="/brand/inter-emblem.png" alt="" className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 animate-spin-slow opacity-15" />
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative">
          {s.n > 1 && (
            <div className="mb-6 inline-flex animate-pop items-center gap-2 rounded-full bg-sdg-green/20 px-4 py-1.5 text-sm font-semibold text-[#8ee07f] ring-1 ring-sdg-green/40">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
              ¡Sección completada! Vas muy bien.
            </div>
          )}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`flex h-9 w-9 animate-pop items-center justify-center rounded-full font-display text-xs font-bold ${i < s.n ? "bg-sdg-green text-white" : i === s.n ? "bg-gold text-navy-950 shadow-lg shadow-gold/40 ring-4 ring-gold/25" : "bg-white/5 text-white/30 ring-1 ring-white/10"}`} style={{ animationDelay: `${i * 90}ms` }}>{i < s.n ? "✓" : i}</span>
                {i < 4 && <span className={`h-0.5 w-6 rounded-full sm:w-10 ${i < s.n ? "bg-sdg-green" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
          <div className="mt-7 font-display text-xs font-bold uppercase tracking-[0.25em] text-gold">Sección {s.n} de 4 · {s.time}</div>
          <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight">{s.t}</h1>
          <p className="text-lg text-white/60">{s.es}</p>
          <ul className="mt-6 space-y-3">
            {s.pts.map((p, i) => <li key={p} className="flex animate-rise items-center gap-3 text-white/80" style={{ animationDelay: `${250 + i * 120}ms` }}><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gold/15 text-[11px] font-bold text-gold ring-1 ring-gold/30">{i + 1}</span>{p}</li>)}
          </ul>
          <button onClick={onStart} className="group relative mt-8 overflow-hidden rounded-2xl bg-gold px-8 py-4 font-display font-bold text-navy-950 shadow-xl shadow-gold/20 transition hover:-translate-y-0.5 hover:bg-gold-300"><span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent" /><span className="relative">Iniciar {s.t} →</span></button>
        </div>
      </div>
    </div>
  );
}

// ── Submitting ────────────────────────────────────────────────
const MSGS = ["Calificando Reading con modelo IRT…", "Calificando Listening…", "Analizando tu escritura con rúbrica MCER…", "Evaluando tu expresión oral…", "Calculando tu nivel global…", "Buscando tu módulo INTER ideal…", "Generando tu reporte…"];
function Confetti() {
  const colors = ["#faac26", "#132544", "#d13b45", "#43a535", "#0a79b8", "#31d0a1", "#cf4b77", "#eb7419"];
  const pieces = Array.from({ length: 70 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((i) => (
        <span
          key={i}
          className="absolute top-0 block rounded-sm"
          style={{
            left: `${(i * 137) % 100}%`,
            width: 6 + (i % 4) * 2,
            height: 10 + (i % 3) * 4,
            background: colors[i % colors.length],
            animation: `confetti-fall ${2.6 + (i % 7) * 0.35}s cubic-bezier(0.2,0.6,0.4,1) ${(i % 10) * 0.12}s both`,
            ["--dx" as string]: `${((i * 53) % 160) - 80}px`,
          }}
        />
      ))}
    </div>
  );
}

export function Submitting({ error, onRetry }: { error?: string | null; onRetry: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => Math.min(MSGS.length - 1, x + 1)), 3500); return () => clearInterval(id); }, []);
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center animate-rise">
      {!error && <Confetti />}
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-line border-t-gold" style={{ animationDuration: "1.4s" }} />
        <div className="absolute inset-4 animate-spin rounded-full border-4 border-transparent border-b-navy" style={{ animationDuration: "2.2s", animationDirection: "reverse" }} />
        <img src="/brand/inter-emblem.png" alt="" className="absolute inset-9 h-22 w-22 animate-spin-slow" />
      </div>
      {error ? (
        <>
          <h2 className="mt-10 font-display text-2xl font-extrabold text-navy">No pudimos enviar tus resultados</h2>
          <p className="mt-2 text-slate-500">{error} Tus respuestas están guardadas en este navegador.</p>
          <PrimaryButton className="mt-6" onClick={onRetry}>Reintentar envío</PrimaryButton>
        </>
      ) : (
        <>
          <h2 className="mt-10 font-display text-2xl font-extrabold text-navy">¡Examen completado!</h2>
          <p key={i} className="mt-3 animate-rise text-slate-500">{MSGS[i]}</p>
          <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-gold via-royal to-sdg-teal transition-all duration-1000" style={{ width: `${((i + 1) / MSGS.length) * 100}%` }} /></div>
          <p className="mt-8 text-xs text-slate-400">Esto puede tardar hasta un minuto. No cierres esta ventana.</p>
        </>
      )}
    </div>
  );
}
