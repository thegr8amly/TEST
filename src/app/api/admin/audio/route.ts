import { isAdminRequest } from "@/lib/admin-auth";
import { getAudio } from "@/lib/storage";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = new URL(req.url);
  if (!isAdminRequest(req)) return new Response("unauthorized", { status: 401 });
  const r = await getAudio(u.searchParams.get("path") ?? "");
  if (!r) return new Response("not found", { status: 404 });
  return new Response(r.stream, { headers: { "content-type": r.blob.contentType, "cache-control": "private, no-store" } });
}
