import { isAdminRequest } from "@/lib/admin-auth";
import { applyFilter, periodOf } from "@/lib/segments";
import { listResults } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** CSV aligned with ELR_INTER › 01_SETUP › "E. Lista de participantes" + per-skill T0 baseline. */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return new Response("unauthorized", { status: 401 });
  const u = new URL(req.url);
  const f = Object.fromEntries(["org", "cohort", "period", "level", "status", "q"].map((k) => [k, u.searchParams.get(k) ?? undefined]));
  const rows = applyFilter(await listResults(1000), f);
  const head = ["attempt_id", "candidate_id", "organization_id", "cohort_id", "assessment_id", "assessment_version", "bank_version", "period", "completed_at", "student_id", "nombres_apellidos", "email", "telefono", "organizacion", "cohorte", "baseline_cefr", "overall_score", "reading", "reading_cefr", "listening", "listening_cefr", "writing", "writing_cefr", "speaking", "speaking_cefr", "modulo_recomendado", "revision_requerida", "alertas"];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [r.id, r.ids?.candidateId, r.ids?.organizationId, r.ids?.cohortId, r.ids?.assessmentId ?? "inter-placement", r.ids?.assessmentVersion ?? r.test.version, r.scoring?.bankVersion, periodOf(r), r.completedAt, r.candidate.studentId, r.candidate.fullName, r.candidate.email, r.candidate.phone, r.candidate.organization, r.candidate.cohort, r.elr.baselineCefr, r.overall.score,
      r.skills.reading.score, r.skills.reading.cefr, r.skills.listening.score, r.skills.listening.cefr, r.skills.writing.score, r.skills.writing.cefr, r.skills.speaking.score, r.skills.speaking.cefr,
      r.placement.moduleName, r.placement.reviewRequired ? "SI" : "NO", r.elr.alerts.map((a) => a.code).join("|")].map(esc).join(","),
  );
  return new Response("﻿" + [head.join(","), ...lines].join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="inter-placement-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
