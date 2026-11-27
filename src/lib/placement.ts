/**
 * INTER curriculum map. EDIT HERE to match the official mod catalogue.
 * Source: INTER IAS Knowledge Base v1 §3.1 — Basic Introduction (A1), Basic Interactive (A2),
 * Intermediate Productive (B1), Intermediate Master (B2), advanced stage (B2+/C1).
 * The two advanced mod names are placeholders pending academic validation.
 */
import { scoreToCefr, type Cefr } from "./cefr";

export interface InterModule {
  id: string;
  order: number;
  program: "Basic" | "Intermediate" | "Advanced";
  name: string;
  cefrTarget: string;
  description: string;
  /** minimum placement index (0–100) to be placed in this mod */
  minIndex: number;
  provisionalName?: boolean;
}

export const MODULES: InterModule[] = [
  { id: "BAS-1", order: 1, program: "Basic", name: "Basic Introduction", cefrTarget: "A1", minIndex: 0, description: "Competencias introductorias, preguntas frecuentes y situaciones cotidianas." },
  { id: "BAS-2", order: 2, program: "Basic", name: "Basic Interactive", cefrTarget: "A2", minIndex: 27, description: "Interacción básica ampliada, tareas familiares y conversación guiada." },
  { id: "INT-1", order: 3, program: "Intermediate", name: "Intermediate Productive", cefrTarget: "B1", minIndex: 37, description: "Producción y comprensión en situaciones conocidas; mayor autonomía." },
  { id: "INT-2", order: 4, program: "Intermediate", name: "Intermediate Master", cefrTarget: "B2", minIndex: 47, description: "Interacción y desempeño en temas complejos con mayor precisión." },
  { id: "ADV-1", order: 5, program: "Advanced", name: "Advanced I", cefrTarget: "B2+ / C1", minIndex: 57, provisionalName: true, description: "Comunicación profesional avanzada, argumentación y precisión." },
  { id: "ADV-2", order: 6, program: "Advanced", name: "Advanced II · Executive", cefrTarget: "C1", minIndex: 66, provisionalName: true, description: "Desempeño ejecutivo: presentaciones, negociación y vocería en inglés." },
];
// Rule of thumb behind the cut-offs: the bottom ~60% of a CEFR band consolidates that level;
// the top ~40% moves on to the mod that targets the next level.

export type SkillKey = "reading" | "listening" | "writing" | "speaking";
export const SKILL_LABEL_ES: Record<SkillKey, string> = { reading: "Lectura", listening: "Comprensión auditiva", writing: "Escritura", speaking: "Expresión oral" };

export interface Placement {
  index: number;
  module: InterModule;
  nextModule?: InterModule;
  rationale: string;
  focusAreas: SkillKey[];
  alerts: { code: string; severity: "info" | "warning" | "critical"; message: string }[];
  reviewRequired: boolean;
}

export function recommendPlacement(skills: Partial<Record<SkillKey, number | null>>, opts: { pendingSkills: SkillKey[]; provisionalSkills: SkillKey[]; integrity: { tabSwitches: number; pasteAttempts?: number; copyAttempts?: number; screenshotAttempts?: number; focusLosses?: number; fullscreenExits?: number; printAttempts?: number; devtoolsAttempts?: number } }): Placement {
  const entries = (Object.entries(skills) as [SkillKey, number | null][]).filter(([, v]) => typeof v === "number") as [SkillKey, number][];
  const overall = entries.length ? entries.reduce((a, [, v]) => a + v, 0) / entries.length : 0;
  const index = Math.round(overall);
  const sorted = [...MODULES].sort((a, b) => b.minIndex - a.minIndex);
  const mod = sorted.find((m) => index >= m.minIndex) ?? MODULES[0];
  const nextModule = MODULES.find((m) => m.order === mod.order + 1);

  const focusAreas = entries.filter(([, v]) => v <= overall - 6).sort((a, b) => a[1] - b[1]).map(([k]) => k);
  const alerts: Placement["alerts"] = [];
  for (const [k, v] of entries) {
    if (v <= overall - 10) alerts.push({ code: "SKILL_GAP", severity: "warning", message: `${SKILL_LABEL_ES[k]} está ${Math.round(overall - v)} puntos por debajo del promedio (${scoreToCefr(v)}).` });
  }
  for (const k of opts.pendingSkills) alerts.push({ code: "PENDING_REVIEW", severity: "critical", message: `${SKILL_LABEL_ES[k]}: pendiente de evaluación docente; no incluida en el promedio.` });
  for (const k of opts.provisionalSkills) alerts.push({ code: "PROVISIONAL", severity: "info", message: `${SKILL_LABEL_ES[k]}: puntuación provisional, se recomienda revisión docente.` });
  const ig = opts.integrity;
  if (ig.tabSwitches >= 3) alerts.push({ code: "INTEGRITY_TABS", severity: "warning", message: `El candidato salió de la pestaña del examen ${ig.tabSwitches} veces.` });
  if ((ig.screenshotAttempts ?? 0) > 0) alerts.push({ code: "INTEGRITY_SCREENSHOT", severity: "warning", message: `Se detectaron ${ig.screenshotAttempts} intento(s) de captura de pantalla.` });
  if ((ig.copyAttempts ?? 0) + (ig.pasteAttempts ?? 0) >= 3) alerts.push({ code: "INTEGRITY_COPY", severity: "warning", message: `Intentos de copiar/pegar: ${(ig.copyAttempts ?? 0) + (ig.pasteAttempts ?? 0)}.` });
  if ((ig.devtoolsAttempts ?? 0) > 0 || (ig.printAttempts ?? 0) > 0) alerts.push({ code: "INTEGRITY_TOOLS", severity: "warning", message: "Intentó abrir herramientas de desarrollador o imprimir la página." });
  if ((ig.focusLosses ?? 0) >= 5 || (ig.fullscreenExits ?? 0) >= 3) alerts.push({ code: "INTEGRITY_FOCUS", severity: "info", message: `Salidas de la ventana: ${ig.focusLosses ?? 0} · salidas de pantalla completa: ${ig.fullscreenExits ?? 0}.` });

  const within = index - mod.minIndex;
  const rationale =
    `Índice de ubicación ${index}/100 (promedio de ${entries.length} habilidad${entries.length === 1 ? "" : "es"}), nivel global ${scoreToCefr(index)}. ` +
    `Se recomienda ${mod.name} (meta ${mod.cefrTarget})` +
    (nextModule && nextModule.minIndex - index <= 2 ? `; está a ${nextModule.minIndex - index} punto(s) de ${nextModule.name}, valorar con entrevista.` : ".") +
    (within <= 1 && mod.order > 1 ? " Resultado en el límite inferior del módulo." : "");

  return { index, module: mod, nextModule, rationale, focusAreas, alerts, reviewRequired: opts.pendingSkills.length > 0 || alerts.some((a) => a.severity !== "info") };
}

export function overallCefr(index: number): Cefr {
  return scoreToCefr(index);
}
