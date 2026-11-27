"use client";
import { useEffect, useRef, useState } from "react";

export type Stage =
  | "register"
  | "instructions"
  | "requirements"
  | "devices"
  | "intro-reading" | "reading"
  | "intro-listening" | "listening"
  | "intro-writing" | "writing"
  | "intro-speaking" | "speaking"
  | "review"
  | "submitting";

export const TIMED_STAGES: Stage[] = ["reading", "listening", "writing", "speaking"];

export interface AnswerRec { testletId: string; questionId: string; choice: number | null; ms?: number }
export interface SpeakingRec { taskId: string; transcript: string; durationSec: number; asrConfidence: number | null; audioPath?: string; audioUploaded?: boolean }
export interface CandidateIn { fullName: string; email: string; phone?: string; studentId?: string; organization?: string; cohort?: string; purpose?: string }
export interface InviteLink { org?: string; cohort?: string }

export interface Integrity {
  tabSwitches: number;
  pasteAttempts: number;
  copyAttempts?: number;
  screenshotAttempts?: number;
  focusLosses?: number;
  fullscreenExits?: number;
  printAttempts?: number;
  devtoolsAttempts?: number;
  sessionResumes?: number;
}

export interface TestState {
  attemptId: string;
  startedAt: string;
  stage: Stage;
  candidate?: CandidateIn;
  link?: InviteLink;
  reading: AnswerRec[];
  listening: AnswerRec[];
  readingDone: boolean;
  listeningDone: boolean;
  /** testlets fully submitted per section (for the review screen) */
  blocks?: { reading: number; listening: number };
  timedOut?: Partial<Record<"reading" | "listening" | "writing", boolean>>;
  writing: Record<string, string>;
  speaking: SpeakingRec[];
  deadlines: Partial<Record<"reading" | "listening" | "writing", number>>;
  integrity: Integrity;
  plays: Record<string, number>;
  savedAt?: number;
}

/** Section times — academic parameters (v1.0). Do not change without approval. */
export const SECTION_MINUTES = { reading: 20, listening: 15, writing: 25 } as const;

export function newAttemptId() {
  const a = "23456789abcdefghjkmnpqrstuvwxyz";
  return "ipt_" + Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => a[b % a.length]).join("");
}

/** fetch + JSON with exponential back-off on network errors and 5xx/429 (unstable connections). */
export async function fetchJSON<T>(url: string, init: RequestInit, opts: { retries?: number; onRetry?: (n: number) => void } = {}): Promise<T> {
  const retries = opts.retries ?? 4;
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, init);
      if (r.ok) return (await r.json()) as T;
      if (r.status < 500 && r.status !== 429) throw Object.assign(new Error(`HTTP ${r.status}`), { fatal: true });
      lastErr = new Error(`HTTP ${r.status}`);
    } catch (e) {
      if ((e as { fatal?: boolean }).fatal) throw e;
      lastErr = e;
    }
    if (i < retries) {
      opts.onRetry?.(i + 1);
      await new Promise((res) => setTimeout(res, Math.min(8000, 700 * 2 ** i)));
    }
  }
  throw lastErr;
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const set = () => setOnline(navigator.onLine);
    set();
    window.addEventListener("online", set);
    window.addEventListener("offline", set);
    return () => { window.removeEventListener("online", set); window.removeEventListener("offline", set); };
  }, []);
  return online;
}

export function useCountdown(deadline: number | undefined, onExpire?: () => void) {
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  useEffect(() => {
    fired.current = false;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [deadline]);
  const left = deadline ? Math.max(0, deadline - now) : 0;
  useEffect(() => {
    if (deadline && left === 0 && !fired.current) {
      fired.current = true;
      cb.current?.();
    }
  }, [left, deadline]);
  return left;
}

export function fmt(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── UI primitives (see .claude/skills/inter-design-system) ───────────────────
type BtnProps = { children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit"; className?: string; variant?: "primary" | "secondary" | "accent"; "aria-describedby"?: string };
export function Button({ children, disabled, onClick, type = "button", className = "", variant = "primary", ...rest }: BtnProps) {
  const v =
    variant === "accent"
      ? "bg-gold text-navy-950 hover:bg-gold-300"
      : variant === "secondary"
        ? "bg-white text-navy border border-line hover:border-navy/40"
        : "bg-navy text-white hover:bg-navy-700";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-describedby={rest["aria-describedby"]}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal disabled:cursor-not-allowed disabled:opacity-45 ${v} ${className}`}
    >
      {children}
    </button>
  );
}
/** @deprecated alias kept for existing imports */
export const PrimaryButton = Button;

export function Card({ children, className = "", as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "fieldset" }) {
  return <Tag className={`rounded-2xl border border-line bg-white p-6 sm:p-8 ${className}`}>{children}</Tag>;
}

export function StepHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mb-6">
      <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-royal">{eyebrow}</p>
      <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">{title}</h1>
      {lead && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">{lead}</p>}
    </div>
  );
}

export function Notice({ tone = "info", children, role }: { tone?: "info" | "warn" | "error" | "ok"; children: React.ReactNode; role?: "alert" | "status" }) {
  const t = {
    info: "border-line bg-mist text-slate-700",
    warn: "border-gold/60 bg-gold-100 text-[#5c3b00]",
    error: "border-sdg-red/40 bg-sdg-red/5 text-[#9b1c26]",
    ok: "border-sdg-green/40 bg-sdg-green/5 text-[#2c6e22]",
  }[tone];
  return <div role={role} className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${t}`}>{children}</div>;
}
