"use client";
import { useEffect, useState } from "react";

const COLORS: Record<string, string> = {
  A0: "#94a3b8", A1: "#d13b45", A2: "#eb7419", B1: "#f5a03a", B2: "#0a79b8", C1: "#26467f", C2: "#43a535",
};
export const cefrColor = (c?: string | null) => (c ? COLORS[c] ?? "#132544" : "#cbd5e1");

export function ScoreRing({ score, cefr, size = 120, stroke = 10, label, sub, dark = false }: { score: number | null; cefr?: string | null; size?: number; stroke?: number; label?: string; sub?: string; dark?: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (score === null) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1200);
      setV(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = cefrColor(cefr);
  const pct = score === null ? 0 : v / 100;
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgb(255 255 255 / 0.12)" : "#e8edf5"} strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-extrabold tabular-nums ${dark ? "text-white" : "text-navy"}`} style={{ fontSize: size * 0.28 }}>
            {score === null ? "—" : v}
          </span>
          {cefr && <span className="font-display text-xs font-bold tracking-wider" style={{ color }}>{cefr}</span>}
        </div>
      </div>
      {label && <div className={`mt-3 font-display text-sm font-bold ${dark ? "text-white" : "text-navy"}`}>{label}</div>}
      {sub && <div className={`text-xs ${dark ? "text-white/60" : "text-slate-500"}`}>{sub}</div>}
    </div>
  );
}
