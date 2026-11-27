import { nextStep, type AnswerIn } from "../src/lib/adaptive";
import { getQuestion } from "../src/lib/bank";
import { pCorrect } from "../src/lib/irt";

function simulate(trueTheta: number, skill: "reading" | "listening") {
  const answers: AnswerIn[] = [];
  for (;;) {
    const s = nextStep(skill, answers);
    if (s.done) return s.result;
    for (const q of s.testlet.questions) {
      const hit = getQuestion(q.id)!;
      const b = { A1: -3, A2: -1.8, B1: -0.6, B2: 0.6, C1: 1.8, C2: 3 }[hit.testlet.level] + (hit.question.offset ?? 0);
      const ok = Math.random() < pCorrect(trueTheta, { b });
      answers.push({ testletId: s.testlet.id, questionId: q.id, choice: ok ? hit.question.answer : (hit.question.answer + 1) % 4 });
    }
  }
}
for (const th of [-4, -3, -1.8, -0.6, 0.6, 1.8, 3, 4.5]) {
  const runs = Array.from({ length: 300 }, () => simulate(th, "reading"));
  const mean = runs.reduce((a, r) => a + r.score, 0) / runs.length;
  const sd = Math.sqrt(runs.reduce((a, r) => a + (r.score - mean) ** 2, 0) / runs.length);
  const target = Math.round(50 + th * 25 / 3);
  console.log(`theta ${th}\ttarget ${target}\tmean ${mean.toFixed(1)}\tsd ${sd.toFixed(1)}\tsem ${(runs.reduce((a,r)=>a+r.sem,0)/runs.length).toFixed(2)}`);
}
// perfect
const perfect: AnswerIn[] = [];
for (;;) { const s = nextStep("reading", perfect); if (s.done) { console.log("perfect", s.result.score, s.result.cefr, s.result.route.join(",")); break; } for (const q of s.testlet.questions) perfect.push({ testletId: s.testlet.id, questionId: q.id, choice: getQuestion(q.id)!.question.answer }); }
const zero: AnswerIn[] = [];
for (;;) { const s = nextStep("reading", zero); if (s.done) { console.log("zero", s.result.score, s.result.cefr); break; } for (const q of s.testlet.questions) zero.push({ testletId: s.testlet.id, questionId: q.id, choice: null }); }
