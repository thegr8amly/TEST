/**
 * Guards for the assessment engine AND the approved academic parameters (v1.0).
 * A failing "academic lock" test means an academic parameter changed: that change
 * needs approval (docs/PENDING-ACADEMIC-APPROVAL.md) and a new assessmentVersion.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nextStep, gradeSection, type AnswerIn } from "../../src/lib/adaptive";
import { BANK, getQuestion, LEVEL_ORDER, START_LEVEL_INDEX, TESTLETS_PER_SECTION } from "../../src/lib/bank";
import { SPEAKING_TASKS, WRITING_TASKS } from "../../src/lib/bank/productive";
import { CEFR_BANDS, LEVEL_DIFFICULTY, scoreToCefr, THETA_SLOPE, thetaToScore } from "../../src/lib/cefr";
import { estimateAbility, pCorrect } from "../../src/lib/irt";
import { MODULES, recommendPlacement } from "../../src/lib/placement";

describe("academic lock (v1.0)", () => {
  it("CEFR cut-offs are unchanged", () => {
    assert.deepEqual(CEFR_BANDS.map((b) => [b.level, b.min, b.max]), [["A0", 0, 20], ["A1", 21, 30], ["A2", 31, 40], ["B1", 41, 50], ["B2", 51, 60], ["C1", 61, 70], ["C2", 71, 100]]);
  });
  it("routing and scale parameters are unchanged", () => {
    assert.equal(TESTLETS_PER_SECTION, 5);
    assert.equal(LEVEL_ORDER[START_LEVEL_INDEX], "B1");
    assert.deepEqual(LEVEL_DIFFICULTY, { A1: -3, A2: -1.8, B1: -0.6, B2: 0.6, C1: 1.8, C2: 3 });
    assert.equal(Math.round(THETA_SLOPE * 1000), 8333);
  });
  it("item bank size and productive tasks are unchanged", () => {
    assert.equal(BANK.reading.length, 12);
    assert.equal(BANK.listening.length, 12);
    assert.equal(BANK.reading.flatMap((t) => t.questions).length + BANK.listening.flatMap((t) => t.questions).length, 72);
    assert.deepEqual(WRITING_TASKS.map((w) => [w.id, w.minWords, w.maxWords]), [["W1", 60, 120], ["W2", 150, 250]]);
    assert.deepEqual(SPEAKING_TASKS.map((s) => [s.id, s.prepSeconds, s.speakSeconds]), [["S1", 15, 45], ["S2", 25, 75], ["S3", 30, 90]]);
  });
  it("placement thresholds are unchanged", () => {
    assert.deepEqual(MODULES.map((m) => [m.id, m.minIndex]), [["BAS-1", 0], ["BAS-2", 27], ["INT-1", 37], ["INT-2", 47], ["ADV-1", 57], ["ADV-2", 66]]);
  });
});

describe("scale & IRT", () => {
  it("maps scores to bands at the boundaries", () => {
    for (const [s, l] of [[0, "A0"], [20, "A0"], [21, "A1"], [40, "A2"], [41, "B1"], [60, "B2"], [61, "C1"], [70, "C1"], [71, "C2"], [100, "C2"]] as const) assert.equal(scoreToCefr(s), l);
  });
  it("3PL probability is monotonic with a guessing floor", () => {
    assert.ok(pCorrect(-6, { b: 0 }) >= 0.2 && pCorrect(-6, { b: 0 }) < 0.21);
    assert.ok(pCorrect(1, { b: 0 }) > pCorrect(0, { b: 0 }));
  });
  it("EAP is centred on the prior with no data and moves with evidence", () => {
    assert.ok(Math.abs(estimateAbility([]).theta) < 1e-6);
    const up = estimateAbility([{ b: 0, correct: true }, { b: 1, correct: true }]).theta;
    const down = estimateAbility([{ b: 0, correct: false }, { b: -1, correct: false }]).theta;
    assert.ok(up > 0 && down < 0);
    assert.equal(thetaToScore(0), 50);
  });
});

describe("adaptive routing", () => {
  const run = (seed: string, policy: (key: number) => number | null) => {
    const answers: AnswerIn[] = [];
    for (;;) {
      const s = nextStep("reading", answers, seed);
      if (s.done) return s.result;
      for (const q of s.testlet.questions) answers.push({ testletId: s.testlet.id, questionId: q.id, choice: policy(getQuestion(q.id)!.question.answer) });
    }
  };
  it("serves exactly 5 testlets, perfect → C2, blank → A0", () => {
    const top = run("ipt_aaaaaaaa", (k) => k);
    assert.equal(top.route.length, 5);
    assert.equal(top.cefr, "C2");
    const low = run("ipt_bbbbbbbb", () => null);
    assert.equal(low.cefr, "A0");
  });
  it("is reproducible per attempt (reload cannot re-draw a testlet)", () => {
    const a = nextStep("reading", [], "ipt_seedseed");
    const b = nextStep("reading", [], "ipt_seedseed");
    assert.ok(!a.done && !b.done && a.testlet.id === b.testlet.id);
  });
  it("never sends answer keys to the client", () => {
    const s = nextStep("listening", [], "ipt_keycheck");
    assert.ok(!s.done);
    assert.ok(!JSON.stringify(s).includes('"answer"'));
  });
  it("ignores answers for unknown or mismatched items", () => {
    const r = gradeSection("reading", [{ testletId: "R-A1-01", questionId: "R-C2-01-1", choice: 0 }, { testletId: "X", questionId: "Y", choice: 1 }]);
    assert.equal(r.total, 0);
  });
});

describe("placement", () => {
  it("averages only scored skills and flags pending ones", () => {
    const p = recommendPlacement({ reading: 50, listening: 52, writing: 48, speaking: null }, { pendingSkills: ["speaking"], provisionalSkills: [], integrity: { tabSwitches: 0 } });
    assert.equal(p.index, 50);
    assert.equal(p.module.id, "INT-2");
    assert.ok(p.reviewRequired);
    assert.ok(p.alerts.some((a) => a.code === "PENDING_REVIEW"));
  });
});
