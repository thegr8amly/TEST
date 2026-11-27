"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicTestlet } from "@/lib/bank/types";
import { speakLines, ttsAvailable } from "./speech";
import { Button, Card, fetchJSON, Notice, useCountdown, type AnswerRec } from "./shared";

const LETTERS = ["A", "B", "C", "D", "E"];
/** Academic rule (v1.0): maximum number of plays per listening testlet. */
const MAX_PLAYS = 2;

type NextResp = { done: true } | { done: false; testlet: PublicTestlet; index: number; total: number };

function AudioPlayer({ testlet, plays, onPlayed }: { testlet: PublicTestlet; plays: number; onPlayed: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [line, setLine] = useState(-1);
  const [recorded, setRecorded] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/audio/${testlet.id}.mp3`, { method: "HEAD" }).then((r) => alive && r.ok && setRecorded(`/audio/${testlet.id}.mp3`)).catch(() => {});
    return () => { alive = false; abortRef.current?.abort(); audioRef.current?.pause(); window.speechSynthesis?.cancel(); };
  }, [testlet.id]);

  const left = MAX_PLAYS - plays;
  const play = async () => {
    if (state === "playing" || state === "loading" || left <= 0) return;
    setState("loading");
    let started = false;
    // A play is only counted once audio actually starts, so technical failures never consume an attempt.
    const markStarted = () => { if (!started) { started = true; onPlayed(); setState("playing"); } };
    if (recorded) {
      const a = new Audio(recorded);
      audioRef.current = a;
      await new Promise<void>((res) => {
        a.onplaying = markStarted;
        a.onended = () => res();
        a.onerror = () => res();
        a.play().catch(() => res());
      });
    } else if (testlet.script) {
      abortRef.current = new AbortController();
      await speakLines(testlet.script, { rate: 0.93, onLine: setLine, onStart: markStarted, signal: abortRef.current.signal });
    }
    setLine(-1);
    setState(started ? "idle" : "error");
  };

  const speakers = testlet.script ? [...new Set(testlet.script.map((l) => l.speaker))] : [];
  const playing = state === "playing";
  return (
    <Card className="!p-5 sm:!p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          onClick={play}
          disabled={playing || state === "loading" || left <= 0}
          className="flex h-16 w-16 shrink-0 items-center justify-center self-center rounded-full bg-navy text-white transition-colors hover:bg-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={playing ? "Reproduciendo audio" : left > 0 ? `Reproducir audio. Quedan ${left} reproducciones` : "Sin reproducciones disponibles"}
        >
          {playing ? (
            <span className="flex h-6 items-end gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => <span key={i} className="w-1 animate-pulse rounded-full bg-gold motion-reduce:animate-none" style={{ height: `${45 + ((i * 37) % 55)}%`, animationDelay: `${i * 120}ms` }} />)}
            </span>
          ) : (
            <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-display text-base font-bold text-navy">{testlet.title}</div>
          <p className="mt-0.5 text-sm text-slate-600" aria-live="polite">
            {playing ? (line >= 0 && testlet.script ? `Hablando: ${testlet.script[line].speaker}` : "Reproduciendo…") : state === "loading" ? "Preparando audio…" : left > 0 ? `Reproducciones disponibles: ${left} de ${MAX_PLAYS}.` : "Ya usaste las reproducciones disponibles."}
          </p>
          {speakers.length > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {speakers.map((sp) => <span key={sp} className={`rounded-md px-2 py-0.5 text-xs ring-1 ${playing && testlet.script?.[line]?.speaker === sp ? "bg-navy text-white ring-navy" : "bg-mist text-slate-700 ring-line"}`}>{sp}</span>)}
            </div>
          )}
        </div>
        <div className="flex justify-center gap-1.5" aria-hidden>
          {Array.from({ length: MAX_PLAYS }).map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < plays ? "bg-line" : "bg-navy"}`} />)}
        </div>
      </div>
      {state === "error" && <div className="mt-4"><Notice tone="warn" role="alert">El audio no pudo reproducirse. Este intento no se contó. Revisa el volumen y vuelve a intentarlo{!ttsAvailable() ? " (usa Chrome o Edge)" : ""}.</Notice></div>}
    </Card>
  );
}

