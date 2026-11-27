import { CEFR_BANDS } from "@/lib/cefr";

export function CefrScale({ active, compact = false }: { active?: string | null; compact?: boolean }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {CEFR_BANDS.map((b) => {
        const on = b.level === active;
        return (
          <div key={b.level} className={`rounded-xl px-2 py-2.5 text-center transition ${on ? "bg-navy text-white shadow-lg shadow-navy/30 ring-2 ring-gold" : "bg-white text-slate-500 ring-1 ring-line"}`}>
            <div className={`font-display text-sm font-extrabold sm:text-base ${on ? "text-gold" : "text-navy"}`}>{b.level}</div>
            {!compact && <div className="mt-0.5 hidden text-[10px] leading-tight sm:block">{b.es}</div>}
            <div className={`mt-1 text-[10px] tabular-nums ${on ? "text-white/70" : "text-slate-400"}`}>{b.min}–{b.max}</div>
          </div>
        );
      })}
    </div>
  );
}
