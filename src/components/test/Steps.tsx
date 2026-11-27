"use client";
import { useEffect, useId, useRef, useState } from "react";
import { SPEAKING_TASKS, WRITING_TASKS } from "@/lib/bank/productive";
import { asrAvailable, speakLines, ttsAvailable } from "./speech";
import { Button, Card, Notice, SECTION_MINUTES, StepHeading, type CandidateIn, type InviteLink, type TestState } from "./shared";

const field = "mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-navy outline-none transition-colors focus-visible:border-royal focus-visible:ring-2 focus-visible:ring-royal/25";
const label = "block text-sm font-semibold text-navy";

// ── 2 · Registration ─────────────────────────────────────────
export function Register({ initial, link, onSubmit }: { initial?: CandidateIn; link?: InviteLink; onSubmit: (c: CandidateIn) => void }) {
  const [c, setC] = useState<CandidateIn>(initial ?? { fullName: "", email: "" });
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const set = (k: keyof CandidateIn) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setC({ ...c, [k]: e.target.value });
  const nameOk = c.fullName.trim().length > 3;
  const emailOk = /^\S+@\S+\.\S+$/.test(c.email.trim());
  const valid = nameOk && emailOk && consent;
  return (
    <div className="mx-auto max-w-3xl">
      <StepHeading eyebrow="Paso 1 · Identificación" title="Datos del candidato" lead="Esta información identifica tu evaluación en tu expediente académico de INTER. Solo la ve el equipo académico autorizado." />
      {(link?.org || link?.cohort) && <div className="mb-4"><Notice>Te registras mediante un enlace institucional{link.org ? <> · institución <strong>{link.org}</strong></> : null}{link.cohort ? <> · grupo <strong>{link.cohort}</strong></> : null}.</Notice></div>}
      <Card>
        <form
          noValidate
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (valid) onSubmit({ ...c, fullName: c.fullName.trim(), email: c.email.trim() });
          }}
        >
          <label className={`${label} sm:col-span-2`}>Nombre completo <span aria-hidden className="text-sdg-red">*</span>
            <input className={field} value={c.fullName} onChange={set("fullName")} autoComplete="name" required aria-invalid={touched && !nameOk} />
            {touched && !nameOk && <span className="mt-1 block text-sm font-normal text-[#9b1c26]">Escribe tu nombre completo.</span>}
          </label>
          <label className={label}>Correo electrónico <span aria-hidden className="text-sdg-red">*</span>
            <input className={field} type="email" inputMode="email" value={c.email} onChange={set("email")} autoComplete="email" required aria-invalid={touched && !emailOk} />
            {touched && !emailOk && <span className="mt-1 block text-sm font-normal text-[#9b1c26]">Revisa el formato del correo.</span>}
          </label>
          <label className={label}>Teléfono<input className={field} type="tel" value={c.phone ?? ""} onChange={set("phone")} autoComplete="tel" /></label>
          <label className={label}>ID de estudiante o cédula<input className={field} value={c.studentId ?? ""} onChange={set("studentId")} /></label>
          <label className={label}>Institución o empresa<input className={field} value={c.organization ?? ""} onChange={set("organization")} autoComplete="organization" /></label>
          <label className={label}>Grupo o cohorte<input className={field} value={c.cohort ?? ""} onChange={set("cohort")} /></label>
          <label className={label}>Objetivo principal
            <select className={field} value={c.purpose ?? ""} onChange={set("purpose")}>
              <option value="">Seleccionar…</option>
              <option>Trabajo / desarrollo profesional</option>
              <option>Atención al cliente / servicio</option>
              <option>Estudios / becas</option>
              <option>Viajes / uso personal</option>
              <option>Certificación / entrevista</option>
            </select>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-mist p-4 text-sm leading-relaxed text-slate-700 sm:col-span-2">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-navy" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={touched && !consent} />
            <span>Autorizo a INTER a registrar mis respuestas (incluidas las grabaciones orales) y a procesar mis resultados con fines académicos: ubicación, seguimiento y reportes de progreso. Declaro que realizaré la evaluación sin ayuda externa.</span>
          </label>
          {touched && !consent && <p className="text-sm text-[#9b1c26] sm:col-span-2">Debes aceptar la autorización para continuar.</p>}
          <div className="flex justify-end sm:col-span-2"><Button type="submit">Continuar</Button></div>
        </form>
      </Card>
    </div>
  );
}

