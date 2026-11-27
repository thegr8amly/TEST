"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicTestlet } from "@/lib/bank/types";
import { speakLines, ttsAvailable } from "./speech";
import { Card, PrimaryButton, Timer, useCountdown, type AnswerRec } from "./shared";

const LETTERS = ["A", "B", "C", "D", "E"];

function AudioPlayer({ testlet, plays, onPlayed }: { testlet: PublicTestlet; plays: number; onPlayed: () => void }) {
  const MAX = 2;
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const [recorded, setRecorded] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/audio/${testlet.id}.mp3`, { method: "HEAD" }).then((r) => alive && r.ok && setRecorded(`/audio/${testlet.id}.mp3`)).catch(() => {});
    return () => { alive = false; abortRef.current?.abort(); audioRef.current?.pause(); };
  }, [testlet.id]);

  const play = async () => {
    if (playing || plays >= MAX) return;
    setPlaying(true);
    onPlayed();
    if (recorded) {
      const a = new Audio(recorded);
      audioRef.current = a;
      await new Promise<void>((res) => { a.onended = () => res(); a.onerror = () => res(); a.play().catch(() => res()); });
    } else if (testlet.script) {
      abortRef.current = new AbortController();
      await speakLines(testlet.script, { rate: 0.93, onLine: setLine, signal: abortRef.current.signal });
    }
    setLine(-1);
    setPlaying(false);
  };

  const left = MAX - plays;
  const speakers = testlet.script ? [...new Set(testlet.script.map((l) => l.speaker))] : [];
  return (
    <div className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative flex flex-col items-center gap-5 sm:flex-row">
        <button
          onClick={play}
          disabled={playing || left <= 0}
          className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold text-navy-950 shadow-xl shadow-gold/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          aria-label="Reproducir audio"
        >
          {playing ? (
            <span className="flex h-8 items-end gap-1">
              {[0, 1, 2, 3].map((i) => <span key={i} className="w-1.5 animate-pulse rounded-full bg-navy-950" style={{ height: `${40 + ((i * 37) % 60)}%`, animationDelay: `${i * 120}ms` }} />)}
            </span>
          ) : (
            <svg className="ml-1 h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <div className="flex-1 text-center sm:text-left">
          <div className="font-display text-lg font-bold">{testlet.title}</div>
          <div className="mt-1 text-sm text-white/60">
            {playing ? (line >= 0 && testlet.script ? `🔊 ${testlet.script[line].speaker}…` : "Reproduciendo…") : left > 0 ? `Puedes escuchar ${left === 2 ? "dos veces" : "una vez más"}.` : "Ya escuchaste el audio el máximo de veces."}
          </div>
          {speakers.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {speakers.map((s) => (
                <span key={s} className={`rounded-full px-3 py-1 text-xs ring-1 transition ${playing && testlet.script?.[line]?.speaker === s ? "bg-gold text-navy-950 ring-gold" : "bg-white/5 text-white/70 ring-white/15"}`}>{s}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: MAX }).map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < plays ? "bg-white/20" : "bg-gold"}`} />)}
        </div>
      </div>
      {!recorded && !ttsAvailable() && <p className="relative mt-4 text-sm text-gold">Tu navegador no puede reproducir el audio. Usa Google Chrome o Microsoft Edge.</p>}
    </div>
  );
}

