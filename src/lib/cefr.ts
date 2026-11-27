/**
 * INTER Score scale (0–100) and CEFR banding.
 * Cut-offs follow the widely used 0–100 ↔ CEFR convention (same banding
 * shown on EF SET certificates) so results are easy to compare.
 */
export const CEFR_LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Cefr = (typeof CEFR_LEVELS)[number];

export const CEFR_BANDS: { level: Cefr; min: number; max: number; es: string; en: string }[] = [
  { level: "A0", min: 0, max: 20, es: "Novato", en: "Beginner" },
  { level: "A1", min: 21, max: 30, es: "Principiante", en: "Elementary" },
  { level: "A2", min: 31, max: 40, es: "Básico", en: "Pre-intermediate" },
  { level: "B1", min: 41, max: 50, es: "Intermedio", en: "Intermediate" },
  { level: "B2", min: 51, max: 60, es: "Intermedio alto", en: "Upper intermediate" },
  { level: "C1", min: 61, max: 70, es: "Avanzado", en: "Advanced" },
  { level: "C2", min: 71, max: 100, es: "Proficiente", en: "Proficient" },
];

export function scoreToCefr(score: number): Cefr {
  const s = Math.round(score);
  for (const b of CEFR_BANDS) if (s >= b.min && s <= b.max) return b.level;
  return s > 100 ? "C2" : "A0";
}

export function bandInfo(level: Cefr) {
  return CEFR_BANDS.find((b) => b.level === level)!;
}

/** Ability (logit) ↔ score. Level centres: A1=-3 → 25, A2=-1.8 → 35, B1=-0.6 → 45, B2=0.6 → 55, C1=1.8 → 65, C2=3 → 75 */
export const THETA_SLOPE = 25 / 3; // 8.333 points per logit
export function thetaToScore(theta: number): number {
  return Math.max(0, Math.min(100, Math.round(50 + theta * THETA_SLOPE)));
}
export function scoreToTheta(score: number): number {
  return (score - 50) / THETA_SLOPE;
}

/** Item difficulty (logit) for the centre of each CEFR level used in the item bank. */
export const LEVEL_DIFFICULTY: Record<Exclude<Cefr, "A0">, number> = {
  A1: -3,
  A2: -1.8,
  B1: -0.6,
  B2: 0.6,
  C1: 1.8,
  C2: 3,
};

/** Representative score for a CEFR level (mid-band) — used when a rater gives a level, not a number. */
export function cefrToScore(level: Cefr, position: "low" | "mid" | "high" = "mid"): number {
  const b = bandInfo(level);
  if (level === "C2") return position === "low" ? 72 : position === "mid" ? 80 : 92;
  if (level === "A0") return position === "low" ? 8 : position === "mid" ? 14 : 19;
  return position === "low" ? b.min + 1 : position === "mid" ? Math.round((b.min + b.max) / 2) : b.max - 1;
}
