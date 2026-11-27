"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLockup } from "../Brand";
import { ObjectiveSection } from "./ObjectiveSection";
import { SpeakingSection } from "./SpeakingSection";
import { Register, SectionIntro, Submitting, SystemCheck } from "./Steps";
import { WritingSection } from "./WritingSection";
import { asrAvailable } from "./speech";
import { newAttemptId, SECTION_MINUTES, type Stage, type TestState } from "./shared";

const KEY = "inter-ipt-state-v1";
export const LAST_RESULT_KEY = "inter-ipt-last-result";

function fresh(): TestState {
  return {
    attemptId: newAttemptId(),
    startedAt: new Date().toISOString(),
    stage: "register",
    reading: [],
    listening: [],
    readingDone: false,
    listeningDone: false,
    writing: {},
    speaking: [],
    deadlines: {},
    integrity: { tabSwitches: 0, pasteAttempts: 0 },
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

const STEPS: { stage: Stage[]; label: string }[] = [
  { stage: ["intro-reading", "reading"], label: "Reading" },
  { stage: ["intro-listening", "listening"], label: "Listening" },
  { stage: ["intro-writing", "writing"], label: "Writing" },
  { stage: ["intro-speaking", "speaking"], label: "Speaking" },
];

export default function TestApp() {
  const router = useRouter();
  const [s, setS] = useState<TestState | null>(null);
  const [resume, setResume] = useState<TestState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    const saved = load();
    if (saved && saved.stage !== "register" && saved.stage !== "submitting") setResume(saved);
    else if (saved?.stage === "submitting") setS(saved);
    else setS(fresh());
  }, []);

  useEffect(() => {
    if (s) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* quota */ }
  }, [s]);

  const update = useCallback((fn: (p: TestState) => TestState) => setS((p) => (p ? fn(p) : p)), []);

  // integrity: count tab switches during timed sections
  useEffect(() => {
    const on = () => {
      if (document.visibilityState === "hidden") update((p) => (["reading", "listening", "writing", "speaking"].includes(p.stage) ? { ...p, integrity: { ...p.integrity, tabSwitches: p.integrity.tabSwitches + 1 } } : p));
    };
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [update]);

  // warn before leaving mid-test
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (s && s.stage !== "register" && s.stage !== "submitting") { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [s]);

  const go = (stage: Stage, extra?: Partial<TestState>) => update((p) => ({ ...p, ...extra, stage }));
  const startTimed = (sec: "reading" | "listening" | "writing") =>
    update((p) => ({ ...p, stage: sec, deadlines: { ...p.deadlines, [sec]: p.deadlines[sec] ?? Date.now() + SECTION_MINUTES[sec] * 60_000 } }));

  const submit = useCallback(async (state: TestState) => {
    if (submitting.current) return;
    submitting.current = true;
    setSubmitError(null);
    try {
      const body = {
        attemptId: state.attemptId,
        startedAt: state.startedAt,
        candidate: state.candidate,
        reading: state.reading,
        listening: state.listening,
        writing: Object.entries(state.writing).map(([taskId, text]) => ({ taskId, text })),
        speaking: state.speaking,
        integrity: { ...state.integrity, userAgent: navigator.userAgent.slice(0, 400), speechRecognition: asrAvailable() },
      };
      const r = await fetch("/api/results", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`Error ${r.status}.`);
      const rec = await r.json();
      try { localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(rec)); localStorage.removeItem(KEY); } catch { /* ignore */ }
      router.replace(rec.persisted ? `/report/${rec.id}` : "/report/local");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Error de red.");
      submitting.current = false;
    }
  }, [router]);

  useEffect(() => {
    if (s?.stage === "submitting") submit(s);
  }, [s?.stage, submit]); // eslint-disable-line react-hooks/exhaustive-deps

  if (resume) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-line">
          <h1 className="font-display text-2xl font-extrabold text-navy">Tienes un examen en curso</h1>
          <p className="mt-2 text-slate-500">{resume.candidate?.fullName} — ¿deseas continuar donde lo dejaste? El tiempo de cada sección siguió corriendo.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="rounded-2xl px-5 py-3 text-sm font-semibold text-slate-500 ring-1 ring-line" onClick={() => { setResume(null); setS(fresh()); }}>Empezar de nuevo</button>
            <button className="rounded-2xl bg-navy px-5 py-3 text-sm font-bold text-white" onClick={() => { setS(resume); setResume(null); }}>Continuar</button>
          </div>
        </div>
      </Shell>
    );
  }
  if (!s) return <Shell><div /></Shell>;

  const current = STEPS.findIndex((x) => x.stage.includes(s.stage));
  return (
    <Shell steps={current >= 0 ? { current, labels: STEPS.map((x) => x.label) } : undefined} name={s.candidate?.fullName}>
      {s.stage === "register" && <Register initial={s.candidate} onSubmit={(c) => go("check", { candidate: c, startedAt: new Date().toISOString() })} />}
      {s.stage === "check" && <SystemCheck onReady={() => go("intro-reading")} />}

      {s.stage === "intro-reading" && <SectionIntro skill="reading" onStart={() => startTimed("reading")} />}
      {s.stage === "reading" && (
        <ObjectiveSection
          skill="reading"
          answers={s.reading}
          deadline={s.deadlines.reading!}
          totalMs={SECTION_MINUTES.reading * 60_000}
          plays={s.plays}
          onPlay={() => {}}
          onAnswers={(a) => update((p) => ({ ...p, reading: a }))}
          onDone={() => go("intro-listening", { readingDone: true })}
        />
      )}

      {s.stage === "intro-listening" && <SectionIntro skill="listening" onStart={() => startTimed("listening")} />}
      {s.stage === "listening" && (
        <ObjectiveSection
          skill="listening"
          answers={s.listening}
          deadline={s.deadlines.listening!}
          totalMs={SECTION_MINUTES.listening * 60_000}
          plays={s.plays}
          onPlay={(id) => update((p) => ({ ...p, plays: { ...p.plays, [id]: (p.plays[id] ?? 0) + 1 } }))}
          onAnswers={(a) => update((p) => ({ ...p, listening: a }))}
          onDone={() => go("intro-writing", { listeningDone: true })}
        />
      )}

      {s.stage === "intro-writing" && <SectionIntro skill="writing" onStart={() => startTimed("writing")} />}
      {s.stage === "writing" && (
        <WritingSection
          values={s.writing}
          deadline={s.deadlines.writing!}
          totalMs={SECTION_MINUTES.writing * 60_000}
          onChange={(id, text) => update((p) => ({ ...p, writing: { ...p.writing, [id]: text } }))}
          onPaste={() => update((p) => ({ ...p, integrity: { ...p.integrity, pasteAttempts: p.integrity.pasteAttempts + 1 } }))}
          onDone={() => go("intro-speaking")}
        />
      )}

      {s.stage === "intro-speaking" && <SectionIntro skill="speaking" onStart={() => go("speaking")} />}
      {s.stage === "speaking" && (
        <SpeakingSection
          attemptId={s.attemptId}
          done={s.speaking}
          onTask={(r) => update((p) => ({ ...p, speaking: [...p.speaking.filter((x) => x.taskId !== r.taskId), r] }))}
          onDone={() => go("submitting")}
        />
      )}

      {s.stage === "submitting" && <Submitting error={submitError} onRetry={() => submit(s)} />}
    </Shell>
  );
}

function Shell({ children, steps, name }: { children: React.ReactNode; steps?: { current: number; labels: string[] }; name?: string }) {
  return (
    <div className="min-h-dvh bg-mist">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-72 bg-gradient-to-b from-navy/[0.07] to-transparent" />
      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <BrandLockup />
          {steps && (
            <ol className="hidden items-center gap-1 md:flex">
              {steps.labels.map((l, i) => (
                <li key={l} className="flex items-center gap-1">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${i < steps.current ? "text-sdg-green" : i === steps.current ? "bg-navy text-white" : "text-slate-400"}`}>{i < steps.current ? "✓ " : ""}{l}</span>
                  {i < steps.labels.length - 1 && <span className="h-px w-4 bg-line" />}
                </li>
              ))}
            </ol>
          )}
          <div className="hidden text-right text-xs text-slate-500 sm:block">{name && <><div className="font-semibold text-navy">{name}</div>INTER Placement Test</>}</div>
        </div>
        <div className="sdg-bar h-[3px] w-full opacity-80" />
      </header>
      <main className="relative px-4 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}
