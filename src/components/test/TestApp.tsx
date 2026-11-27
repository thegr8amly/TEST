"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLockup } from "../Brand";
import { enterFullscreen, ExamGuard, type GuardEvent } from "./ExamGuard";
import { HeaderTimer } from "./HeaderTimer";
import { ObjectiveSection } from "./ObjectiveSection";
import { SpeakingSection } from "./SpeakingSection";
import { asrAvailable } from "./speech";
import { Devices, Instructions, Register, Requirements, Review, SectionIntro, Submitting } from "./Steps";
import { WritingSection } from "./WritingSection";
import { Button, fetchJSON, newAttemptId, SECTION_MINUTES, TIMED_STAGES, useOnline, type InviteLink, type Stage, type TestState } from "./shared";

const KEY = "inter-ipt-state-v1";
export const LAST_RESULT_KEY = "inter-ipt-last-result";

function fresh(link?: InviteLink, studentId?: string): TestState {
  return {
    attemptId: newAttemptId(),
    startedAt: new Date().toISOString(),
    stage: "register",
    candidate: studentId ? { fullName: "", email: "", studentId } : undefined,
    link,
    reading: [],
    listening: [],
    readingDone: false,
    listeningDone: false,
    blocks: { reading: 0, listening: 0 },
    timedOut: {},
    writing: {},
    speaking: [],
    deadlines: {},
    integrity: { tabSwitches: 0, pasteAttempts: 0, copyAttempts: 0, screenshotAttempts: 0, focusLosses: 0, fullscreenExits: 0, printAttempts: 0, devtoolsAttempts: 0, sessionResumes: 0 },
    plays: {},
  };
}

function load(): TestState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TestState) : null;
  } catch {
    return null;
  }
}

function readLink(): { link?: InviteLink; sid?: string } {
  const p = new URLSearchParams(window.location.search);
  const clean = (v: string | null) => (v && /^[a-z0-9-]{1,48}$/.test(v) ? v : undefined);
  const link = { org: clean(p.get("org")), cohort: clean(p.get("cohort")) };
  const sid = p.get("sid")?.slice(0, 60) || undefined;
  return { link: link.org || link.cohort ? link : undefined, sid };
}

/** The 10-step candidate journey (landing is step 0, outside this app). */
const PHASES: { label: string; stages: Stage[] }[] = [
  { label: "Registro", stages: ["register"] },
  { label: "Instrucciones", stages: ["instructions"] },
  { label: "Verificación", stages: ["requirements", "devices"] },
  { label: "Reading", stages: ["intro-reading", "reading"] },
  { label: "Listening", stages: ["intro-listening", "listening"] },
  { label: "Writing", stages: ["intro-writing", "writing"] },
  { label: "Speaking", stages: ["intro-speaking", "speaking"] },
  { label: "Entrega", stages: ["review", "submitting"] },
];

