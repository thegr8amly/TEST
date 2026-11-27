/**
 * Lightweight 3PL IRT engine with EAP ability estimation on a fixed grid.
 * Good enough for a placement instrument; parameters are expert-set and should
 * be recalibrated once real response data is collected (see docs/PSYCHOMETRICS.md).
 */
export interface IrtItem {
  b: number; // difficulty (logit)
  a?: number; // discrimination
  c?: number; // pseudo-guessing
}
export interface IrtResponse extends IrtItem {
  correct: boolean;
}

const D = 1.7;
const GRID: number[] = Array.from({ length: 161 }, (_, i) => -5.5 + i * (11 / 160));

export function pCorrect(theta: number, item: IrtItem): number {
  const a = item.a ?? 1.1;
  const c = item.c ?? 0.2;
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - item.b)));
}

/** Expected a posteriori estimate with N(priorMean, priorSd²) prior. Returns theta and its posterior SD (≈ SEM). */
export function estimateAbility(responses: IrtResponse[], priorMean = 0, priorSd = 2) {
  const logPost = GRID.map((t) => {
    let lp = -0.5 * ((t - priorMean) / priorSd) ** 2;
    for (const r of responses) {
      const p = pCorrect(t, r);
      lp += Math.log(r.correct ? p : 1 - p);
    }
    return lp;
  });
  const max = Math.max(...logPost);
  const w = logPost.map((l) => Math.exp(l - max));
  const sum = w.reduce((a, b) => a + b, 0);
  const mean = GRID.reduce((acc, t, i) => acc + t * w[i], 0) / sum;
  const variance = GRID.reduce((acc, t, i) => acc + (t - mean) ** 2 * w[i], 0) / sum;
  return { theta: mean, sem: Math.sqrt(variance) };
}
