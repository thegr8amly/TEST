---
name: inter-learning-analytics
description: INTER learning-analytics data contracts — ecosystem identifiers (candidate, student, organization, cohort, assessment, version, attempt), the Baseline Record (inter.placement.v1), T0 baseline semantics, result conventions, segmentation, privacy rules and integration patterns with the Executive Learning Report (ELR) and INTERclassrooms. Use when storing, exporting, integrating, reporting or analysing INTER assessment and progress data.
---

# INTER Learning Analytics

## 1. Identifiers

| Id | Format | Source / rule |
|---|---|---|
| `attemptId` | `ipt_` + 10 chars `[2-9a-hj-km-np-z]` | Created on the device when the attempt starts; it is also the record `id` and makes submission idempotent |
| `candidateId` | `cand_` + 20 hex | HMAC-SHA256(`ID_SECRET`, lower-cased trimmed e-mail). Pseudonymous and stable. Never derive it from a name |
| `studentId` | free text ≤ 60 | Institutional id (matrícula or cédula) entered by the candidate or passed as `?sid=` |
| `organizationId` | `org_<slug>` | From the invitation link `?org=<slug>`, else derived from the institution name |
| `cohortId` | `coh_<slug>` | From `?cohort=<slug>`, else derived from the group name |
| `assessmentId` | `inter-placement` | One per instrument |
| `assessmentVersion` | semver (`1.0.0`) | Bump on any academic change (see `inter-assessment-standards`) |
| `period` | `YYYY-MM` | From `completedAt` |

**Slug:** NFD → strip accents → lower case → non-alphanumerics become `-` → trim → max 48 chars (`src/lib/ids.ts`).
**Invitation links:** `/test?org=<slug>&cohort=<slug>&sid=<studentId>`.

## 2. Baseline Record: `schema: "inter.placement.v1"`

Defined in `src/lib/record.ts`. **Additive evolution only:** new fields are optional; never rename or remove a field (consumers depend on it). A breaking change requires `inter.placement.v2` and authorization.

```
id, ids{candidateId, studentId?, organizationId?, cohortId?, assessmentId, assessmentVersion, attemptId}, period
test{name, version, form}, startedAt, completedAt, durationSec
candidate{fullName, email, phone?, studentId?, organization?, cohort?, purpose?}
skills.{reading|listening|writing|speaking}{score 0–100|null, cefr|null, status, method, sem?, assessment?, note?}
overall{score, cefr, skillsCounted[]}
placement{moduleId, moduleName, program, cefrTarget, index, rationale, focusAreas[], reviewRequired}
elr{measurement:"T0", baselineCefr, skills{…}, alerts[{code, severity, message}]}
scoring{objectiveModel, bankVersion, routingVersion, cutoffsVersion, placementVersion, rubricVersion, aiModel?}
integrity{tabSwitches, focusLosses, fullscreenExits, copy/paste/screenshot/print/devtoolsAttempts, sessionResumes, userAgent, speechRecognition}
responses{reading[], listening[] (item-level), readingRoute[], listeningRoute[], writing[], speaking[]}
```

**Conventions**
- `status`: `scored` · `provisional` (heuristic or low-confidence AI; teacher review recommended) · `pending_review` (no score; excluded from the overall).
- `method`: `irt-eap` · `ai-rubric` · `heuristic` · `none`.
- Scores are integers 0–100 on the INTER scale; CEFR bands are listed in `inter-assessment-standards` §4.
- Alert codes: `SKILL_GAP`, `PENDING_REVIEW`, `PROVISIONAL`, `INTEGRITY_TABS`, `INTEGRITY_SCREENSHOT`, `INTEGRITY_COPY`, `INTEGRITY_TOOLS`, `INTEGRITY_FOCUS`. Severities: `info` · `warning` · `critical`.

## 3. T0 and the learning curve

- The Placement Test produces **T0** for each skill. Later measurements (module oral, midterm, final, re-test) are T1…Tn on the same 0–100 scale where possible, keyed by `candidateId` + `assessmentId` + `completedAt`.
- Proposed measurement shape for ELR/INTERclassrooms (pending approval): `{candidateId, studentId, organizationId, cohortId, measurement:"T1", source, skill, score, cefr, status, takenAt, assessmentVersion}`.
- Trend: compare each Tn with T0 and with Tn-1. Suggested alert (pending academic approval): a drop of more than 8 points in any skill, or entering the *Intervention* band of the ELR (< 70 in internal course grades). Do not mix course grades (the ELR weights: oral 25 / participation 10 / midterm 20 / final 20 / attendance 15 / homework 10) with CEFR proficiency scores.
- ELR participant states: On Track · Monitoring · Intervention · Inactive. The placement maps `reviewRequired = true` to **Monitoring**.

## 4. Segmentation

Every result can be filtered by candidate, organization, cohort, skill, level, status and period (`src/lib/segments.ts`; `/admin` filters; CSV export honours the same filters). For analytics stores, index on `(organizationId, cohortId, period)` and `(candidateId, completedAt)`.

## 5. Integration channels

| Channel | How | Auth |
|---|---|---|
| Webhook (push) | `POST RESULTS_WEBHOOK_URL` with the full record on completion | Header `X-Inter-Signature` = hex HMAC-SHA256(`RESULTS_WEBHOOK_SECRET`, body); the receiver must verify it |
| Read API | `GET /api/results/{attemptId}` | `Authorization: Bearer <ADMIN_KEY>` or admin session |
| CSV | `GET /api/admin/export?org=&cohort=&period=&level=&status=&q=` | Admin session |
| Google Sheets (interim) | Apps Script `doPost` (see `docs/INTEGRATION.md`) | Webhook secret |

Storage today: private Vercel Blob (`results/{attemptId}.json`, `audio/{attemptId}/{S1-3}.webm`). The adapter lives in `src/lib/storage.ts`; to migrate to the INTERclassrooms database, replace its four functions.

## 6. Privacy & security rules

- **Never send to the browser:** answer keys, item-level responses (`responses.*`), other candidates' data, integrity logs, or credentials. Candidate-facing views use `toPublicRecord()`.
- Evidence (texts, transcripts, audio, integrity) is visible only in an admin session.
- Secrets live only in environment variables: `ADMIN_KEY`, `ID_SECRET`, `RESULTS_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY`, `BLOB_READ_WRITE_TOKEN`. Never put them in URLs or client code.
- Personal data is minimised in exports and pseudonymised ids are preferred for analytics. Do not delete records or change production schemas without authorization.
- Preview deployments currently share the production Blob store: do not submit test attempts on previews until a separate preview store exists.
