import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getResult } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Integration endpoint for the Campus Virtual: GET /api/results/{id} with `Authorization: Bearer <ADMIN_KEY>` (or an admin session). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const rec = await getResult(id);
  if (!rec) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(rec);
}
