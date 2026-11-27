"use client";
import { useEffect, useRef, useState } from "react";
import { fmt, useCountdown } from "./shared";

/** Prominent countdown for the sticky exam header, with 5-min and 1-min alerts. */
export function HeaderTimer({ deadline, totalMs, label }: { deadline: number; totalMs: number; label: string }) {
  const left = useCountdown(deadline);
  const [alert, setAlert] = useState<string | null>(null);
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const m of [5, 1]) {
      if (left > 0 && left <= m * 60_000 && left > (m * 60_000 - 3000) && !fired.current.has(m)) {
        fired.current.add(m);
        setAlert(m === 1 ? "¡Queda 1 minuto!" : `Quedan ${m} minutos`);
        setTimeout(() => setAlert(null), 4000);
      }
    }
  }, [left]);

  const pct = totalMs ? Math.max(0, Math.min(1, left / totalMs)) : 0;
  const state = left <= 60_000 ? "crit" : left <= 5 * 60_000 ? "warn" : "ok";
  const color = state === "crit" ? "#d13b45" : state === "warn" ? "#eb7419" : "#132544";
  const R = 19;
  const C = 2 * Math.PI * R;
  const [mm, ss] = fmt(left).split(":");

  return (
    <>
      <div className={`flex items-center gap-3 rounded-2xl py-1.5 pl-1.5 pr-4 ring-1 transition-colors duration-500 ${state === "crit" ? "bg-sdg-red/10 ring-sdg-red/30 animate-shake" : state === "warn" ? "bg-sdg-orange/10 ring-sdg-orange/30" : "bg-white ring-line"}`} style={state === "crit" ? { animationIterationCount: "infinite", animationDuration: "2.5s" } : undefined}>
        <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
          <circle cx="23" cy="23" r={R} fill="none" stroke={color} strokeOpacity="0.12" strokeWidth="5" />
          <circle cx="23" cy="23" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset 0.5s linear, stroke 0.5s" }} />
        </svg>
        <div className="leading-none">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
          <div className="mt-1 font-display text-2xl font-extrabold tabular-nums" style={{ color }}>
            {mm}<span className="animate-tick">:</span>{ss}
          </div>
        </div>
      </div>
      {alert && (
        <div className={`fixed left-1/2 top-24 z-50 flex animate-toast items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl ${state === "crit" ? "bg-sdg-red" : "bg-sdg-orange"}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {alert}
        </div>
      )}
    </>
  );
}
