"use client";
import { useEffect, useState } from "react";
import { CEFR_LEVELS } from "@/lib/cefr";
import { CefrScale } from "../CefrScale";

/** CEFR scale that "climbs" from A0 to C2 in a loop. */
export function ScaleCycler() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % CEFR_LEVELS.length), 1300);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <CefrScale active={CEFR_LEVELS[i]} />
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-gradient-to-r from-sdg-red via-gold to-sdg-green transition-all duration-700" style={{ width: `${((i + 1) / CEFR_LEVELS.length) * 100}%` }} />
      </div>
    </div>
  );
}
