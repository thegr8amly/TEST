/** Content fingerprints so every result records exactly which bank / cut-offs / rubrics scored it. */
import "server-only";
import { BANK, LEVEL_ORDER, START_LEVEL_INDEX, TESTLETS_PER_SECTION } from "./bank";
import { SPEAKING_TASKS, WRITING_TASKS } from "./bank/productive";
import { CEFR_BANDS, LEVEL_DIFFICULTY, THETA_SLOPE } from "./cefr";
import { RUBRIC_TEXT } from "./ai-scoring";
import { ASSESSMENT_ID, ASSESSMENT_VERSION, contentHash } from "./ids";
import { MODULES } from "./placement";

let cached: ReturnType<typeof compute> | null = null;
function compute() {
  return {
    assessmentId: ASSESSMENT_ID,
    assessmentVersion: ASSESSMENT_VERSION,
    objectiveModel: "3PL-IRT/EAP · multistage routing" as const,
    bankVersion: contentHash({ BANK, WRITING_TASKS, SPEAKING_TASKS }),
    routingVersion: contentHash({ LEVEL_ORDER, START_LEVEL_INDEX, TESTLETS_PER_SECTION, LEVEL_DIFFICULTY, THETA_SLOPE }),
    cutoffsVersion: contentHash(CEFR_BANDS),
    placementVersion: contentHash(MODULES),
    rubricVersion: contentHash(RUBRIC_TEXT),
  };
}
export function scoringVersions() {
  return (cached ??= compute());
}
