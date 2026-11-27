"use client";
/** Browser speech helpers: TTS for Listening, ASR for Speaking. */

const FEMALE = /(samantha|victoria|karen|moira|tessa|serena|susan|zira|aria|jenny|emma|ava|allison|female|libby|sonia|natasha|google us english|google uk english female|fiona|kate)/i;
const MALE = /(daniel|alex|fred|tom|oliver|arthur|guy|david|mark|ryan|christopher|eric|male|george|aaron|google uk english male|rishi)/i;

let voicesCache: SpeechSynthesisVoice[] = [];
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);
  const v = window.speechSynthesis.getVoices();
  if (v.length) return Promise.resolve((voicesCache = v));
  return new Promise((res) => {
    const done = () => res((voicesCache = window.speechSynthesis.getVoices()));
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

function pickVoice(kind: "f" | "m") {
  const en = voicesCache.filter((v) => /^en[-_](US|GB|CA|AU|IE)/i.test(v.lang));
  const pool = en.length ? en : voicesCache.filter((v) => v.lang.startsWith("en"));
  const re = kind === "f" ? FEMALE : MALE;
  const natural = pool.filter((v) => /natural|neural|online|google|premium|enhanced/i.test(v.name));
  return natural.find((v) => re.test(v.name)) ?? pool.find((v) => re.test(v.name)) ?? natural[0] ?? pool[0];
}

export function ttsAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Speaks lines in order. Resolves true if at least one utterance actually started (used for fair play counting). */
export async function speakLines(lines: { voice: "f" | "m"; text: string }[], opts: { rate?: number; onLine?: (i: number) => void; onStart?: () => void; signal?: AbortSignal } = {}): Promise<boolean> {
  let started = false;
  await loadVoices();
  if (!ttsAvailable()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  for (let i = 0; i < lines.length; i++) {
    if (opts.signal?.aborted) return started;
    opts.onLine?.(i);
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(lines[i].text);
      const v = pickVoice(lines[i].voice);
      if (v) u.voice = v;
      u.lang = v?.lang ?? "en-US";
      u.rate = opts.rate ?? 0.95;
      // if both genders resolve to the same voice, differentiate by pitch
      const other = pickVoice(lines[i].voice === "f" ? "m" : "f");
      u.pitch = v && other && v.name === other.name ? (lines[i].voice === "m" ? 0.75 : 1.15) : 1;
      u.onstart = () => { if (!started) { started = true; opts.onStart?.(); } };
      u.onend = () => resolve();
      u.onerror = () => resolve();
      opts.signal?.addEventListener("abort", () => { synth.cancel(); resolve(); }, { once: true });
      synth.speak(u);
      // Chrome bug: long utterances can stall; keep the engine alive
      const keepAlive = setInterval(() => { if (!synth.speaking) clearInterval(keepAlive); else { synth.pause(); synth.resume(); } }, 10000);
      u.addEventListener("end", () => clearInterval(keepAlive));
    });
    await new Promise((r) => setTimeout(r, 450));
  }
  return started;
}

// ── Speech recognition ───────────────────────────────────────
 
export function getRecognitionCtor(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}
export const asrAvailable = () => Boolean(getRecognitionCtor());

export interface LiveRecognizer {
  stop: () => Promise<{ transcript: string; confidence: number | null }>;
}

export function startRecognizer(): LiveRecognizer | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const finals: { text: string; conf: number }[] = [];
  let active = true;
  let rec: any;
  const spawn = () => {
    rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finals.push({ text: r[0].transcript.trim(), conf: typeof r[0].confidence === "number" && r[0].confidence > 0 ? r[0].confidence : NaN });
      }
    };
    rec.onend = () => { if (active) try { spawn(); } catch { /* ignore */ } };
    rec.onerror = () => { /* "no-speech" etc. — onend will restart */ };
    try { rec.start(); } catch { /* already started */ }
  };
  spawn();
  return {
    stop: () =>
      new Promise((resolve) => {
        active = false;
        const finish = () => {
          const confs = finals.map((f) => f.conf).filter((c) => !Number.isNaN(c));
          resolve({ transcript: finals.map((f) => f.text).join(" ").replace(/\s+/g, " ").trim(), confidence: confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null });
        };
        try { rec.onend = finish; rec.stop(); } catch { finish(); }
        setTimeout(finish, 1800);
      }),
  };
}