// ── 3 · General instructions ─────────────────────────────────
const SECTIONS = [
  { k: "Reading", t: `${SECTION_MINUTES.reading} min`, d: "5 bloques de textos con 3 preguntas cada uno. La dificultad se ajusta según tus respuestas." },
  { k: "Listening", t: `${SECTION_MINUTES.listening} min`, d: "5 audios con 3 preguntas cada uno. Cada audio puede reproducirse como máximo 2 veces." },
  { k: "Writing", t: `${SECTION_MINUTES.writing} min`, d: `${WRITING_TASKS.length} tareas: ${WRITING_TASKS.map((w) => `${w.title.toLowerCase()} (${w.minWords}–${w.maxWords} palabras)`).join(" y ")}.` },
  { k: "Speaking", t: "≈ 6 min", d: `${SPEAKING_TASKS.length} respuestas orales grabadas, cada una con tiempo de preparación.` },
];

export function Instructions({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [ack, setAck] = useState(false);
  return (
    <div className="mx-auto max-w-3xl">
      <StepHeading eyebrow="Paso 2 · Instrucciones generales" title="Cómo funciona la evaluación" lead="Lee con atención. Las condiciones son las mismas para todos los candidatos." />
      <Card className="!p-0">
        <ol className="divide-y divide-line">
          {SECTIONS.map((s, i) => (
            <li key={s.k} className="flex gap-4 p-5 sm:px-8">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy font-display text-sm font-bold text-white">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-display text-base font-bold text-navy">{s.k}</h2><span className="text-sm tabular-nums text-slate-600">{s.t}</span></div>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
      <Card className="mt-4">
        <h2 className="font-display text-base font-bold text-navy">Reglas de la evaluación</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
          {[
            "Cada sección tiene un tiempo límite con cuenta regresiva visible. Al agotarse, la sección se envía automáticamente.",
            "En Reading y Listening no puedes volver a un bloque ya enviado.",
            "La evaluación se realiza en pantalla completa. Copiar, pegar, imprimir y las capturas de pantalla están bloqueados.",
            "Si sales de la ventana, el contenido se oculta. Estos eventos quedan registrados en tu expediente.",
            "No recibirás indicaciones sobre si tus respuestas son correctas durante la evaluación.",
            "Tu progreso se guarda en este dispositivo. Si se interrumpe la conexión o cierras la pestaña, podrás continuar; el tiempo sigue corriendo.",
          ].map((r) => (
            <li key={r} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />{r}</li>
          ))}
        </ul>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-mist p-4 text-sm text-slate-700">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-navy" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          He leído y acepto las instrucciones y condiciones de la evaluación.
        </label>
      </Card>
      <div className="mt-6 flex justify-between gap-3"><Button variant="secondary" onClick={onBack}>Atrás</Button><Button disabled={!ack} onClick={onNext}>Continuar</Button></div>
    </div>
  );
}

// ── 4 · Technical requirements ───────────────────────────────
type Check = { id: string; label: string; ok: boolean | null; detail: string; required: boolean };

export function Requirements({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(true);

  const run = async () => {
    setRunning(true);
    const ua = navigator.userAgent;
    const chromium = /Chrome|Edg\//.test(ua) && !/OPR\//.test(ua);
    const mobile = /Android|iPhone|iPad|Mobile/i.test(ua);
    let net = false;
    let latency = 0;
    try {
      const t0 = performance.now();
      const r = await fetch("/api/config", { cache: "no-store" });
      latency = Math.round(performance.now() - t0);
      net = r.ok;
    } catch { net = false; }
    const media = typeof navigator.mediaDevices?.getUserMedia === "function" && ttsAvailable();
    const fsOk = typeof document.documentElement.requestFullscreen === "function";
    let storage = false;
    try { localStorage.setItem("__inter_probe", "1"); localStorage.removeItem("__inter_probe"); storage = true; } catch { storage = false; }
    setChecks([
      { id: "net", label: "Conexión con el servidor", ok: net, required: true, detail: net ? `Conectado (${latency} ms).` : "Sin conexión. Revisa tu red y vuelve a verificar." },
      { id: "browser", label: "Navegador recomendado", ok: chromium, required: false, detail: chromium ? "Google Chrome o Microsoft Edge detectado." : "Para la transcripción oral automática usa Chrome o Edge. Puedes continuar; tu audio se evaluará manualmente." },
      { id: "device", label: "Computadora de escritorio o portátil", ok: !mobile && window.innerWidth >= 900, required: false, detail: !mobile && window.innerWidth >= 900 ? "Pantalla adecuada." : "Se recomienda una computadora; en teléfonos la experiencia es limitada." },
      { id: "storage", label: "Guardado del progreso", ok: storage, required: true, detail: storage ? "El progreso se guardará en este dispositivo." : "El navegador bloquea el almacenamiento (¿modo privado?). Usa una ventana normal." },
      { id: "media", label: "Audio y micrófono", ok: media, required: true, detail: media ? "Compatible." : "El navegador no permite audio o micrófono." },
      { id: "fs", label: "Pantalla completa", ok: fsOk, required: false, detail: fsOk ? "Compatible." : "No disponible en este navegador." },
    ]);
    setRunning(false);
  };
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const blocking = checks.some((c) => c.required && !c.ok);
  return (
    <div className="mx-auto max-w-3xl">
      <StepHeading eyebrow="Paso 3 · Requisitos técnicos" title="Verificación del equipo" lead="Comprobamos automáticamente que tu equipo cumple los requisitos de la evaluación." />
      <Card className="!p-0">
        <ul className="divide-y divide-line" aria-live="polite" aria-busy={running}>
          {running && !checks.length && <li className="p-5 text-sm text-slate-600 sm:px-8">Verificando…</li>}
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-4 p-5 sm:px-8">
              <StatusDot ok={c.ok} warn={!c.required} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-navy">{c.label}{!c.required && <span className="ml-2 text-xs font-normal text-slate-600">recomendado</span>}</div>
                <div className="mt-0.5 text-sm text-slate-600">{c.detail}</div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <div className="flex gap-3"><Button variant="secondary" onClick={run} disabled={running}>Verificar de nuevo</Button><Button disabled={running || blocking} onClick={onNext}>Continuar</Button></div>
      </div>
    </div>
  );
}

function StatusDot({ ok, warn }: { ok: boolean | null; warn?: boolean }) {
  const c = ok ? "bg-sdg-green text-white" : ok === false ? (warn ? "bg-gold text-navy-950" : "bg-sdg-red text-white") : "bg-line text-slate-600";
  return (
    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${c}`} aria-hidden>
      {ok ? "✓" : ok === false ? "!" : "·"}
    </span>
  );
}

// ── 5 · Audio & microphone test ──────────────────────────────
export function Devices({ onReady, onBack }: { onReady: () => void; onBack: () => void }) {
  const [audioOk, setAudioOk] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const [lvl, setLvl] = useState(0);
  const [peak, setPeak] = useState(0);
  const raf = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const meterId = useId();
  const asr = typeof window !== "undefined" && asrAvailable();

  useEffect(() => () => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach((t) => t.stop()); }, []);

  const playTest = async () => {
    setPlaying(true);
    await speakLines([{ voice: "f", text: "Hello. This is the INTER sound check. If you can hear this clearly, you are ready to begin." }]);
    setPlaying(false);
  };

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

  const micHeard = micOk && peak > 0.15;
  return (
    <div className="mx-auto max-w-3xl">
      <StepHeading eyebrow="Paso 4 · Audio y micrófono" title="Prueba de sonido" lead="Usa audífonos y busca un lugar tranquilo. Ajusta el volumen antes de empezar." />
      <div className="space-y-4">
        <Card as="section">
          <div className="flex items-start gap-4">
            <StatusDot ok={audioOk} />
            <div className="flex-1">
              <h2 className="font-display text-base font-bold text-navy">Audio</h2>
              <p className="mt-0.5 text-sm text-slate-600">Reproduce el mensaje de prueba. Esta reproducción no cuenta para la evaluación.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={playTest} disabled={playing || !ttsAvailable()}>{playing ? "Reproduciendo…" : "▶ Reproducir prueba"}</Button>
                <span className="text-sm text-slate-700" id="audio-q">¿Lo escuchas con claridad?</span>
                <div role="group" aria-labelledby="audio-q" className="flex gap-2">
                  <Button variant={audioOk === true ? "primary" : "secondary"} onClick={() => setAudioOk(true)}>Sí</Button>
                  <Button variant={audioOk === false ? "primary" : "secondary"} onClick={() => setAudioOk(false)}>No</Button>
                </div>
              </div>
              {audioOk === false && <div className="mt-3"><Notice tone="warn">Sube el volumen del sistema, revisa la conexión de tus audífonos y vuelve a reproducir.</Notice></div>}
            </div>
          </div>
        </Card>
        <Card as="section">
          <div className="flex items-start gap-4">
            <StatusDot ok={micOk === false ? false : micHeard ? true : null} />
            <div className="flex-1">
              <h2 className="font-display text-base font-bold text-navy">Micrófono</h2>
              <p className="mt-0.5 text-sm text-slate-600">Permite el acceso y di una frase en voz alta.</p>
              <div className="mt-4">
                {micOk === null && <Button variant="secondary" onClick={testMic}>Permitir micrófono</Button>}
                {micOk && (
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist ring-1 ring-line" role="meter" aria-labelledby={meterId} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lvl * 100)}>
                      <div className="h-full rounded-full bg-sdg-green transition-[width] duration-75" style={{ width: `${lvl * 100}%` }} />
                    </div>
                    <span id={meterId} className="w-36 text-sm text-slate-700" aria-live="polite">{micHeard ? "Te escuchamos bien." : "Habla en voz alta…"}</span>
                  </div>
                )}
                {micOk === false && <Notice tone="error" role="alert">Acceso denegado. Habilita el micrófono desde el ícono del candado en la barra de direcciones y recarga la página.</Notice>}
              </div>
            </div>
          </div>
        </Card>
        <Notice tone={asr ? "info" : "warn"}>
          {asr ? "Tus respuestas orales se transcribirán automáticamente para su calificación." : "Este navegador no transcribe voz. Tus respuestas orales se grabarán y serán evaluadas por un docente; el resultado de Speaking será provisional."}
        </Notice>
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <Button variant="secondary" onClick={onBack}>Atrás</Button>
        <Button disabled={!audioOk || !micOk} onClick={onReady}>Comenzar la evaluación</Button>
      </div>
    </div>
  );
}

// ── Section intros (calm, no decoration) ─────────────────────
const INTROS = {
  reading: { n: 1, t: "Reading", es: "Comprensión lectora", time: `${SECTION_MINUTES.reading} minutos`, pts: ["5 bloques de textos, 3 preguntas por bloque.", "La dificultad se ajusta a tus respuestas.", "No podrás volver a un bloque ya enviado."] },
  listening: { n: 2, t: "Listening", es: "Comprensión auditiva", time: `${SECTION_MINUTES.listening} minutos`, pts: ["5 audios, 3 preguntas por audio.", "Cada audio puede reproducirse como máximo 2 veces.", "Lee las preguntas antes de reproducir. No podrás volver atrás."] },
  writing: { n: 3, t: "Writing", es: "Expresión escrita", time: `${SECTION_MINUTES.writing} minutos`, pts: WRITING_TASKS.map((w, i) => `Tarea ${i + 1}: ${w.title.toLowerCase()} (${w.minWords}–${w.maxWords} palabras).`).concat("Pegar texto está deshabilitado.") },
  speaking: { n: 4, t: "Speaking", es: "Expresión oral", time: "≈ 6 minutos", pts: ["3 respuestas grabadas, con tiempo de preparación.", "La grabación empieza automáticamente tras la preparación.", "Habla con claridad, sin leer un texto preparado."] },
} as const;

export function SectionIntro({ skill, onStart }: { skill: keyof typeof INTROS; onStart: () => void }) {
  const s = INTROS[skill];
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-line bg-navy px-6 py-6 text-white sm:px-8">
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-gold">Sección {s.n} de 4 · {s.time}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">{s.t}</h1>
          <p className="text-white/80">{s.es}</p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <ul className="space-y-2.5 text-[15px] text-slate-700">
            {s.pts.map((p, i) => (
              <li key={p} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-mist text-xs font-bold text-navy ring-1 ring-line">{i + 1}</span>{p}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-slate-600">El tiempo empieza a correr al pulsar el botón.</p>
          <Button className="mt-4" onClick={onStart}>Iniciar {s.t}</Button>
        </div>
      </Card>
    </div>
  );
}

// ── 7 · Review & confirmation ────────────────────────────────
export function Review({ s, onSubmit }: { s: TestState; onSubmit: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const words = (t?: string) => (t?.match(/\S+/g) ?? []).length;
  const rows = [
    { k: "Reading", v: `${s.blocks?.reading ?? countBlocks(s.reading)} de 5 bloques enviados${s.timedOut?.reading ? " · tiempo agotado" : ""}` },
    { k: "Listening", v: `${s.blocks?.listening ?? countBlocks(s.listening)} de 5 audios enviados${s.timedOut?.listening ? " · tiempo agotado" : ""}` },
    { k: "Writing", v: WRITING_TASKS.map((w, i) => `Tarea ${i + 1}: ${words(s.writing[w.id])} palabras`).join(" · ") + (s.timedOut?.writing ? " · tiempo agotado" : "") },
    { k: "Speaking", v: `${s.speaking.length} de ${SPEAKING_TASKS.length} respuestas grabadas${s.speaking.some((r) => !r.transcript) ? " · algunas sin transcripción automática (revisión docente)" : ""}` },
  ];
  return (
    <div className="mx-auto max-w-2xl">
      <StepHeading eyebrow="Paso 6 · Revisión y entrega" title="Confirma la entrega de tu evaluación" lead="Este es el resumen de lo registrado. Según las reglas de la evaluación, las secciones enviadas no pueden modificarse." />
      <Card className="!p-0">
        <dl className="divide-y divide-line">
          {rows.map((r) => (
            <div key={r.k} className="grid gap-1 p-5 sm:grid-cols-[140px_1fr] sm:px-8">
              <dt className="font-display text-sm font-bold text-navy">{r.k}</dt>
              <dd className="text-sm text-slate-700">{r.v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <label className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm text-slate-700">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-navy" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
        Confirmo que realicé la evaluación personalmente y deseo entregarla para su calificación.
      </label>
      <div className="mt-6 flex justify-end"><Button disabled={!confirm} onClick={onSubmit}>Entregar evaluación</Button></div>
    </div>
  );
}
const countBlocks = (a: { testletId: string }[]) => new Set(a.map((x) => x.testletId)).size;

// ── 8 · Processing ───────────────────────────────────────────
const STAGES = ["Registrando la entrega", "Calificando Reading y Listening", "Evaluando Writing y Speaking con la rúbrica MCER", "Calculando el perfil y la recomendación de módulo"];
export function Submitting({ error, retrying, online, onRetry }: { error?: string | null; retrying?: number; online: boolean; onRetry: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => Math.min(STAGES.length - 1, x + 1)), 5000); return () => clearInterval(id); }, []);
  return (
    <div className="mx-auto max-w-xl">
      <StepHeading eyebrow="Paso 7 · Procesamiento" title={error ? "No pudimos completar la entrega" : "Procesando tus resultados"} lead={error ? undefined : "Esto puede tardar hasta un minuto. No cierres esta ventana."} />
      <Card>
        {error ? (
          <div className="space-y-4">
            <Notice tone="error" role="alert">{error} Tus respuestas siguen guardadas en este dispositivo; no se perdió nada.</Notice>
            {!online && <Notice tone="warn">Estás sin conexión. Reintentaremos automáticamente cuando vuelva la red.</Notice>}
            <Button onClick={onRetry}>Reintentar entrega</Button>
          </div>
        ) : (
          <ol className="space-y-3" aria-live="polite">
            {STAGES.map((t, k) => (
              <li key={t} className="flex items-center gap-3 text-sm">
                {k < i ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sdg-green text-xs font-bold text-white" aria-hidden>✓</span> : k === i ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-navy" aria-hidden /> : <span className="h-6 w-6 rounded-full border-2 border-line" aria-hidden />}
                <span className={k <= i ? "text-navy" : "text-slate-600"}>{t}</span>
              </li>
            ))}
            {!!retrying && <li><Notice tone="warn">Conexión inestable. Reintentando ({retrying})…</Notice></li>}
          </ol>
        )}
      </Card>
    </div>
  );
}
