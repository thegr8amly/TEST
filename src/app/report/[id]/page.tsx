import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReportView } from "@/components/ReportView";
import { getResult, isAdmin } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reporte · INTER Placement Test", robots: { index: false } };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ key?: string }> }) {
  const { id } = await params;
  const { key } = await searchParams;
  const rec = await getResult(id).catch(() => null);
  if (!rec) notFound();
  const admin = isAdmin(key);
  return <ReportView rec={rec} admin={admin} adminKey={admin ? key : undefined} />;
}
