import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReportView } from "@/components/ReportView";
import { isAdminSession } from "@/lib/admin-auth";
import { toPublicRecord } from "@/lib/record";
import { getResult } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reporte · INTER Placement Test", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rec = await getResult(id).catch(() => null);
  if (!rec) notFound();
  const admin = await isAdminSession();
  // Candidates get the sanitised view; responses/evidence are rendered only for an admin session.
  return <ReportView rec={toPublicRecord({ ...rec, persisted: true })} evidence={admin ? rec : undefined} />;
}