export default function TestApp() {
  const router = useRouter();
  const online = useOnline();
  const [s, setS] = useState<TestState | null>(null);
  const [resume, setResume] = useState<TestState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    const saved = load();
    const { link, sid } = readLink();
    // client-only state (localStorage / URL) is read after hydration on purpose
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && saved.stage !== "register") setResume(saved);
    else setS(saved?.stage === "register" ? { ...saved, link: link ?? saved.link } : fresh(link, sid));
  }, []);

  // persist every change (session recovery); surface failures
  useEffect(() => {
    if (!s) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...s, savedAt: Date.now() }));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflects the result of an external write
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [s]);

  const update = useCallback((fn: (p: TestState) => TestState) => setS((p) => (p ? fn(p) : p)), []);

  useEffect(() => {
    const on = () => {
      if (document.visibilityState === "hidden") update((p) => (TIMED_STAGES.includes(p.stage) ? { ...p, integrity: { ...p.integrity, tabSwitches: p.integrity.tabSwitches + 1 } } : p));
    };
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [update]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (s && s.stage !== "register" && s.stage !== "submitting") e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [s]);

  const onGuard = useCallback((e: GuardEvent) => {
    const key = ({ copy: "copyAttempts", screenshot: "screenshotAttempts", blur: "focusLosses", fullscreenExit: "fullscreenExits", print: "printAttempts", devtools: "devtoolsAttempts" } as const)[e];
    update((p) => ({ ...p, integrity: { ...p.integrity, [key]: (p.integrity[key] ?? 0) + 1 } }));
  }, [update]);

  const go = (stage: Stage, extra?: Partial<TestState>) => {
    update((p) => ({ ...p, ...extra, stage }));
    window.scrollTo({ top: 0 });
  };
  const startTimed = (sec: "reading" | "listening" | "writing") => {
    enterFullscreen();
    update((p) => ({ ...p, stage: sec, deadlines: { ...p.deadlines, [sec]: p.deadlines[sec] ?? Date.now() + SECTION_MINUTES[sec] * 60_000 } }));
  };

  const submit = useCallback(async (state: TestState) => {
    if (submitting.current) return;
    submitting.current = true;
    setSubmitError(null);
    setRetrying(0);
    try {
      const body = {
        attemptId: state.attemptId,
        startedAt: state.startedAt,
        link: state.link,
        candidate: state.candidate,
        reading: state.reading,
        listening: state.listening,
        writing: Object.entries(state.writing).map(([taskId, text]) => ({ taskId, text })),
        speaking: state.speaking.map(({ taskId, transcript, durationSec, asrConfidence, audioPath }) => ({ taskId, transcript, durationSec, asrConfidence, audioPath })),
        integrity: { copyAttempts: 0, screenshotAttempts: 0, focusLosses: 0, fullscreenExits: 0, printAttempts: 0, devtoolsAttempts: 0, sessionResumes: 0, ...state.integrity, userAgent: navigator.userAgent.slice(0, 400), speechRecognition: asrAvailable() },
      };
      // idempotent on the server (same attemptId → same stored result), so retries are safe
      const rec = await fetchJSON<{ id: string; persisted?: boolean }>("/api/results", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }, { retries: 5, onRetry: setRetrying });
      try { localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(rec)); localStorage.removeItem(KEY); } catch { /* ignore */ }
      try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ignore */ }
      router.replace(rec.persisted ? `/report/${rec.id}` : "/report/local");
    } catch (e) {
      setSubmitError(e instanceof Error && /HTTP 4/.test(e.message) ? "El servidor rechazó la entrega (datos incompletos)." : "No hay conexión estable con el servidor.");
      submitting.current = false;
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starts the network submission for this stage
    if (s?.stage === "submitting") submit(s);
  }, [s?.stage, submit]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-retry when the connection comes back
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-retry when the connection returns
    if (online && submitError && s?.stage === "submitting") submit(s);
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  if (resume) {
    return (
      <Shell online={online}>
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8" role="dialog" aria-labelledby="resume-t">
          <h1 id="resume-t" className="font-display text-2xl font-extrabold text-navy">Evaluación en curso</h1>
          <p className="mt-2 text-slate-700">
            {resume.candidate?.fullName ? <><strong>{resume.candidate.fullName}</strong>, </> : null}
            encontramos una evaluación iniciada en este dispositivo
            {resume.savedAt ? <> (guardada el {new Date(resume.savedAt).toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" })})</> : null}. Puedes continuar donde la dejaste. El tiempo de cada sección siguió corriendo.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => { if (confirm("¿Descartar la evaluación en curso y empezar una nueva?")) { const { link, sid } = readLink(); setResume(null); setS(fresh(link, sid)); } }}>Descartar y empezar de nuevo</Button>
            <Button onClick={() => { setS({ ...resume, integrity: { ...resume.integrity, sessionResumes: (resume.integrity.sessionResumes ?? 0) + 1 } }); setResume(null); }}>Continuar evaluación</Button>
          </div>
        </div>
      </Shell>
    );
  }
  if (!s) return <Shell online={online}><div /></Shell>;

  const phase = PHASES.findIndex((p) => p.stages.includes(s.stage));
  const timedKey = s.stage === "reading" || s.stage === "listening" || s.stage === "writing" ? s.stage : null;
  const timer = timedKey && s.deadlines[timedKey] ? { deadline: s.deadlines[timedKey]!, totalMs: SECTION_MINUTES[timedKey] * 60_000, label: timedKey[0].toUpperCase() + timedKey.slice(1) } : undefined;
  const guarded = TIMED_STAGES.includes(s.stage);
  const blockInc = (k: "reading" | "listening") => () => update((p) => ({ ...p, blocks: { reading: p.blocks?.reading ?? 0, listening: p.blocks?.listening ?? 0, [k]: (p.blocks?.[k] ?? 0) + 1 } }));

  return (
    <Shell phase={phase} name={s.candidate?.fullName} timer={timer} focus={guarded} online={online} saved={s.stage !== "register"} saveError={saveError}>
      <ExamGuard active={guarded} who={`${s.candidate?.fullName ?? ""} · ${s.candidate?.email ?? ""}`} attemptId={s.attemptId} onEvent={onGuard}>
        <div key={s.stage} className="motion-safe:animate-rise">
          {s.stage === "register" && <Register initial={s.candidate} link={s.link} onSubmit={(c) => go("instructions", { candidate: c, startedAt: new Date().toISOString() })} />}
          {s.stage === "instructions" && <Instructions onBack={() => go("register")} onNext={() => go("requirements")} />}
          {s.stage === "requirements" && <Requirements onBack={() => go("instructions")} onNext={() => go("devices")} />}
          {s.stage === "devices" && <Devices onBack={() => go("requirements")} onReady={() => { enterFullscreen(); go("intro-reading"); }} />}

          {s.stage === "intro-reading" && <SectionIntro skill="reading" onStart={() => startTimed("reading")} />}
          {s.stage === "reading" && (
            <ObjectiveSection skill="reading" attemptId={s.attemptId} answers={s.reading} deadline={s.deadlines.reading!} plays={s.plays} onPlay={() => {}}
              onAnswers={(a) => update((p) => ({ ...p, reading: a }))} onBlock={blockInc("reading")}
              onDone={(t) => go("intro-listening", { readingDone: true, timedOut: { ...s.timedOut, reading: t } })} />
          )}

          {s.stage === "intro-listening" && <SectionIntro skill="listening" onStart={() => startTimed("listening")} />}
          {s.stage === "listening" && (
            <ObjectiveSection skill="listening" attemptId={s.attemptId} answers={s.listening} deadline={s.deadlines.listening!} plays={s.plays}
              onPlay={(id) => update((p) => ({ ...p, plays: { ...p.plays, [id]: (p.plays[id] ?? 0) + 1 } }))}
              onAnswers={(a) => update((p) => ({ ...p, listening: a }))} onBlock={blockInc("listening")}
              onDone={(t) => go("intro-writing", { listeningDone: true, timedOut: { ...s.timedOut, listening: t } })} />
          )}

          {s.stage === "intro-writing" && <SectionIntro skill="writing" onStart={() => startTimed("writing")} />}
          {s.stage === "writing" && (
            <WritingSection values={s.writing} deadline={s.deadlines.writing!}
              onChange={(id, text) => update((p) => ({ ...p, writing: { ...p.writing, [id]: text } }))}
              onPaste={() => update((p) => ({ ...p, integrity: { ...p.integrity, pasteAttempts: p.integrity.pasteAttempts + 1 } }))}
              onDone={(t) => go("intro-speaking", { timedOut: { ...s.timedOut, writing: t } })} />
          )}

          {s.stage === "intro-speaking" && <SectionIntro skill="speaking" onStart={() => { enterFullscreen(); go("speaking"); }} />}
          {s.stage === "speaking" && (
            <SpeakingSection attemptId={s.attemptId} done={s.speaking}
              onTask={(r) => update((p) => ({ ...p, speaking: [...p.speaking.filter((x) => x.taskId !== r.taskId), r] }))}
              onDone={() => go("review")} />
          )}

          {s.stage === "review" && <Review s={s} onSubmit={() => go("submitting")} />}
          {s.stage === "submitting" && <Submitting error={submitError} retrying={retrying} online={online} onRetry={() => submit(s)} />}
        </div>
      </ExamGuard>
    </Shell>
  );
}

function Shell({ children, phase = -1, name, timer, focus = false, online, saved, saveError }: {
  children: React.ReactNode;
  phase?: number;
  name?: string;
  timer?: { deadline: number; totalMs: number; label: string };
  focus?: boolean;
  online: boolean;
  saved?: boolean;
  saveError?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-mist">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">Saltar al contenido</a>
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-8">
          {focus ? <BrandLockup href="#" /> : <BrandLockup />}
          {phase >= 0 && (
            <nav aria-label="Progreso de la evaluación" className="hidden xl:block">
              <ol className="flex items-center gap-1 text-xs font-semibold">
                {PHASES.map((p, i) => (
                  <li key={p.label} className="flex items-center gap-1" aria-current={i === phase ? "step" : undefined}>
                    <span className={`whitespace-nowrap rounded-md px-2 py-1 ${i < phase ? "text-[#2c6e22]" : i === phase ? "bg-navy text-white" : "text-slate-600"}`}>{i < phase ? "✓ " : ""}{p.label}</span>
                    {i < PHASES.length - 1 && <span aria-hidden className="h-px w-3 bg-line" />}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="flex items-center gap-3">
            {saved && (
              <span className={`hidden items-center gap-1.5 whitespace-nowrap text-xs sm:flex ${saveError ? "text-[#9b1c26]" : "text-slate-600"}`} role="status">
                <span aria-hidden className={`h-2 w-2 rounded-full ${saveError ? "bg-sdg-red" : "bg-sdg-green"}`} />
                {saveError ? "No se pudo guardar" : "Progreso guardado"}
              </span>
            )}
            {timer ? <HeaderTimer key={timer.label} deadline={timer.deadline} totalMs={timer.totalMs} label={timer.label} /> : name ? <span className="hidden max-w-[14rem] truncate text-right text-sm font-semibold text-navy sm:block">{name}</span> : null}
          </div>
        </div>
        {phase >= 0 && (
          <div className="h-1 bg-line xl:hidden" aria-hidden><div className="h-full bg-navy transition-[width] duration-500" style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }} /></div>
        )}
      </header>
      {!online && (
        <div role="alert" className="border-b border-gold/60 bg-gold-100 px-4 py-2 text-center text-sm font-medium text-[#5c3b00]">
          Sin conexión a internet. Tu progreso está guardado en este dispositivo; continuaremos cuando vuelva la conexión.
        </div>
      )}
      <main id="main" className="relative px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