export function ObjectiveSection({
  skill, attemptId, answers, deadline, plays, onPlay, onAnswers, onBlock, onDone,
}: {
  skill: "reading" | "listening";
  attemptId: string;
  answers: AnswerRec[];
  deadline: number;
  plays: Record<string, number>;
  onPlay: (testletId: string) => void;
  onAnswers: (a: AnswerRec[]) => void;
  onBlock: () => void;
  onDone: (timedOut: boolean) => void;
}) {
  const [testlet, setTestlet] = useState<PublicTestlet | null>(null);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(5);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const headingRef = useRef<HTMLHeadingElement>(null);

  const fetchNext = useCallback(async (list: AnswerRec[]) => {
    setLoading(true);
    setError(null);
    setRetrying(0);
    try {
      const data = await fetchJSON<NextResp>("/api/section/next", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ skill, attemptId, answers: list }) }, { onRetry: setRetrying });
      if (data.done) { doneRef.current(false); return; }
      setTestlet(data.testlet);
      setIndex(data.index);
      setTotal(data.total);
      setChoices({});
      shownAt.current = Date.now();
      window.scrollTo({ top: 0, behavior: "smooth" });
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch {
      setError("No pudimos cargar el siguiente bloque. Tus respuestas están guardadas.");
    } finally {
      setLoading(false);
    }
  }, [skill, attemptId]);

  useEffect(() => { fetchNext(answersRef.current); }, [fetchNext]);

  const commit = (timeout = false) => {
    if (!testlet) { if (timeout) doneRef.current(true); return; }
    const ms = Date.now() - shownAt.current;
    const add: AnswerRec[] = testlet.questions.map((q) => ({ testletId: testlet.id, questionId: q.id, choice: choices[q.id] ?? null, ms }));
    const next = [...answersRef.current.filter((a) => a.testletId !== testlet.id), ...add];
    onAnswers(next);
    onBlock();
    if (timeout) doneRef.current(true);
    else fetchNext(next);
  };

  useCountdown(deadline, () => commit(true));
  const complete = testlet ? testlet.questions.every((q) => choices[q.id] !== undefined) : false;
  const listening = skill === "listening";
  const played = testlet ? (plays[testlet.id] ?? 0) : 0;
  const answered = testlet ? testlet.questions.filter((q) => choices[q.id] !== undefined).length : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-royal">{listening ? "Listening" : "Reading"}</p>
          <div className="mt-2 flex items-center gap-1.5" role="progressbar" aria-label={`Bloque ${Math.min(index + 1, total)} de ${total}`} aria-valuemin={1} aria-valuemax={total} aria-valuenow={Math.min(index + 1, total)}>
            {Array.from({ length: total }).map((_, i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i < index ? "bg-navy" : i === index ? "bg-gold" : "bg-line"}`} />)}
            <span className="ml-2 text-sm text-slate-600">Bloque {Math.min(index + 1, total)} de {total}</span>
          </div>
        </div>
      </div>

      {error && (
        <Card>
          <Notice tone="error" role="alert">{error}</Notice>
          <Button className="mt-4" onClick={() => fetchNext(answersRef.current)}>Reintentar</Button>
        </Card>
      )}

      {!error && (loading || !testlet) && (
        <Card className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-navy" aria-hidden />
            {retrying ? `Conexión inestable, reintentando (${retrying})…` : "Cargando el siguiente bloque…"}
          </div>
        </Card>
      )}

      {!error && !loading && testlet && (
        <div key={testlet.id} className={`grid gap-5 motion-safe:animate-rise ${listening ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-[1.1fr_1fr]"}`}>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 ref={headingRef} tabIndex={-1} className="sr-only">{testlet.title}</h2>
            {listening ? (
              <>
                <AudioPlayer testlet={testlet} plays={played} onPlayed={() => onPlay(testlet.id)} />
                <p className="mt-3 px-1 text-sm text-slate-600">{testlet.context}</p>
              </>
            ) : (
              <Card className="!p-6 sm:!p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{testlet.context}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">{testlet.title}</h3>
                <div className="prose-passage mt-4 max-h-[62vh] overflow-y-auto pr-2 font-[450] text-[16px] leading-[1.75] text-slate-800" tabIndex={0} aria-label="Texto de lectura">
                  {testlet.passage?.split(/\n\n/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {testlet.questions.map((q, qi) => (
              <Card key={q.id} as="fieldset" className="!p-5 sm:!p-6">
                <legend className="sr-only">Pregunta {qi + 1}</legend>
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mist font-display text-xs font-bold text-navy ring-1 ring-line" aria-hidden>{qi + 1}</span>
                  <p id={`${q.id}-p`} className="font-medium leading-snug text-navy">{q.prompt}</p>
                </div>
                <div role="radiogroup" aria-labelledby={`${q.id}-p`} className="mt-4 grid gap-2">
                  {q.options.map((o, oi) => {
                    const on = choices[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setChoices((c) => ({ ...c, [q.id]: oi }))}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal ${on ? "border-navy bg-navy/[0.06] text-navy" : "border-line bg-white text-slate-800 hover:border-navy/40"}`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${on ? "bg-navy text-white" : "bg-mist text-slate-700 ring-1 ring-line"}`} aria-hidden>{LETTERS[oi]}</span>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-sm text-slate-600" aria-live="polite">
                {listening && played === 0 ? "Reproduce el audio antes de responder." : `${answered} de ${testlet.questions.length} respondidas.${complete ? " Al continuar no podrás volver a este bloque." : ""}`}
              </p>
              <Button disabled={!complete} onClick={() => commit()}>
                {index + 1 >= total ? "Enviar sección" : "Enviar bloque y continuar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
