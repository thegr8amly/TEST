/**
 * Persistence adapter. Today: Vercel Blob (private store). Tomorrow: swap these
 * four functions for the Campus Virtual database without touching the UI.
 */
import "server-only";
import { createHmac } from "node:crypto";
import { get, list, put } from "@vercel/blob";
import type { BaselineRecord } from "./record";

export const storageEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const safe = (s: string) => /^[a-z0-9_-]{4,64}$/i.test(s);

export async function saveResult(rec: BaselineRecord): Promise<boolean> {
  if (!storageEnabled()) return false;
  await put(`results/${rec.id}.json`, JSON.stringify(rec), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return true;
}

export async function getResult(id: string): Promise<BaselineRecord | null> {
  if (!storageEnabled() || !safe(id)) return null;
  const r = await get(`results/${id}.json`, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse(await new Response(r.stream).text()) as BaselineRecord;
}

export async function listResults(limit = 200): Promise<BaselineRecord[]> {
  if (!storageEnabled()) return [];
  const { blobs } = await list({ prefix: "results/", limit });
  const recs = await Promise.all(
    blobs.map(async (b) => {
      const id = b.pathname.replace(/^results\//, "").replace(/\.json$/, "");
      try {
        return await getResult(id);
      } catch {
        return null;
      }
    }),
  );
  return recs.filter((r): r is BaselineRecord => !!r).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export async function saveAudio(attemptId: string, taskId: string, file: Blob): Promise<string | null> {
  if (!storageEnabled() || !safe(attemptId) || !/^S[1-3]$/.test(taskId)) return null;
  const ext = file.type.includes("mp4") ? "m4a" : file.type.includes("ogg") ? "ogg" : "webm";
  const path = `audio/${attemptId}/${taskId}.${ext}`;
  await put(path, file, { access: "private", contentType: file.type || "audio/webm", addRandomSuffix: false, allowOverwrite: true });
  return path;
}

export async function getAudio(path: string) {
  if (!storageEnabled() || !/^audio\/[a-z0-9_-]+\/[A-Z0-9]+\.(webm|ogg|m4a)$/i.test(path)) return null;
  const r = await get(path, { access: "private" });
  return r && r.statusCode === 200 ? r : null;
}

/** Fire-and-forget delivery to the Campus Virtual / ELR (e.g. Google Apps Script). */
export async function dispatchWebhook(rec: BaselineRecord) {
  const url = process.env.RESULTS_WEBHOOK_URL;
  if (!url) return;
  const body = JSON.stringify(rec);
  const headers: Record<string, string> = { "content-type": "application/json", "x-inter-event": "placement.completed" };
  if (process.env.RESULTS_WEBHOOK_SECRET) headers["x-inter-signature"] = createHmac("sha256", process.env.RESULTS_WEBHOOK_SECRET).update(body).digest("hex");
  try {
    await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(10000) });
  } catch (e) {
    console.error("[webhook] delivery failed", e);
  }
}

export function isAdmin(key: string | null | undefined) {
  const k = process.env.ADMIN_KEY;
  return Boolean(k && key && key === k);
}
