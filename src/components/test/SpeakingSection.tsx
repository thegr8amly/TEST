"use client";
import { useEffect, useRef, useState } from "react";
import { SPEAKING_TASKS } from "@/lib/bank/productive";
import { startRecognizer, type LiveRecognizer } from "./speech";
import { Card, fmt, PrimaryButton, type SpeakingRec } from "./shared";

type Phase = "ready" | "prep" | "record" | "saving";

function pickMime() {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
}

function beep(freq = 880, ms = 180) {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + ms / 1000);
    setTimeout(() => ctx.close(), ms + 100);
  } catch { /* ignore */ }
}

export function SpeakingSection({ attemptId, done, onTask, onDone }: { attemptId: string; done: SpeakingRec[]; onTask: (r: SpeakingRec) => void; onDone: () => void }) {
  const idx = Math.min(done.length, SPEAKING_TASKS.length - 1);
  const task = SPEAKING_TASKS[idx];
  const [phase, setPhase] = useState<Phase>("ready");
  const [remaining, setRemaining] = useState(0);
  const [level, setLevel] = useState<number[]>(Array(32).fill(0.05));
  const [micError, setMicError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const asrRef = useRef<LiveRecognizer | null>(null);
  const startedAt = useRef(0);
  const raf = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopping = useRef(false);

  useEffect(() => {
    if (done.length >= SPEAKING_TASKS.length) onDone();
  }, [done.length, onDone]);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    if (timer.current) clearInterval(timer.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const countdown = (secs: number, then: () => void) => {
    if (timer.current) clearInterval(timer.current);
    const end = Date.now() + secs * 1000;
    setRemaining(secs * 1000);
    timer.current = setInterval(() => {
      const l = Math.max(0, end - Date.now());
      setRemaining(l);
      if (l === 0) { clearInterval(timer.current!); then(); }
    }, 200);
  };

  const startPrep = async () => {
    setMicError(null);
    try {
      streamRef.current ??= await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setMicError("No pudimos acceder al micrófono. Permite el acceso en tu navegador y vuelve a intentarlo.");
      return;
    }
    setPhase("prep");
    countdown(task.prepSeconds, startRecording);
  };

  const startRecording = () => {
    const stream = streamRef.current!;
    beep();
    stopping.current = false;
    chunks.current = [];
    const mime = pickMime();
    try {
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.start(1000);
      recRef.current = mr;
    } catch { recRef.current = null; }
    asrRef.current = startRecognizer();
    startedAt.current = Date.now();
    setPhase("record");
    // waveform
    try {
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      const loop = () => {
        an.getByteFrequencyData(data);
        setLevel(Array.from(data).map((v) => Math.max(0.05, v / 255)));
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch { /* ignore */ }
    countdown(task.speakSeconds, stopRecording);
  };

  const stopRecording = async () => {
    if (stopping.current) return;
    stopping.current = true;
    if (timer.current) clearInterval(timer.current);
    cancelAnimationFrame(raf.current);
    setPhase("saving");
    beep(660, 140);
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    const mr = recRef.current;
    const blob = await new Promise<Blob | null>((res) => {
      if (!mr || mr.state === "inactive") return res(null);
      mr.onstop = () => res(new Blob(chunks.current, { type: mr.mimeType || "audio/webm" }));
      mr.stop();
    });
    const asr = asrRef.current ? await asrRef.current.stop() : { transcript: "", confidence: null };
    let audioPath: string | undefined;
    if (blob && blob.size > 0) {
      try {
        const fd = new FormData();
        fd.append("file", blob, `${task.id}.webm`);
        fd.append("attemptId", attemptId);
        fd.append("taskId", task.id);
        const r = await fetch("/api/audio", { method: "POST", body: fd });
        const j = await r.json().catch(() => ({}));
        if (j?.path) audioPath = j.path;
      } catch { /* audio upload is best-effort */ }
    }
    onTask({ taskId: task.id, transcript: asr.transcript, durationSec, asrConfidence: asr.confidence, audioPath });
    setPhase("ready");
    setLevel(Array(32).fill(0.05));
  };

  if (done.length >= SPEAKING_TASKS.length) return null;
  const elapsed = phase === "record" ? task.speakSeconds * 1000 - remaining : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Speaking</div>
          <div className="mt-1 flex items-center gap-2">
            {SPEAKING_TASKS.map((t, i) => <span key={t.id} className={`h-1.5 rounded-full ${i < done.length ? "w-8 bg-navy" : i === idx ? "w-12 bg-gold" : "w-8 bg-line"}`} />)}
            <span className="ml-2 text-xs text-slate-500">Tarea {idx + 1} de {SPEAKING_TASKS.length}</span>
          </div>
        </div>
      </div>

      <Card key={task.id} className="animate-rise">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-navy">{task.title}</span>
          <span className="text-xs text-slate-400">Preparación {task.prepSeconds}s · Respuesta hasta {task.speakSeconds}s</span>
        </div>
        <p className="mt-5 font-display text-xl font-bold leading-snug text-navy sm:text-2xl">{task.prompt}</p>
        {task.bullets && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {task.bullets.map((b) => <li key={b} className="rounded-2xl bg-mist px-4 py-3 text-sm text-slate-600 ring-1 ring-line">{b}</li>)}
          </ul>
        )}

        <div className="mt-8 rounded-3xl bg-navy p-6 text-white sm:p-8">
          {phase === "ready" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="max-w-md text-sm text-white/70">Al pulsar el botón tendrás {task.prepSeconds} segundos para pensar. Luego sonará un tono y comenzará la grabación automáticamente.</p>
              <button onClick={startPrep} className="rounded-2xl bg-gold px-7 py-3.5 font-display font-bold text-navy-950 shadow-xl shadow-gold/20 transition hover:bg-gold-300">Empezar preparación</button>
              {micError && <p className="text-sm text-gold">{micError}</p>}
            </div>
          )}
          {phase === "prep" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Prepárate</div>
              <div className="font-display text-6xl font-extrabold tabular-nums">{Math.ceil(remaining / 1000)}</div>
              <p className="text-sm text-white/60">Organiza tus ideas. La grabación empieza sola.</p>
              <button onClick={() => { if (timer.current) clearInterval(timer.current); startRecording(); }} className="mt-2 text-sm font-semibold text-gold underline-offset-4 hover:underline">Estoy listo, grabar ahora</button>
            </div>
          )}
          {(phase === "record" || phase === "saving") && (
            <div className="flex flex-col items-center gap-5">
              <div className="flex items-center gap-3">
                <span className={`h-3.5 w-3.5 rounded-full bg-sdg-red ${phase === "record" ? "animate-pulse-ring" : ""}`} />
                <span className="text-xs font-semibold uppercase tracking-[0.25em]">{phase === "record" ? "Grabando" : "Guardando…"}</span>
                <span className="font-display text-lg font-bold tabular-nums">{fmt(remaining)}</span>
              </div>
              <div className="flex h-20 w-full max-w-md items-center justify-center gap-1">
                {level.map((v, i) => <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-gold to-sdg-teal transition-[height] duration-75" style={{ height: `${Math.max(6, v * 100)}%` }} />)}
              </div>
              <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold" style={{ width: `${(elapsed / (task.speakSeconds * 1000)) * 100}%` }} /></div>
              <PrimaryButton disabled={phase !== "record" || elapsed < 8000} onClick={stopRecording} className="!bg-white !text-navy">
                <span className="h-3 w-3 rounded-sm bg-sdg-red" /> Terminé
              </PrimaryButton>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
