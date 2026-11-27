/**
 * AI rubric scoring for Writing & Speaking with Claude (structured outputs).
 * Server-only. Falls back to heuristics when ANTHROPIC_API_KEY is missing or the call fails.
 */
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CEFR_LEVELS, scoreToCefr, type Cefr } from "./cefr";
import { heuristicScore } from "./heuristics";
import { SPEAKING_TASKS, WRITING_TASKS } from "./bank/productive";

const CefrEnum = z.enum(CEFR_LEVELS);

const AssessmentSchema = z.object({
  skill_score: z.number().describe("Overall skill score on the INTER 0–100 scale"),
  cefr: CefrEnum,
  confidence: z.enum(["high", "medium", "low"]),
  criteria: z.array(
    z.object({
      name: z.string().describe("Criterion name in English, e.g. 'Task achievement'"),
      cefr: CefrEnum,
      score: z.number().describe("0–100 on the INTER scale"),
      comment_es: z.string().describe("One sentence of evidence-based feedback, in Spanish"),
    }),
  ),
  per_task: z.array(z.object({ task_id: z.string(), cefr: CefrEnum, comment_es: z.string() })),
  strengths_es: z.array(z.string()).describe("2–4 concrete strengths, in Spanish"),
  improvements_es: z.array(z.string()).describe("2–4 concrete, actionable improvement areas, in Spanish"),
  flags: z
    .array(z.enum(["too_short", "off_topic", "non_english", "possibly_memorized", "possibly_ai_generated", "unintelligible", "blank"]))
    .describe("Integrity or quality flags; empty if none"),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

const SCALE = `INTER score scale (0–100) ↔ CEFR:
A0 0–20 · A1 21–30 · A2 31–40 · B1 41–50 · B2 51–60 · C1 61–70 · C2 71–100.
Place the score inside the band according to how securely the performance meets that level (low / mid / high in band).`;

const WRITING_RUBRIC = `You are a senior, certified CEFR examiner rating the WRITING section of the INTER Placement Test
(Instituto Interamericano de Lenguas, Dominican Republic). Candidates are adult Spanish speakers.

Rate the candidate's writing ability across BOTH tasks together, using the CEFR Written Production and
Written Interaction descriptors. Criteria (return exactly these four, in this order):
1. Task achievement — covers all content points, appropriate register and length.
2. Coherence & cohesion — organisation, paragraphing, linking devices, referencing.
3. Lexical range & accuracy — breadth, precision, collocation, spelling.
4. Grammatical range & accuracy — variety of structures and control.

Rules:
- Judge what the text DEMONSTRATES, not what the task targets. A flawless short email shows at most B1.
- If a response is far below the minimum length, cap that task's contribution and add flag "too_short".
- Off-topic or memorised-looking text: flag it and rate only genuine language.
- Spanish or another language: flag "non_english"; it earns no credit.
- Unusually polished text with no errors and generic phrasing may be flagged "possibly_ai_generated", but still rate it.
- An empty response → flag "blank".
${SCALE}
Write all comments, strengths and improvements in clear, professional Spanish, addressed to the academic team.`;

const SPEAKING_RUBRIC = `You are a senior, certified CEFR examiner rating the SPEAKING section of the INTER Placement Test
(Instituto Interamericano de Lenguas, Dominican Republic). Candidates are adult Spanish speakers.

You receive automatic speech-recognition (ASR) transcripts of three recorded monologue tasks, with timing data
(duration, words per minute, ASR confidence). Rate overall spoken production using CEFR descriptors.
Criteria (return exactly these five, in this order):
1. Fluency — speech rate, length of turns, hesitation (infer from wpm, length and transcript).
2. Coherence — organisation, linking, ability to develop ideas and argue.
3. Lexical range — breadth and precision of vocabulary.
4. Grammatical range & accuracy — structures attempted and control.
5. Pronunciation & intelligibility — infer cautiously from ASR confidence and recognition errors only.

Rules:
- ASR may drop fillers, mis-hear words and omit punctuation; do not penalise punctuation and give benefit
  of the doubt on isolated odd words. Never rate pronunciation above the evidence; lower "confidence" accordingly.
- Very short answers relative to the time available indicate limited fluency; flag "too_short" if under ~25% of time.
- Recited/memorised-sounding introductions should not inflate the score; weight tasks 2 and 3 more heavily.
- Spanish speech → flag "non_english".
${SCALE}
Write all comments, strengths and improvements in clear, professional Spanish, addressed to the academic team.`;

export interface WritingInput {
  taskId: string;
  text: string;
}
export interface SpeakingInput {
  taskId: string;
  transcript: string;
  durationSec: number;
  asrConfidence: number | null;
}

export interface ProductiveResult {
  score: number | null;
  cefr: Cefr | null;
  method: "ai-rubric" | "heuristic" | "none";
  status: "scored" | "provisional" | "pending_review";
  assessment?: Assessment;
  model?: string;
  note?: string;
}

function client() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic();
}
const MODEL = () => process.env.SCORING_MODEL || "claude-opus-5-5";

async function runAssessment(system: string, userContent: string): Promise<{ a: Assessment; model: string } | null> {
  const c = client();
  if (!c) return null;
  try {
    const res = await c.messages.parse({
      model: MODEL(),
      max_tokens: 16000,
      system,
      output_config: { effort: "medium", format: zodOutputFormat(AssessmentSchema) },
      messages: [{ role: "user", content: userContent }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) return null;
    return { a: res.parsed_output, model: res.model };
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error("[ai-scoring] API error", err.status, err.message);
    else console.error("[ai-scoring] failed", err);
    return null;
  }
}

function normalise(a: Assessment): Assessment {
  const score = Math.max(0, Math.min(100, Math.round(a.skill_score)));
  return { ...a, skill_score: score, cefr: scoreToCefr(score) };
}

export async function scoreWriting(inputs: WritingInput[]): Promise<ProductiveResult> {
  const nonEmpty = inputs.filter((i) => i.text.trim().length > 0);
  if (!nonEmpty.length) return { score: null, cefr: null, method: "none", status: "pending_review", note: "Sin respuestas escritas." };

  const body = WRITING_TASKS.map((t) => {
    const ans = inputs.find((i) => i.taskId === t.id)?.text ?? "";
    const words = (ans.match(/\S+/g) ?? []).length;
    return `### Task ${t.id} — ${t.title} (target ${t.targetLevel}; ${t.minWords}–${t.maxWords} words)
Prompt: ${t.prompt}${t.bullets ? "\n- " + t.bullets.join("\n- ") : ""}
Candidate response (${words} words):
<response>
${ans || "(blank)"}
</response>`;
  }).join("\n\n");

  const ai = await runAssessment(WRITING_RUBRIC, `Rate the following Writing section. Use task ids W1, W2 in per_task.\n\n${body}`);
  if (ai) {
    const a = normalise(ai.a);
    return { score: a.skill_score, cefr: a.cefr, method: "ai-rubric", status: a.confidence === "low" ? "provisional" : "scored", assessment: a, model: ai.model };
  }
  const h = heuristicScore(
    WRITING_TASKS.map((t, i) => ({ taskId: t.id, text: inputs.find((x) => x.taskId === t.id)?.text ?? "", minWords: t.minWords, weight: i === 0 ? 1 : 2 })),
  );
  return { score: h.score, cefr: h.cefr, method: "heuristic", status: "provisional", note: "Puntuación automática provisional (sin IA). Requiere revisión docente." };
}

export async function scoreSpeaking(inputs: SpeakingInput[]): Promise<ProductiveResult> {
  const withSpeech = inputs.filter((i) => i.transcript.trim().split(/\s+/).length >= 3);
  if (!withSpeech.length) {
    return { score: null, cefr: null, method: "none", status: "pending_review", note: "No se obtuvo transcripción automática. El audio queda para evaluación docente." };
  }
  const body = SPEAKING_TASKS.map((t) => {
    const r = inputs.find((i) => i.taskId === t.id);
    const words = r ? (r.transcript.match(/\S+/g) ?? []).length : 0;
    const wpm = r && r.durationSec > 0 ? Math.round((words / r.durationSec) * 60) : 0;
    return `### Task ${t.id} — ${t.title} (target ${t.targetLevel}; ${t.speakSeconds}s available)
Prompt: ${t.prompt}${t.bullets ? "\n- " + t.bullets.join("\n- ") : ""}
Spoke for ${r?.durationSec ?? 0}s · ${words} words · ${wpm} wpm · ASR confidence ${r?.asrConfidence != null ? r.asrConfidence.toFixed(2) : "n/a"}
<transcript>
${r?.transcript || "(no speech captured)"}
</transcript>`;
  }).join("\n\n");

  const ai = await runAssessment(SPEAKING_RUBRIC, `Rate the following Speaking section. Use task ids S1, S2, S3 in per_task.\n\n${body}`);
  if (ai) {
    const a = normalise(ai.a);
    return { score: a.skill_score, cefr: a.cefr, method: "ai-rubric", status: a.confidence === "low" ? "provisional" : "scored", assessment: a, model: ai.model };
  }
  const h = heuristicScore(
    SPEAKING_TASKS.map((t, i) => {
      const r = inputs.find((x) => x.taskId === t.id);
      return { taskId: t.id, text: r?.transcript ?? "", minWords: Math.round(t.speakSeconds * 1.6), weight: i + 1 };
    }),
  );
  return { score: h.score, cefr: h.cefr, method: "heuristic", status: "provisional", note: "Puntuación automática provisional (sin IA). Requiere revisión docente con el audio." };
}
