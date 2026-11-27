---
name: inter-assessment-standards
description: Academic rules, standardization criteria, evaluation constraints and CEFR-alignment requirements for INTER language assessments (Placement Test v1.0 and future INTER tests). Use before changing anything that touches items, routing, scoring, rubrics, cut-offs, timings, audio rules, placement criteria or how results are worded — and when reviewing assessment UI for anything that could influence candidates.
---

# INTER Assessment Standards

## 0. Status of these parameters

The values below are the **operational parameters of INTER Placement Test v1.0**. They are in production and protected by tests, but they have **not yet been formally validated by INTER's academic coordination or calibrated psychometrically**. Treat them as fixed until an approved change says otherwise.

**Change control (mandatory):**
1. Never change an academic parameter unilaterally (items, routing, difficulties, rubrics, weights, cut-offs, placement thresholds, timings, audio-play rules, test conditions).
2. Write the proposal, with its justification, expected impact and evidence, in `docs/PENDING-ACADEMIC-APPROVAL.md` (status *Pendiente*).
3. Implement only after written approval. Bump `ASSESSMENT_VERSION` (`src/lib/ids.ts`) and update the academic-lock tests (`tests/unit/assessment.test.ts`) in the same change.
4. Content fingerprints (`src/lib/versioning.ts`) are stored with every result, so each score stays traceable to the exact bank, cut-offs and rubric that produced it.

Purely technical fixes that leave the rule unchanged are allowed but must be documented. Examples: counting an audio play only when audio actually starts; using a seeded tie-break between equivalent testlets.

## 1. Purpose

Identify the candidate's English proficiency per skill, recommend the INTER entry module, and establish the **T0 baseline** for the Executive Learning Report (ELR).

## 2. Structure & conditions (v1.0)

| Section | Format | Time | Rules |
|---|---|---|---|
| Reading | Multistage adaptive: 5 testlets × 3 MCQ (4 options) | 20 min | No return to a submitted testlet |
| Listening | Same design | 15 min | **Max 2 plays per audio**; a play counts only once audio starts; no return |
| Writing | W1 email 60–120 words (A2–B1) · W2 opinion essay 150–250 words (B1–C2) | 25 min | Paste disabled; both tasks editable until the section is submitted |
| Speaking | S1 intro (15 s prep / 45 s) · S2 narrative (25 / 75) · S3 argument (30 / 90) | ≈ 6 min | Auto-start after prep; candidate may stop after 8 s |

**Conditions:** individual; full screen; copy, paste, print and screenshot shortcuts blocked; content hidden on loss of focus; personal watermark; every integrity event is logged, never auto-penalised. Timers continue through reloads. When time expires the section is submitted with whatever has been answered.

**Standardisation:** identical instructions, timings and rules for every candidate. During the test, never show anything that could condition answers: no right/wrong feedback, no praise, no ticks on the selected option, no score previews, no hints. Neutral progress (e.g. "Bloque 2 de 5") and time remaining are allowed.

## 3. Scoring

- **Reading / Listening:** 3PL IRT (a = 1.1, c = 0.2, D = 1.7). Item difficulty = level centre + item offset; centres A1 −3, A2 −1.8, B1 −0.6, B2 0.6, C1 1.8, C2 3. EAP on a grid of −5.5 to 5.5 with prior N(0, 2). Score = round(50 + 8.333·θ), clamped 0–100. SEM is reported as ±1 SE in score points.
- **Routing:** start at B1. After each testlet, proportion correct ≥ 0.66 → up one level; ≤ 0.34 → down one; otherwise stay. Nearest available level first. The tie-break is seeded per attempt.
- **Writing:** 4 CEFR criteria (Task achievement · Coherence & cohesion · Lexical range & accuracy · Grammatical range & accuracy). **Speaking:** 5 criteria (Fluency · Coherence · Lexical range · Grammatical range & accuracy · Pronunciation & intelligibility, inferred cautiously from ASR). Both use AI-assisted rubric scoring when configured. Low confidence → *provisional*. Without AI, the heuristic fallback is always *provisional* and capped at C1.
- Missing speech transcript → *pending_review* (the audio is kept for the teacher).
- **Overall** = mean of the scored skills (pending skills are excluded and flagged).

## 4. Cut-offs (INTER scale ↔ CEFR)

A0 (Pre-A1) 0–20 · A1 21–30 · A2 31–40 · B1 41–50 · B2 51–60 · C1 61–70 · C2 71–100.

## 5. Placement (entry module by overall index)

| Module | Target | Min index |
|---|---|---|
| Basic Introduction | A1 | 0 |
| Basic Interactive | A2 | 27 |
| Intermediate Productive | B1 | 37 |
| Intermediate Master | B2 | 47 |
| Advanced I *(provisional name)* | B2+/C1 | 57 |
| Advanced II · Executive *(provisional name)* | C1 | 66 |

Rule of thumb behind the thresholds: the lower ~60 % of a band consolidates that band's module; the upper ~40 % moves on to the next. The placement is a **recommendation**: academic coordination validates the final assignment. Alerts: SKILL_GAP (skill ≥ 10 points below the mean), PENDING_REVIEW, PROVISIONAL, INTEGRITY_*.

## 6. CEFR alignment: how to talk about it

- Allowed: "alineada al MCER", "alineada conceptualmente a los descriptores del MCER", "evaluación diagnóstica interna".
- Not allowed: "certificación oficial", "certificado MCER", "validada psicométricamente", "precisión de X %", or any equivalence to external exams. Do not attribute accuracy that has not been demonstrated.
- Always show provisional states and margins of error where they exist. Never generate fictitious metrics or sample results.

## 7. Roadmap to formal validation (proposals, pending approval)

Expert standard-setting (e.g. a Bookmark/Angoff panel) to confirm the cut-offs · empirical IRT calibration once each item has ≥ 200 responses · double human rating of a Writing/Speaking sample to measure rater–AI agreement · studio-recorded audio to replace browser speech synthesis · item-bank expansion to ≥ 4 testlets per level for exposure control.

## 8. Code map

`src/lib/bank/*` (items, tasks) · `src/lib/adaptive.ts` (routing) · `src/lib/irt.ts` · `src/lib/cefr.ts` (scale and cut-offs) · `src/lib/ai-scoring.ts` (rubrics) · `src/lib/heuristics.ts` · `src/lib/placement.ts` · tests in `tests/unit/assessment.test.ts`.
