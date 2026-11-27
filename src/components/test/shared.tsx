"use client";
import { useEffect, useRef, useState } from "react";

export type Stage =
  | "register" | "check"
  | "intro-reading" | "reading"
  | "intro-listening" | "listening"
  | "intro-writing" | "writing"
  | "intro-speaking" | "speaking"
  | "submitting";

export interface AnswerRec { testletId: string; questionId: string; choice: number | null; ms?: number }
export interface SpeakingRec { taskId: string; transcript: string; durationSec: number; asrConfidence: number | null; audioPath?: string }
export interface CandidateIn { fullName: string; email: string; phone?: string; studentId?: string; organization?: string; cohort?: string; purpose?: string }

export interface Integrity {
  tabSwitches: number;
  pasteAttempts: number;
  copyAttempts?: number;
  screenshotAttempts?: number;
  focusLosses?: number;
  fullscreenExits?: number;
  printAttempts?: number;
  devtoolsAttempts?: number;
}

export interface TestState {
  attemptId: string;
  startedAt: string;
  stage: Stage;
  candidate?: CandidateIn;
  reading: AnswerRec[];
  listening: AnswerRec[];
  readingDone: boolean;
  listeningDone: boolean;
  writing: Record<string, string>;
  speaking: SpeakingRec[];
  deadlines: Partial<Record<"reading" | "listening" | "writing", number>>;
  integrity: Integrity;
  plays: Record<string, number>;
}

export const SECTION_MINUTES = { reading: 20, listening: 15, writing: 25 } as const;

export function newAttemptId() {
  const a = "23456789abcdefghjkmnpqrstuvwxyz";
  return "ipt_" + Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => a[b % a.length]).join("");
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

export function Timer({ ms, total }: { ms: number; total: number }) {
  const low = ms < 60_000;
  const pct = total ? ms / total : 0;
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ring-1 ${low ? "bg-sdg-red/10 text-sdg-red ring-sdg-red/30" : "bg-white text-navy ring-line"}`}>
      <svg className="h-4 w-4" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth="5" />
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray={94.2} strokeDashoffset={94.2 * (1 - pct)} transform="rotate(-90 18 18)" />
      </svg>
      {fmt(ms)}
    </div>
  );
}

export function PrimaryButton({ children, disabled, onClick, type = "button", className = "" }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit"; className?: string }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-navy px-6 py-3.5 font-display text-sm font-bold text-white shadow-lg shadow-navy/20 transition hover:-translate-y-0.5 hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 ring-1 ring-line sm:p-8 ${className}`}>{children}</div>;
}
