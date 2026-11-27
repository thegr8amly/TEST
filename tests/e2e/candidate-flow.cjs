/**
 * End-to-end check of the full candidate journey (10 steps) with a fake microphone.
 * Usage:  BASE=http://localhost:3000 node tests/e2e/candidate-flow.cjs [screenshotDir]
 * Requires Playwright with Chromium (preinstalled in CI images / `npx playwright install chromium`).
 */
const { chromium } = require("playwright");

const BASE = process.env.BASE || "http://localhost:3000";
const OUT = process.argv[2] || null;
const shot = async (page, name) => { if (OUT) await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false }); };
let page; const fail = async (m) => { console.error("FAIL:", m); if (OUT && page) await page.screenshot({ path: `${OUT}/zz-fail.png` }).catch(() => {}); process.exit(1); };

(async () => {
const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, permissions: ["microphone"] });
page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// 1 · landing
await page.goto(`${BASE}/`);
await page.getByRole("link", { name: /Comenzar evaluación/ }).first().waitFor();
await shot(page, "01-landing");

// 2 · registration (institutional link)
await page.goto(`${BASE}/test?org=e2e-org&cohort=e2e-2026&sid=E2E-001`);
await page.getByLabel(/Nombre completo/).fill("Candidata de Prueba E2E");
await page.getByLabel(/Correo electrónico/).fill("e2e@example.com");
await page.getByRole("checkbox").check();
await shot(page, "02-register");
await page.getByRole("button", { name: "Continuar" }).click();

// 3 · instructions
await page.getByRole("checkbox").check();
await shot(page, "03-instructions");
await page.getByRole("button", { name: "Continuar" }).click();

// 4 · requirements
await page.getByText("Conexión con el servidor").waitFor();
await page.waitForTimeout(300);
await shot(page, "04-requirements");
await page.getByRole("button", { name: "Continuar" }).click();

// 5 · devices
await page.getByRole("button", { name: "Sí", exact: true }).click();
await page.getByRole("button", { name: "Permitir micrófono" }).click();
await page.waitForTimeout(1200);
await shot(page, "05-devices");
await page.getByRole("button", { name: "Comenzar la evaluación" }).click();

// 6 · Reading + Listening
for (const sec of ["Reading", "Listening"]) {
  await page.getByRole("button", { name: `Iniciar ${sec}` }).click();
  for (let b = 0; b < 5; b++) {
    await page.getByText(new RegExp(`Bloque ${b + 1} de 5`)).first().waitFor();
    await page.getByRole("radiogroup").first().waitFor();
    await page.getByText("Cargando el siguiente bloque").waitFor({ state: "detached" }).catch(() => {});
    if (sec === "Listening") await page.getByRole("button", { name: /Reproducir audio/ }).click().catch(() => {});
    const groups = page.getByRole("radiogroup");
    const n = await groups.count();
    for (let i = 0; i < n; i++) await groups.nth(i).getByRole("radio").nth(1).click();
    if (b === 1) await shot(page, `06-${sec.toLowerCase()}`);
    await page.getByRole("button", { name: /Enviar bloque y continuar|Enviar sección/ }).click();
  }
}
// Writing
await page.getByRole("button", { name: "Iniciar Writing" }).click();
await page.locator("textarea").fill("Dear Ms. Pérez, I am sorry but I cannot attend the meeting on Tuesday because I have a medical appointment. Could we move it to Thursday morning? If not, a colleague can take notes for me. Please tell me what I should read before the meeting. Kind regards, Ana");
await page.getByRole("tab", { name: /Tarea 2/ }).click();
await page.locator("textarea").fill("In my opinion, artificial intelligence will change many jobs, although it will probably create new ones as well. For example, in the Dominican Republic some call centres already use chatbots for simple questions. However, companies still need people to supervise these systems, train them and solve complex problems. Moreover, small businesses can use AI tools to grow, which may create employment. On the other hand, workers without digital skills could be left behind, so governments and companies must invest in training. To sum up, AI is both a risk and an opportunity, and the result depends on how well we prepare people.");
await shot(page, "07-writing");
await page.getByRole("button", { name: "Enviar sección" }).click();
await page.getByRole("button", { name: "Sí, enviar" }).click();
// Speaking
await page.getByRole("button", { name: "Iniciar Speaking" }).click();
for (let t = 0; t < 3; t++) {
  await page.getByRole("button", { name: "Empezar preparación" }).click();
  await page.getByRole("button", { name: /grabar ahora/ }).click();
  await page.waitForTimeout(8600);
  if (t === 0) await shot(page, "08-speaking");
  await page.getByRole("button", { name: /Terminé/ }).click();
  await page.waitForTimeout(2500);
}
// 7 · review
await page.getByText("Confirma la entrega de tu evaluación").waitFor();
await shot(page, "09-review");
await page.getByRole("checkbox").check();
await page.getByRole("button", { name: "Entregar evaluación" }).click();
// 8–10 · processing → report
await page.waitForURL(/\/report\//, { timeout: 120000 });
await page.getByText("Perfil por habilidad").waitFor();
await page.waitForTimeout(600);
if (OUT) await page.screenshot({ path: `${OUT}/10-report.png`, fullPage: true });

// privacy: the candidate-facing report must not contain item-level responses or answer keys
const html = await page.content();
if (/"questionId"|"correct":(true|false)|"responses"/.test(html)) fail("report leaks item-level responses");
const stored = await page.evaluate(() => localStorage.getItem("inter-ipt-last-result") || "");
if (/"responses"|"questionId"/.test(stored)) fail("client received item-level responses");
if (errors.length) fail("page errors: " + errors.join(" | "));
console.log("OK", page.url());
await browser.close();
})().catch((e) => fail(e.stack || e));
