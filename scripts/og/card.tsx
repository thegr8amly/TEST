/**
 * Source of the link-preview card (WhatsApp, iMessage, LinkedIn, Facebook, X…), 1200×630.
 * Rendered by scripts/og/render.tsx into src/app/opengraph-image.jpg (static JPEG < 150 KB,
 * because WhatsApp drops previews above ~300 KB). Follows .claude/skills/inter-design-system.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "INTER Placement Test — Descubre tu nivel real de inglés en cuatro habilidades";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKILLS = ["Reading", "Listening", "Writing", "Speaking"];
const SDG = ["#d13b45", "#f5a03a", "#4aa352", "#b31b2b", "#51b3d6", "#f8b800", "#0a79b8", "#31d0a1"];

export default async function renderCard() {
  const r = (p: string) => readFile(join(process.cwd(), p));
  const [m800, m700, i400, i600, photo, emblem, wordmark] = await Promise.all([
    r("node_modules/@fontsource/montserrat/files/montserrat-latin-800-normal.woff"),
    r("node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff"),
    r("node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"),
    r("node_modules/@fontsource/inter/files/inter-latin-600-normal.woff"),
    r("scripts/og/og-photo.jpg"),
    r("public/brand/inter-emblem.png"),
    r("public/brand/inter-wordmark-white.png"),
  ]);
  const src = (b: Buffer, t: string) => `data:${t};base64,${b.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#132544", fontFamily: "Inter" }}>
        <img src={src(photo, "image/jpeg")} width={640} height={630} style={{ position: "absolute", right: 0, top: 0 }} alt="" />
        <div style={{ position: "absolute", right: 0, top: 0, width: 640, height: 630, display: "flex", backgroundImage: "linear-gradient(90deg, #132544 0%, rgba(19,37,68,0.85) 18%, rgba(19,37,68,0.35) 45%, rgba(19,37,68,0.15) 75%, rgba(19,37,68,0.3) 100%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 630, display: "flex", background: "#132544" }} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "56px 64px 0 64px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={src(emblem, "image/png")} width={58} height={58} alt="" />
            <img src={src(wordmark, "image/png")} width={180} height={48} alt="" />
          </div>

          <div style={{ display: "flex", marginTop: 46 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "2px solid rgba(250,172,38,0.6)", borderRadius: 999, padding: "7px 18px", color: "#faac26", fontFamily: "Montserrat", fontWeight: 700, fontSize: 18, letterSpacing: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: "#faac26" }} />
              INTER PLACEMENT TEST
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontFamily: "Montserrat", fontWeight: 800, fontSize: 62, lineHeight: 1.06, letterSpacing: -1.5, color: "#ffffff" }}>
            <span>Descubre tu nivel</span>
            <span>real de inglés.</span>
            <span style={{ color: "#faac26" }}>Cuatro habilidades.</span>
          </div>

          <div style={{ display: "flex", marginTop: 20, fontSize: 25, color: "rgba(255,255,255,0.86)" }}>
            Evaluación adaptativa alineada al MCER
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {SKILLS.map((s) => (
              <div key={s} style={{ display: "flex", padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.28)", color: "#ffffff", fontWeight: 600, fontSize: 20 }}>{s}</div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, display: "flex" }}>
          {SDG.map((c) => <div key={c} style={{ flex: 1, background: c }} />)}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: m800, weight: 800, style: "normal" },
        { name: "Montserrat", data: m700, weight: 700, style: "normal" },
        { name: "Inter", data: i400, weight: 400, style: "normal" },
        { name: "Inter", data: i600, weight: 600, style: "normal" },
      ],
    },
  );
}
