/**
 * Multistage adaptive routing for Reading & Listening.
 * Stateless: the server recomputes the route from the list of answers the client sends,
 * so answer keys never leave the server and a refreshed browser can resume.
 */
import { BANK, getQuestion, getTestlet, itemDifficulty, LEVEL_ORDER, START_LEVEL_INDEX, TESTLETS_PER_SECTION, toPublic } from "./bank";
import type { ObjectiveSkill, PublicTestlet } from "./bank";
import { scoreToCefr, thetaToScore, type Cefr } from "./cefr";
import { estimateAbility, type IrtResponse } from "./irt";

export interface AnswerIn {
  testletId: string;
  questionId: string;
  choice: number | null; // null = no answer / timed out
  ms?: number;
}

export interface ItemResult {
  questionId: string;
  testletId: string;
  level: string;
  difficulty: number;
  correct: boolean;
  choice: number | null;
  ms?: number;
}

export interface ObjectiveSectionResult {
  skill: ObjectiveSkill;
  score: number;
  cefr: Cefr;
  theta: number;
  sem: number;
  correct: number;
  total: number;
  route: string[]; // testlet ids in order
  items: ItemResult[];
}

function gradeAnswers(answers: AnswerIn[]): ItemResult[] {
  const out: ItemResult[] = [];
  for (const a of answers) {
    const hit = getQuestion(a.questionId);
    if (!hit || hit.testlet.id !== a.testletId) continue;
    out.push({
      questionId: a.questionId,
      testletId: a.testletId,
      level: hit.testlet.level,
      difficulty: itemDifficulty(hit.testlet, hit.question),
      correct: a.choice !== null && a.choice === hit.question.answer,
      choice: a.choice,
      ms: a.ms,
    });
  }
  return out;
}

function route(skill: ObjectiveSkill, items: ItemResult[]) {
  const seen: string[] = [];
  for (const it of items) if (!seen.includes(it.testletId)) seen.push(it.testletId);
  let levelIdx = START_LEVEL_INDEX;
  for (const tid of seen) {
    const t = getTestlet(tid)!;
    const its = items.filter((i) => i.testletId === tid);
    const p = its.filter((i) => i.correct).length / Math.max(1, t.questions.length);
    const idx = LEVEL_ORDER.indexOf(t.level);
    if (p >= 0.66) levelIdx = Math.min(LEVEL_ORDER.length - 1, idx + 1);
    else if (p <= 0.34) levelIdx = Math.max(0, idx - 1);
    else levelIdx = idx;
  }
  return { seen, levelIdx };
}

/** FNV-1a → [0,1). Seeded tie-break so a reload cannot re-draw a different testlet. */
function seeded(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 4294967296;
}

function pickTestlet(skill: ObjectiveSkill, levelIdx: number, used: string[], seed?: string) {
  const pool = BANK[skill].filter((t) => !used.includes(t.id));
  // nearest level first, prefer exact, then one up/down alternately
  const order = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
  for (const d of order) {
    const lvl = LEVEL_ORDER[levelIdx + d];
    if (!lvl) continue;
    const c = pool.filter((t) => t.level === lvl);
    // Same routing rule as v1.0; only the choice among equivalent testlets is now reproducible per attempt.
    if (c.length) return c[Math.floor((seed ? seeded(`${seed}:${skill}:${used.length}`) : Math.random()) * c.length)];
  }
  return undefined;
}

export function nextStep(skill: ObjectiveSkill, answers: AnswerIn[], seed?: string): { done: false; testlet: PublicTestlet; index: number; total: number } | { done: true; result: ObjectiveSectionResult } {
  const items = gradeAnswers(answers).filter((i) => getTestlet(i.testletId)?.skill === skill);
  const { seen, levelIdx } = route(skill, items);
  if (seen.length < TESTLETS_PER_SECTION) {
    const t = pickTestlet(skill, levelIdx, seen, seed);
    if (t) return { done: false, testlet: toPublic(t), index: seen.length, total: TESTLETS_PER_SECTION };
  }
  return { done: true, result: scoreSection(skill, items, seen) };
}

export function scoreSection(skill: ObjectiveSkill, items: ItemResult[], routeIds?: string[]): ObjectiveSectionResult {
  const resp: IrtResponse[] = items.map((i) => ({ b: i.difficulty, correct: i.correct }));
  const { theta, sem } = estimateAbility(resp);
  const score = thetaToScore(theta);
  return {
    skill,
    score,
    cefr: scoreToCefr(score),
    theta: Math.round(theta * 1000) / 1000,
    sem: Math.round(sem * 1000) / 1000,
    correct: items.filter((i) => i.correct).length,
    total: items.length,
    route: routeIds ?? [...new Set(items.map((i) => i.testletId))],
    items,
  };
}

/** Re-grade a whole section from raw answers (used when the final result is submitted). */
export function gradeSection(skill: ObjectiveSkill, answers: AnswerIn[]) {
  const items = gradeAnswers(answers).filter((i) => getTestlet(i.testletId)?.skill === skill);
  return scoreSection(skill, items);
}
