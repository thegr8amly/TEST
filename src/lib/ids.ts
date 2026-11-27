/**
 * Identifiers for the INTER learning ecosystem (ELR · INTERclassrooms).
 * See .claude/skills/inter-learning-analytics/SKILL.md for conventions.
 */
import "server-only";
import { createHash, createHmac } from "node:crypto";

export const ASSESSMENT_ID = "inter-placement";
export const ASSESSMENT_VERSION = "1.0.0"; // bump on any change to items, routing, cut-offs or rubrics

/** URL-safe, lowercase slug used for organization / cohort ids ("Liga Municipal Dominicana" → "liga-municipal-dominicana"). */
export function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export const organizationId = (name?: string) => (name && slug(name) ? `org_${slug(name)}` : undefined);
export const cohortId = (name?: string) => (name && slug(name) ? `coh_${slug(name)}` : undefined);

/** Stable pseudonymous candidate id: HMAC of the normalised e-mail (no PII in the id itself). */
export function candidateId(email: string) {
  const secret = process.env.ID_SECRET || process.env.ADMIN_KEY || "inter-placement-dev";
  return "cand_" + createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex").slice(0, 20);
}

export function contentHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 12);
}

/** YYYY-MM period used to segment results. */
export const period = (iso: string) => iso.slice(0, 7);
