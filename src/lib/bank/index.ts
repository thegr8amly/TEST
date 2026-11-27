import { LEVEL_DIFFICULTY } from "../cefr";
import { LISTENING } from "./listening";
import { READING } from "./reading";
import type { BankLevel, ObjectiveSkill, PublicTestlet, Question, Testlet } from "./types";

export const LEVEL_ORDER: BankLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const TESTLETS_PER_SECTION = 5;
export const START_LEVEL_INDEX = 2; // B1 — routing starts mid-scale

export const BANK: Record<ObjectiveSkill, Testlet[]> = { reading: READING, listening: LISTENING };

const byId = new Map<string, Testlet>();
const questionIndex = new Map<string, { testlet: Testlet; question: Question }>();
for (const t of [...READING, ...LISTENING]) {
  byId.set(t.id, t);
  for (const q of t.questions) questionIndex.set(q.id, { testlet: t, question: q });
}

export function getTestlet(id: string) {
  return byId.get(id);
}
export function getQuestion(id: string) {
  return questionIndex.get(id);
}
export function itemDifficulty(testlet: Testlet, q: Question) {
  return LEVEL_DIFFICULTY[testlet.level] + (q.offset ?? 0);
}

export function toPublic(t: Testlet): PublicTestlet {
  return {
    id: t.id,
    skill: t.skill,
    title: t.title,
    passage: t.passage,
    script: t.script,
    context: t.context,
    questions: t.questions.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options })),
  };
}

export * from "./types";
