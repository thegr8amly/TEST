import { NextResponse } from "next/server";
import { saveAudio, storageEnabled } from "@/lib/storage";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!storageEnabled()) return NextResponse.json({ stored: false }, { status: 200 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const attemptId = String(form?.get("attemptId") ?? "");
  const taskId = String(form?.get("taskId") ?? "");
  if (!(file instanceof Blob) || file.size === 0 || file.size > 4_000_000) return NextResponse.json({ error: "invalid_file" }, { status: 400 });
  if (!/^ipt_[a-z0-9]{6,20}$/.test(attemptId) || !/^S[1-3]$/.test(taskId)) return NextResponse.json({ error: "invalid_ids" }, { status: 400 });
  const path = await saveAudio(attemptId, taskId, file);
  return NextResponse.json({ stored: Boolean(path), path });
}
