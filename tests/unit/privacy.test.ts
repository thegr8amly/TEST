import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { candidateId, cohortId, organizationId, slug } from "../../src/lib/ids";
import { toPublicRecord, type BaselineRecord } from "../../src/lib/record";

const rec = {
  schema: "inter.placement.v1", id: "ipt_test0001",
  test: { name: "INTER Placement Test", version: "1.0.0", form: "adaptive-A" },
  startedAt: "2026-11-27T10:00:00Z", completedAt: "2026-11-27T11:00:00Z", durationSec: 3600,
  candidate: { fullName: "Ana Pérez", email: "ana@example.com", phone: "809", studentId: "S1", organization: "Org", cohort: "C" },
  skills: {
    reading: { score: 55, cefr: "B2", status: "scored", method: "irt-eap", sem: 4, correct: 9, total: 15 },
    listening: { score: 50, cefr: "B1", status: "scored", method: "irt-eap", sem: 4, correct: 8, total: 15 },
    writing: { score: 45, cefr: "B1", status: "provisional", method: "heuristic" },
    speaking: { score: null, cefr: null, status: "pending_review", method: "none" },
  },
  overall: { score: 50, cefr: "B1", skillsCounted: ["reading", "listening", "writing"] },
  placement: { moduleId: "INT-2", moduleName: "Intermediate Master", program: "Intermediate", cefrTarget: "B2", index: 50, rationale: "", focusAreas: [], reviewRequired: true },
  elr: { measurement: "T0", baselineCefr: "B1", skills: { reading: 55, listening: 50, writing: 45, speaking: null }, alerts: [{ code: "INTEGRITY_TABS", severity: "warning", message: "x" }, { code: "PENDING_REVIEW", severity: "critical", message: "y" }] },
  integrity: { tabSwitches: 4, pasteAttempts: 0, userAgent: "UA", speechRecognition: true },
  responses: { reading: [{ questionId: "R-B1-01-1", testletId: "R-B1-01", level: "B1", difficulty: 0, correct: true, choice: 1 }], listening: [], readingRoute: [], listeningRoute: [], writing: [{ taskId: "W1", text: "secret text", words: 2 }], speaking: [] },
} as unknown as BaselineRecord;

describe("public record", () => {
  const pub = JSON.stringify(toPublicRecord(rec));
  it("strips item responses, texts and contact data", () => {
    for (const leak of ["questionId", '"correct"', "secret text", "ana@example.com", '"phone"', "userAgent", "INTEGRITY_TABS"]) assert.ok(!pub.includes(leak), `leaked ${leak}`);
  });
  it("keeps what the report needs", () => {
    for (const keep of ["Ana Pérez", "Intermediate Master", "PENDING_REVIEW", '"sem":4']) assert.ok(pub.includes(keep), `missing ${keep}`);
  });
});

describe("ecosystem ids", () => {
  it("slugs are stable and accent-free", () => {
    assert.equal(slug("Liga Municipal Dominicana (LMD)"), "liga-municipal-dominicana-lmd");
    assert.equal(organizationId("Liga Municipal"), "org_liga-municipal");
    assert.equal(cohortId(""), undefined);
  });
  it("candidateId is pseudonymous, stable and case-insensitive", () => {
    const a = candidateId("Ana@Example.com ");
    assert.equal(a, candidateId("ana@example.com"));
    assert.match(a, /^cand_[0-9a-f]{20}$/);
    assert.ok(!a.includes("ana"));
  });
});
