/**
 * INTER Baseline Record — the integration contract between the Placement Test,
 * the Campus Virtual (app/web) and the Executive Learning Report (ELR).
 * Schema id: "inter.placement.v1". Changes are additive only (optional fields), so existing
 * consumers keep working. See docs/INTEGRATION.md and .claude/skills/inter-learning-analytics.
 */
import type { ObjectiveSectionResult } from "./adaptive";
import type { Assessment } from "./ai-scoring";
import type { Cefr } from "./cefr";
import type { Placement, SkillKey } from "./placement";

export interface Candidate {
  fullName: string;
  email: string;
  phone?: string;
  studentId?: string;
  organization?: string;
  cohort?: string;
  purpose?: string;
}

export interface SkillResult {
  score: number | null;
  cefr: Cefr | null;
  status: "scored" | "provisional" | "pending_review";
  method: "irt-eap" | "ai-rubric" | "heuristic" | "none";
  sem?: number; // standard error (score points) for IRT sections
  correct?: number;
  total?: number;
  assessment?: Assessment;
  model?: string;
  note?: string;
}

export interface EcosystemIds {
  candidateId: string; // pseudonymous, stable per e-mail (HMAC)
  studentId?: string; // institutional id provided by the candidate / link
  organizationId?: string; // org_<slug>
  cohortId?: string; // coh_<slug>
  assessmentId: string; // "inter-placement"
  assessmentVersion: string; // semver
  attemptId: string; // = id
}

export interface ScoringTrace {
  objectiveModel: string;
  bankVersion: string;
  routingVersion: string;
  cutoffsVersion: string;
  placementVersion: string;
  rubricVersion: string;
  aiModel?: string;
}

export interface BaselineRecord {
  schema: "inter.placement.v1";
  /** attemptId */
  id: string;
  ids?: EcosystemIds;
  scoring?: ScoringTrace;
  /** YYYY-MM, for period segmentation */
  period?: string;
  test: { name: "INTER Placement Test"; version: string; form: string };
  startedAt: string;
  completedAt: string;
  durationSec: number;
  candidate: Candidate;
  skills: Record<SkillKey, SkillResult>;
  overall: { score: number; cefr: Cefr; skillsCounted: SkillKey[] };
  placement: {
    moduleId: string;
    moduleName: string;
    program: string;
    cefrTarget: string;
    index: number;
    rationale: string;
    focusAreas: SkillKey[];
    reviewRequired: boolean;
    provisionalModuleName?: boolean;
  };
  /** ELR-ready block: this is "T0" of the student's learning curve. */
  elr: {
    measurement: "T0";
    baselineCefr: Cefr;
    skills: Record<SkillKey, number | null>;
    alerts: Placement["alerts"];
  };
  integrity: {
    tabSwitches: number;
    pasteAttempts: number;
    copyAttempts?: number;
    screenshotAttempts?: number;
    focusLosses?: number;
    fullscreenExits?: number;
    printAttempts?: number;
    devtoolsAttempts?: number;
    sessionResumes?: number;
    userAgent: string;
    speechRecognition: boolean;
  };
  responses: {
    reading: ObjectiveSectionResult["items"];
    listening: ObjectiveSectionResult["items"];
    readingRoute: string[];
    listeningRoute: string[];
    writing: { taskId: string; text: string; words: number }[];
    speaking: { taskId: string; transcript: string; durationSec: number; asrConfidence: number | null; audioPath?: string }[];
  };
  persisted?: boolean;
}

export function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
  return "ipt_" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/**
 * What may leave the server for the candidate-facing report: no item-level responses
 * (they would reveal answer keys), no texts/transcripts, no contact data, no integrity log.
 */
export type PublicRecord = Pick<BaselineRecord, "schema" | "id" | "test" | "completedAt" | "overall" | "placement" | "persisted"> & {
  candidate: Pick<Candidate, "fullName" | "studentId" | "organization" | "cohort">;
  skills: Record<SkillKey, Omit<SkillResult, "model" | "correct" | "total">>;
  elr: BaselineRecord["elr"];
  ids?: Pick<EcosystemIds, "assessmentId" | "assessmentVersion" | "attemptId">;
};

export function toPublicRecord(rec: BaselineRecord): PublicRecord {
  const skills = Object.fromEntries(
    (Object.entries(rec.skills) as [SkillKey, SkillResult][]).map(([k, v]) => {
       
      const { model, correct, total, ...rest } = v;
      return [k, rest];
    }),
  ) as PublicRecord["skills"];
  return {
    schema: rec.schema,
    id: rec.id,
    test: rec.test,
    completedAt: rec.completedAt,
    candidate: { fullName: rec.candidate.fullName, studentId: rec.candidate.studentId, organization: rec.candidate.organization, cohort: rec.candidate.cohort },
    skills,
    overall: rec.overall,
    placement: rec.placement,
    // integrity alerts are for the institution, not the candidate
    elr: { ...rec.elr, alerts: rec.elr.alerts.filter((a) => !a.code.startsWith("INTEGRITY")) },
    ids: rec.ids ? { assessmentId: rec.ids.assessmentId, assessmentVersion: rec.ids.assessmentVersion, attemptId: rec.ids.attemptId } : undefined,
    persisted: rec.persisted,
  };
}
