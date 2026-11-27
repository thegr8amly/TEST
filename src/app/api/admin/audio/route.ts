import { getAudio, isAdmin } from "@/lib/storage";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = new URL(req.url);
  if (!isAdmin(u.searchParams.get("key"))) return new Response("unauthorized", { status: 401 });
  const r = await getAudio(u.searchParams.get("path") ?? "");
  if (!r) return new Response("not found", { status: 404 });
  return new Response(r.stream, { headers: { "content-type": r.blob.contentType, "cache-control": "private, no-store" } });
}
