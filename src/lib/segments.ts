/** Segmentation helpers shared by the admin panel and the CSV export. */
import type { BaselineRecord } from "./record";

export type SegmentFilter = { org?: string; cohort?: string; period?: string; level?: string; status?: string; q?: string };

export const orgOf = (r: BaselineRecord) => r.ids?.organizationId ?? (r.candidate.organization ? `org:${r.candidate.organization}` : "");
export const cohortOf = (r: BaselineRecord) => r.ids?.cohortId ?? (r.candidate.cohort ? `coh:${r.candidate.cohort}` : "");
export const periodOf = (r: BaselineRecord) => r.period ?? r.completedAt.slice(0, 7);

export function applyFilter(all: BaselineRecord[], f: SegmentFilter) {
  const q = (f.q ?? "").trim().toLowerCase();
  return all.filter(
    (r) =>
      (!f.org || orgOf(r) === f.org) &&
      (!f.cohort || cohortOf(r) === f.cohort) &&
      (!f.period || periodOf(r) === f.period) &&
      (!f.level || r.overall.cefr === f.level) &&
      (!f.status || (f.status === "review" ? r.placement.reviewRequired : !r.placement.reviewRequired)) &&
      (!q || `${r.candidate.fullName} ${r.candidate.email} ${r.candidate.studentId ?? ""} ${r.id}`.toLowerCase().includes(q)),
  );
}
