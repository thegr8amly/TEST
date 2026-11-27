import { NextResponse, after } from "next/server";
import { z } from "zod";
import { gradeSection } from "@/lib/adaptive";
import { scoreSpeaking, scoreWriting } from "@/lib/ai-scoring";
import { scoreToCefr } from "@/lib/cefr";
import { recommendPlacement, type SkillKey } from "@/lib/placement";
import { ASSESSMENT_ID, ASSESSMENT_VERSION, candidateId, cohortId, organizationId, period } from "@/lib/ids";
import { toPublicRecord, type BaselineRecord, type SkillResult } from "@/lib/record";
import { dispatchWebhook, getResult, saveResult } from "@/lib/storage";
import { scoringVersions } from "@/lib/versioning";
import { THETA_SLOPE } from "@/lib/cefr";

export const maxDuration = 300;

const Answer = z.object({ testletId: z.string().max(40), questionId: z.string().max(40), choice: z.number().int().min(0).max(5).nullable(), ms: z.number().optional() });
const str = (n: number) => z.string().trim().max(n);
const Body = z.object({
  attemptId: z.string().regex(/^ipt_[a-z0-9]{6,20}$/),
  /** organisation / cohort slugs from an institutional invitation link (/test?org=…&cohort=…) */
  link: z.object({ org: z.string().regex(/^[a-z0-9-]{1,48}$/).optional(), cohort: z.string().regex(/^[a-z0-9-]{1,48}$/).optional() }).optional(),
  startedAt: z.string().max(40),
  candidate: z.object({
    fullName: str(120).min(2),
    email: z.string().trim().email().max(160),
    phone: str(40).optional(),
    studentId: str(60).optional(),
    organization: str(120).optional(),
    cohort: str(120).optional(),
    purpose: str(200).optional(),
  }),
  reading: z.array(Answer).max(60),
  listening: z.array(Answer).max(60),
  writing: z.array(z.object({ taskId: z.enum(["W1", "W2"]), text: str(6000) })).max(2),
  speaking: z.array(z.object({ taskId: z.enum(["S1", "S2", "S3"]), transcript: str(8000), durationSec: z.number().min(0).max(600), asrConfidence: z.number().min(0).max(1).nullable(), audioPath: str(200).optional() })).max(3),
  integrity: z.object({
    tabSwitches: z.number().int().min(0).max(9999),
    pasteAttempts: z.number().int().min(0).max(9999),
    copyAttempts: z.number().int().min(0).max(9999).default(0),
    screenshotAttempts: z.number().int().min(0).max(9999).default(0),
    focusLosses: z.number().int().min(0).max(9999).default(0),
    fullscreenExits: z.number().int().min(0).max(9999).default(0),
    printAttempts: z.number().int().min(0).max(9999).default(0),
    devtoolsAttempts: z.number().int().min(0).max(9999).default(0),
    sessionResumes: z.number().int().min(0).max(9999).default(0),
    userAgent: str(400),
    speechRecognition: z.boolean(),
  }),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  const b = parsed.data;

  // Idempotent: a retried submission returns the stored result instead of re-scoring.
  const existing = await getResult(b.attemptId).catch(() => null);
  if (existing) return NextResponse.json(toPublicRecord({ ...existing, persisted: true }));

  const reading = gradeSection("reading", b.reading);
  const listening = gradeSection("listening", b.listening);
  const [writing, speaking] = await Promise.all([
    scoreWriting(b.writing),
    scoreSpeaking(b.speaking.map((s) => ({ taskId: s.taskId, transcript: s.transcript, durationSec: s.durationSec, asrConfidence: s.asrConfidence }))),
  ]);

  const objective = (r: typeof reading): SkillResult => ({
    score: r.total ? r.score : null,
    cefr: r.total ? r.cefr : null,
    status: r.total ? "scored" : "pending_review",
    method: r.total ? "irt-eap" : "none",
    sem: Math.round(r.sem * THETA_SLOPE * 10) / 10,
    correct: r.correct,
    total: r.total,
  });
  const skills: Record<SkillKey, SkillResult> = {
    reading: objective(reading),
    listening: objective(listening),
    writing: { score: writing.score, cefr: writing.cefr, status: writing.status, method: writing.method, assessment: writing.assessment, model: writing.model, note: writing.note },
    speaking: { score: speaking.score, cefr: speaking.cefr, status: speaking.status, method: speaking.method, assessment: speaking.assessment, model: speaking.model, note: speaking.note },
  };

  const keys = Object.keys(skills) as SkillKey[];
  const scores = Object.fromEntries(keys.map((k) => [k, skills[k].score])) as Record<SkillKey, number | null>;
  const placement = recommendPlacement(scores, {
    pendingSkills: keys.filter((k) => skills[k].score === null),
    provisionalSkills: keys.filter((k) => skills[k].status === "provisional"),
    integrity: b.integrity,
  });
  const counted = keys.filter((k) => skills[k].score !== null);
  const completedAt = new Date();
  const started = new Date(b.startedAt);

  const rec: BaselineRecord = {
    schema: "inter.placement.v1",
    id: b.attemptId,
    ids: {
      candidateId: candidateId(b.candidate.email),
      studentId: b.candidate.studentId || undefined,
      organizationId: b.link?.org ? `org_${b.link.org}` : organizationId(b.candidate.organization),
      cohortId: b.link?.cohort ? `coh_${b.link.cohort}` : cohortId(b.candidate.cohort),
      assessmentId: ASSESSMENT_ID,
      assessmentVersion: ASSESSMENT_VERSION,
      attemptId: b.attemptId,
    },
    scoring: { ...scoringVersions(), aiModel: writing.model ?? speaking.model },
    period: period(completedAt.toISOString()),
    test: { name: "INTER Placement Test", version: ASSESSMENT_VERSION, form: "adaptive-A" },
    startedAt: isNaN(started.getTime()) ? completedAt.toISOString() : started.toISOString(),
    completedAt: completedAt.toISOString(),
    durationSec: isNaN(started.getTime()) ? 0 : Math.max(0, Math.round((completedAt.getTime() - started.getTime()) / 1000)),
    candidate: b.candidate,
    skills,
    overall: { score: placement.index, cefr: scoreToCefr(placement.index), skillsCounted: counted },
    placement: {
      moduleId: placement.module.id,
      moduleName: placement.module.name,
      program: placement.module.program,
      cefrTarget: placement.module.cefrTarget,
      index: placement.index,
      rationale: placement.rationale,
      focusAreas: placement.focusAreas,
      reviewRequired: placement.reviewRequired,
      provisionalModuleName: placement.module.provisionalName,
    },
    elr: { measurement: "T0", baselineCefr: scoreToCefr(placement.index), skills: scores, alerts: placement.alerts },
    integrity: b.integrity,
    responses: {
      reading: reading.items,
      listening: listening.items,
      readingRoute: reading.route,
      listeningRoute: listening.route,
      writing: b.writing.map((w) => ({ taskId: w.taskId, text: w.text, words: (w.text.match(/\S+/g) ?? []).length })),
      speaking: b.speaking,
    },
  };

  let persisted = false;
  try {
    persisted = await saveResult(rec);
  } catch (e) {
    console.error("[results] save failed", e);
  }
  rec.persisted = persisted;
  after(() => dispatchWebhook(rec));
  // Never return item-level responses: they would reveal the answer keys.
  return NextResponse.json(toPublicRecord(rec));
}
