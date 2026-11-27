import Image from "next/image";

/** Skill accents (identity, not data). Order fixed: Listening top, Writing right, Speaking bottom, Reading left. */
const BADGES = [
  { en: "Listening", es: "Comprensión auditiva", color: "#31d0a1", icon: "M3 14v-2a9 9 0 0118 0v2 M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2v-3z M21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2v-3z", angle: -90 },
  { en: "Writing", es: "Expresión escrita", color: "#faac26", icon: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z", angle: 0 },
  { en: "Speaking", es: "Expresión oral", color: "#e0607f", icon: "M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v3", angle: 90 },
  { en: "Reading", es: "Comprensión lectora", color: "#4aa8e0", icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M14 3v5h5 M8 13h8 M8 17h5", angle: 180 },
];

/**
 * The INTER emblem with the four skills it measures in slow orbit.
 * Motion stops entirely under `prefers-reduced-motion`.
 */
export function HeroOrbit() {
  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[28rem]" aria-label="Las cuatro habilidades evaluadas: Reading, Listening, Writing y Speaking">
      <div aria-hidden className="absolute inset-[7%] rounded-full border border-white/15" />
      <div aria-hidden className="absolute inset-[7%] rounded-full border border-dashed border-gold/30 motion-safe:animate-orbit" />

      <div className="absolute inset-[23%]">
        <Image src="/brand/inter-emblem.png" alt="" fill sizes="(max-width: 640px) 55vw, 260px" className="object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.35)] motion-safe:animate-spin-slow" priority />
      </div>

      <ul className="absolute inset-0 motion-safe:animate-orbit">
        {BADGES.map((b) => {
          const r = 43;
          const left = 50 + r * Math.cos((b.angle * Math.PI) / 180);
          const top = 50 + r * Math.sin((b.angle * Math.PI) / 180);
          return (
            <li key={b.en} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }}>
              <div className="motion-safe:animate-orbit-rev">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-navy-900/90 py-1.5 pl-1.5 pr-3.5 shadow-lg shadow-black/25">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${b.color}26`, color: b.color }}>
                    <svg className="h-[17px] w-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={b.icon} /></svg>
                  </span>
                  <span className="leading-tight">
                    <span className="block font-display text-[13px] font-bold text-white">{b.en}</span>
                    <span className="block whitespace-nowrap text-[11px] text-white/70">{b.es}</span>
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
