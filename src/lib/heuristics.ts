/**
 * Fallback automatic scoring for Writing/Speaking when no AI key is configured
 * (or the AI call fails). Uses observable linguistic features only, so results
 * are capped at C1 and always flagged "provisional — teacher review".
 */
import { scoreToCefr, type Cefr } from "./cefr";

const CONNECTORS_BASIC = ["and", "but", "because", "so", "or", "then", "also", "when"];
const CONNECTORS_ADV = [
  "however", "although", "though", "moreover", "therefore", "nevertheless", "whereas", "consequently",
  "furthermore", "in addition", "on the other hand", "despite", "in spite of", "unless", "as a result",
  "for instance", "for example", "in contrast", "even though", "while", "instead", "meanwhile",
  "overall", "in conclusion", "to sum up", "not only", "rather than", "as long as", "provided that",
  "in fact", "indeed", "thus", "hence", "otherwise", "whether",
];
const SUBORDINATORS = ["which", "who", "whom", "whose", "that", "if", "because", "since", "although", "while", "when", "where", "unless", "until", "whether"];

export interface TextFeatures {
  words: number;
  sentences: number;
  avgSentenceLength: number;
  msttr: number; // mean segmental type-token ratio (40-word segments)
  longWordRatio: number;
  advConnectorsPer100: number;
  basicConnectorsPer100: number;
  subordinationPerSentence: number;
  nonAsciiRatio: number;
}

export function tokenize(text: string) {
  return (text.toLowerCase().match(/[a-z']+/g) ?? []).filter(Boolean);
}

export function analyzeText(text: string): TextFeatures {
  const tokens = tokenize(text);
  const words = tokens.length;
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length || (words > 0 ? 1 : 0));
  const seg = 40;
  let msttr = 0;
  if (words >= seg) {
    const n = Math.floor(words / seg);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += new Set(tokens.slice(i * seg, (i + 1) * seg)).size / seg;
    msttr = sum / n;
  } else if (words > 0) {
    msttr = new Set(tokens).size / words;
  }
  const lower = ` ${tokens.join(" ")} `;
  const count = (list: string[]) => list.reduce((acc, c) => acc + (lower.split(` ${c} `).length - 1), 0);
  const letters = text.replace(/\s/g, "");
  return {
    words,
    sentences,
    avgSentenceLength: words / sentences,
    msttr,
    longWordRatio: words ? tokens.filter((t) => t.length >= 7).length / words : 0,
    advConnectorsPer100: words ? (count(CONNECTORS_ADV) / words) * 100 : 0,
    basicConnectorsPer100: words ? (count(CONNECTORS_BASIC) / words) * 100 : 0,
    subordinationPerSentence: count(SUBORDINATORS) / sentences,
    nonAsciiRatio: letters.length ? (letters.match(/[áéíóúñ¿¡]/gi) ?? []).length / letters.length : 0,
  };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const scale = (x: number, lo: number, hi: number) => clamp01((x - lo) / (hi - lo));

/** Map features to an approximate 0–100 INTER score (cap 70 = top of C1). */
export function featureScore(f: TextFeatures, minWords: number): number {
  if (f.words < 5) return 5;
  const length = scale(f.words, minWords * 0.3, minWords);
  const lexis = 0.55 * scale(f.msttr, 0.55, 0.82) + 0.45 * scale(f.longWordRatio, 0.08, 0.3);
  const syntax = 0.5 * scale(f.avgSentenceLength, 6, 20) + 0.5 * scale(f.subordinationPerSentence, 0.2, 1.6);
  const cohesion = 0.7 * scale(f.advConnectorsPer100, 0, 3) + 0.3 * scale(f.basicConnectorsPer100, 1, 5);
  let composite = 0.3 * lexis + 0.3 * syntax + 0.25 * cohesion + 0.15 * length;
  composite *= 0.5 + 0.5 * length; // short responses can't show range
  if (f.nonAsciiRatio > 0.01) composite *= 0.7; // Spanish mixed in
  return Math.round(12 + composite * 58);
}

export interface HeuristicResult {
  score: number;
  cefr: Cefr;
  perTask: { taskId: string; score: number; features: TextFeatures }[];
}

export function heuristicScore(items: { taskId: string; text: string; minWords: number; weight: number }[]): HeuristicResult {
  const perTask = items.map((it) => {
    const features = analyzeText(it.text);
    return { taskId: it.taskId, score: featureScore(features, it.minWords), features };
  });
  const wsum = items.reduce((a, b) => a + b.weight, 0) || 1;
  const score = Math.round(perTask.reduce((acc, t, i) => acc + t.score * items[i].weight, 0) / wsum);
  return { score, cefr: scoreToCefr(score), perTask };
}
