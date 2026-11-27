import Image from "next/image";

const BADGES = [
  { en: "Reading", es: "Lectura", grad: "from-sdg-blue to-navy-600", icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M14 3v5h5 M8 13h8 M8 17h5", angle: 180 },
  { en: "Listening", es: "Audio", grad: "from-sdg-teal to-sdg-blue", icon: "M3 14v-2a9 9 0 0118 0v2 M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2v-3z M21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2v-3z", angle: -90 },
  { en: "Writing", es: "Escritura", grad: "from-gold to-sdg-orange", icon: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z", angle: 0 },
  { en: "Speaking", es: "Oral", grad: "from-sdg-magenta to-sdg-red", icon: "M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v3", angle: 90 },
];

/** Spinning INTER emblem with the four skills orbiting around it (no fake data). */
export function HeroOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[26rem] sm:max-w-[30rem]">
      {/* glow + rings */}
      <div className="absolute inset-[18%] animate-glow rounded-full bg-gradient-to-tr from-gold/40 via-royal/40 to-sdg-teal/30 blur-3xl" />
      <div className="absolute inset-[6%] rounded-full border border-white/10" />
      <div className="absolute inset-[6%] animate-orbit rounded-full border border-dashed border-gold/25" />
      <div className="absolute inset-[24%] rounded-full border border-white/[0.07]" />

      {/* emblem */}
      <div className="absolute inset-[22%]">
        <Image src="/brand/inter-emblem.png" alt="" fill sizes="(max-width: 640px) 60vw, 300px" className="animate-spin-slow object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.45)]" priority />
      </div>

      {/* orbiting skills */}
      <div className="absolute inset-0 animate-orbit">
        {BADGES.map((b) => {
          const r = 44;
          const left = 50 + r * Math.cos((b.angle * Math.PI) / 180);
          const top = 50 + r * Math.sin((b.angle * Math.PI) / 180);
          return (
            <div key={b.en} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }}>
              <div className="animate-orbit-rev">
                <div className="flex items-center gap-2.5 rounded-2xl bg-navy/70 py-2 pl-2 pr-4 shadow-2xl shadow-black/40 ring-1 ring-white/15 backdrop-blur-xl transition hover:scale-105">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${b.grad} text-white shadow-lg`}>
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={b.icon} /></svg>
                  </span>
                  <span className="leading-tight">
                    <span className="block font-display text-sm font-bold text-white">{b.en}</span>
                    <span className="block text-[11px] text-white/60">{b.es}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
