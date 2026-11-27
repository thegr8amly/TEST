import type { Cefr } from "../cefr";

export type BankLevel = Exclude<Cefr, "A0">;
export type ObjectiveSkill = "reading" | "listening";

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  /** index of the correct option — NEVER sent to the browser */
  answer: number;
  /** fine-tuning of difficulty relative to the testlet level, in logits */
  offset?: number;
}

export interface DialogueLine {
  speaker: string;
  voice: "f" | "m";
  text: string;
}

export interface Testlet {
  id: string;
  skill: ObjectiveSkill;
  level: BankLevel;
  title: string;
  /** Reading: passage (supports blank lines for paragraphs) */
  passage?: string;
  /** Listening: what the candidate hears (rendered with speech synthesis) */
  script?: DialogueLine[];
  /** short instruction shown above the item */
  context: string;
  questions: Question[];
}

/** Sanitised versions sent to the client (no keys, no listening transcript). */
export interface PublicQuestion {
  id: string;
  prompt: string;
  options: string[];
}
export interface PublicTestlet {
  id: string;
  skill: ObjectiveSkill;
  title: string;
  passage?: string;
  /** listening audio lines are sent for client-side TTS; transcript is never displayed */
  script?: DialogueLine[];
  context: string;
  questions: PublicQuestion[];
}