export function ObjectiveSection({
  skill, answers, deadline, totalMs, plays, onPlay, onAnswers, onDone,
}: {
  skill: "reading" | "listening";
  answers: AnswerRec[];
  deadline: number;
  totalMs: number;
  plays: Record<string, number>;
  onPlay: (testletId: string) => void;
  onAnswers: (a: AnswerRec[]) => void;
  onDone: () => void;
}) {
  const [testlet, setTestlet] = useState<PublicTestlet | null>(null);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(5);
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shownAt = useRef(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const fetchNext = useCallback(async (list: AnswerRec[]) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/section/next", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ skill, answers: list }) });
      if (!r.ok) throw new Error(String(r.status));
      const data = await r.json();
      if (data.done) { doneRef.current(); return; }
      setTestlet(data.testlet);
      setIndex(data.index);
      setTotal(data.total);
      setChoices({});
      shownAt.current = Date.now();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No pudimos cargar el siguiente bloque. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [skill]);

  useEffect(() => { fetchNext(answersRef.current); }, [fetchNext]);

  const commit = (force = false) => {
    if (!testlet) { if (force) doneRef.current(); return; }
    const ms = Date.now() - shownAt.current;
    const add: AnswerRec[] = testlet.questions.map((q) => ({ testletId: testlet.id, questionId: q.id, choice: choices[q.id] ?? null, ms }));
    const next = [...answersRef.current.filter((a) => a.testletId !== testlet.id), ...add];
    onAnswers(next);
    if (force) doneRef.current();
    else fetchNext(next);
  };

  const left = useCountdown(deadline, () => commit(true));
  const complete = testlet ? testlet.questions.every((q) => choices[q.id] !== undefined) : false;
  const listening = skill === "listening";
  const played = testlet ? (plays[testlet.id] ?? 0) : 0;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">{listening ? "Listening" : "Reading"}</div>
          <div className="mt-1 flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i < index ? "w-8 bg-navy" : i === index ? "w-12 bg-gold" : "w-8 bg-line"}`} />
            ))}
            <span className="ml-2 text-xs text-slate-500">Bloque {Math.min(index + 1, total)} de {total}</span>
          </div>
        </div>
        <Timer ms={left} total={totalMs} />
      </div>

      {error && (
        <Card className="text-center">
          <p className="text-slate-600">{error}</p>
          <PrimaryButton className="mt-4" onClick={() => fetchNext(answersRef.current)}>Reintentar</PrimaryButton>
        </Card>
      )}

      {!error && (loading || !testlet) && (
        <Card className="flex min-h-[320px] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />Preparando el siguiente bloque…</div>
        </Card>
      )}

      {!error && !loading && testlet && (
        <div key={testlet.id} className={`grid animate-rise gap-6 ${listening ? "" : "lg:grid-cols-[1.15fr_1fr]"}`}>
          <div className={listening ? "" : "lg:sticky lg:top-24 lg:self-start"}>
            {listening ? (
              <AudioPlayer testlet={testlet} plays={played} onPlayed={() => onPlay(testlet.id)} />
            ) : (
              <Card className="no-select" >
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">{testlet.context}</div>
                <h2 className="mt-2 font-display text-xl font-bold text-navy">{testlet.title}</h2>
                <div className="prose-passage mt-4 max-h-[60vh] overflow-y-auto pr-2 text-[15.5px] leading-7 text-slate-700" onCopy={(e) => e.preventDefault()}>
                  {testlet.passage?.split(/\n\n/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
                </div>
              </Card>
            )}
            {listening && <p className="mt-3 text-sm text-slate-500">{testlet.context}</p>}
          </div>

          <div className="space-y-4">
            {testlet.questions.map((q, qi) => (
              <Card key={q.id} className="!p-5 sm:!p-6">
                <div className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy font-display text-xs font-bold text-gold">{qi + 1}</span>
                  <p className="font-medium text-navy">{q.prompt}</p>
                </div>
                <div className="mt-4 grid gap-2">
                  {q.options.map((o, oi) => {
                    const on = choices[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setChoices((c) => ({ ...c, [q.id]: oi }))}
                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${on ? "bg-navy text-white shadow-lg shadow-navy/20" : "bg-mist text-slate-700 ring-1 ring-line hover:bg-white hover:ring-navy/30"}`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${on ? "bg-gold text-navy-950" : "bg-white text-slate-500 ring-1 ring-line group-hover:text-navy"}`}>{LETTERS[oi]}</span>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500">{listening && played === 0 ? "Reproduce el audio antes de responder." : complete ? "Listo. No podrás volver a este bloque." : "Responde todas las preguntas para continuar."}</p>
              <PrimaryButton disabled={!complete} onClick={() => commit()}>
                {index + 1 >= total ? "Finalizar sección" : "Continuar"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
