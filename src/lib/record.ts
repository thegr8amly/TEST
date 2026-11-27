/**
 * INTER Baseline Record — the integration contract between the Placement Test,
 * the Campus Virtual (app/web) and the Executive Learning Report (ELR).
 * Schema id: "inter.placement.v1". See docs/INTEGRATION.md.
 */
import type { ObjectiveSectionResult } from "./adaptive";
import type { Assessment } from "./ai-scoring";
import type { Cefr } from "./cefr";
import type { Placement, SkillKey } from "./placement";

export interface Candidate {
  fullName: string;
  email: string;
  phone?: string;
  studentId?: string;
  organization?: string;
  cohort?: string;
  purpose?: string;
}

export interface SkillResult {
  score: number | null;
  cefr: Cefr | null;
  status: "scored" | "provisional" | "pending_review";
  method: "irt-eap" | "ai-rubric" | "heuristic" | "none";
  sem?: number; // standard error (score points) for IRT sections
  correct?: number;
  total?: number;
  assessment?: Assessment;
  model?: string;
  note?: string;
}

export interface BaselineRecord {
  schema: "inter.placement.v1";
  id: string;
  test: { name: "INTER Placement Test"; version: string; form: string };
  startedAt: string;
  completedAt: string;
  durationSec: number;
  candidate: Candidate;
  skills: Record<SkillKey, SkillResult>;
  overall: { score: number; cefr: Cefr; skillsCounted: SkillKey[] };
  placement: {
    moduleId: string;
    moduleName: string;
    program: string;
    cefrTarget: string;
    index: number;
    rationale: string;
    focusAreas: SkillKey[];
    reviewRequired: boolean;
    provisionalModuleName?: boolean;
  };
  /** ELR-ready block: this is "T0" of the student's learning curve. */
  elr: {
    measurement: "T0";
    baselineCefr: Cefr;
    skills: Record<SkillKey, number | null>;
    alerts: Placement["alerts"];
  };
  integrity: { tabSwitches: number; pasteAttempts: number; userAgent: string; speechRecognition: boolean };
  responses: {
    reading: ObjectiveSectionResult["items"];
    listening: ObjectiveSectionResult["items"];
    readingRoute: string[];
    listeningRoute: string[];
    writing: { taskId: string; text: string; words: number }[];
    speaking: { taskId: string; transcript: string; durationSec: number; asrConfidence: number | null; audioPath?: string }[];
  };
  persisted?: boolean;
}

export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  return "ipt_" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
