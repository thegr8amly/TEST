import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkAdminKey, issueSessionValue } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const ok = checkAdminKey(String(form?.get("key") ?? ""));
  const res = NextResponse.redirect(new URL(ok ? "/admin" : "/admin?error=1", req.url), 303);
  if (ok) {
    const s = issueSessionValue();
    res.cookies.set(ADMIN_COOKIE, s.value, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: s.maxAge });
  } else {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
  }
  return res;
}
