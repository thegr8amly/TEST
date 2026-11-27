/**
 * Automated WCAG 2.2 A/AA audit (axe-core) of every candidate-facing screen.
 * Usage: BASE=http://localhost:3000 node tests/e2e/a11y.cjs
 * Note: automated checks cover ~30–40% of WCAG; keyboard and screen-reader passes remain manual.
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.BASE || "http://localhost:3000";
const AXE = fs.readFileSync(path.join(__dirname, "../../node_modules/axe-core/axe.min.js"), "utf8");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const SAMPLE = {
  schema: "inter.placement.v1", id: "ipt_a11ysample", test: { name: "INTER Placement Test", version: "1.0.0", form: "adaptive-A" },
  completedAt: new Date().toISOString(), candidate: { fullName: "Candidata Accesibilidad" },
  skills: {
    reading: { score: 56, cefr: "B2", status: "scored", method: "irt-eap", sem: 6 },
    listening: { score: 61, cefr: "C1", status: "scored", method: "irt-eap", sem: 5 },
    writing: { score: 48, cefr: "B1", status: "provisional", method: "heuristic", note: "Provisional" },
    speaking: { score: null, cefr: null, status: "pending_review", method: "none" },
  },
  overall: { score: 55, cefr: "B2", skillsCounted: ["reading", "listening", "writing"] },
  placement: { moduleId: "INT-2", moduleName: "Intermediate Master", program: "Intermediate", cefrTarget: "B2", index: 55, rationale: "Índice 55.", focusAreas: ["writing"], reviewRequired: true },
  elr: { measurement: "T0", baselineCefr: "B2", skills: { reading: 56, listening: 61, writing: 48, speaking: null }, alerts: [{ code: "PENDING_REVIEW", severity: "critical", message: "Expresión oral pendiente." }] },
  persisted: false,
};

async function audit(page, name) {
  await page.waitForTimeout(900); // let entrance transitions finish (mid-fade text would read as low contrast)
  await page.addScriptTag({ content: AXE });
  const res = await page.evaluate(async (tags) => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: "tag", values: tags } });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes[0]?.target?.join(" ") }));
  }, TAGS);
  console.log(`${res.length ? "✗" : "✓"} ${name}${res.length ? "" : " — 0 violations"}`);
  for (const v of res) console.log(`    [${v.impact}] ${v.id} ×${v.n}  e.g. ${v.sample}`);
  return res.length;
}

(async () => {
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["microphone"] })).newPage();
  let total = 0;
  await page.goto(`${BASE}/`); await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")));
  await page.waitForTimeout(800);
  total += await audit(page, "Landing");
  await page.goto(`${BASE}/test`); await page.waitForTimeout(600);
  total += await audit(page, "Registro");
  await page.getByLabel(/Nombre completo/).fill("Prueba A11y"); await page.getByLabel(/Correo/).fill("a11y@example.com");
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "Continuar" }).click();
  total += await audit(page, "Instrucciones");
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByText("Conexión con el servidor").waitFor(); await page.waitForTimeout(300);
  total += await audit(page, "Requisitos técnicos");
  await page.getByRole("button", { name: "Continuar" }).click();
  total += await audit(page, "Audio y micrófono");
  await page.getByRole("button", { name: "Sí", exact: true }).click();
  await page.getByRole("button", { name: "Permitir micrófono" }).click(); await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Comenzar la evaluación" }).click();
  total += await audit(page, "Intro de sección");
  await page.getByRole("button", { name: "Iniciar Reading" }).click();
  await page.getByRole("radiogroup").first().waitFor(); await page.waitForTimeout(500);
  total += await audit(page, "Reading (bloque)");
  await page.evaluate((s) => localStorage.setItem("inter-ipt-last-result", JSON.stringify(s)), SAMPLE);
  await page.goto(`${BASE}/report/local`); await page.getByText("Perfil por habilidad").waitFor();
  total += await audit(page, "Reporte de resultados");
  await page.goto(`${BASE}/admin`); await page.waitForTimeout(300);
  total += await audit(page, "Acceso administrativo");
  await browser.close();
  console.log(total ? `\n${total} rule(s) violated` : "\nAll screens pass automated WCAG 2.2 A/AA checks.");
  process.exit(total ? 1 : 0);
})();
