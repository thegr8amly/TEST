import { CEFR_BANDS } from "@/lib/cefr";

/** Display-only labels; cut-offs come from CEFR_BANDS and are never changed here. */
const DISPLAY: Record<string, string> = { A0: "Pre-A1" };

export function CefrScale({ active }: { active?: string | null }) {
  return (
    <ol className="grid grid-cols-7 overflow-hidden rounded-xl border border-line bg-white" aria-label="Escala INTER y niveles MCER">
      {CEFR_BANDS.map((b, i) => {
        const on = b.level === active;
        return (
          <li key={b.level} aria-current={on ? "true" : undefined} className={`px-1.5 py-3 text-center sm:px-2 ${i ? "border-l border-line" : ""} ${on ? "bg-navy text-white" : ""}`}>
            <div className={`font-display text-sm font-extrabold sm:text-lg ${on ? "text-gold" : "text-navy"}`}>{DISPLAY[b.level] ?? b.level}</div>
            <div className={`mt-0.5 hidden text-xs leading-tight sm:block ${on ? "text-white/85" : "text-slate-600"}`}>{b.es}</div>
            <div className={`mt-1 text-[11px] tabular-nums sm:text-xs ${on ? "text-white/85" : "text-slate-600"}`}>{b.min}–{b.max}</div>
          </li>
        );
      })}
    </ol>
  );
}
