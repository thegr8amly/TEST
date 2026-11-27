/**
 * Admin authentication: signed, httpOnly, SameSite=Strict session cookie (8 h) or an
 * `Authorization: Bearer <ADMIN_KEY>` header for server-to-server integrations.
 * The key never travels in URLs.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "inter_admin";
const TTL_MS = 8 * 60 * 60 * 1000;

const key = () => process.env.ADMIN_KEY || "";
export const adminConfigured = () => key().length >= 12;

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function checkAdminKey(candidate: string | null | undefined) {
  return adminConfigured() && !!candidate && safeEqual(candidate, key());
}

const sign = (exp: number) => createHmac("sha256", key()).update(`inter-admin:v1:${exp}`).digest("hex");

export function issueSessionValue() {
  const exp = Date.now() + TTL_MS;
  return { value: `${exp}.${sign(exp)}`, maxAge: TTL_MS / 1000 };
}

function validSession(value: string | undefined) {
  if (!value || !adminConfigured()) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  return Number.isFinite(exp) && exp > Date.now() && !!sig && safeEqual(sig, sign(exp));
}

/** For server components (reads the cookie store). */
export async function isAdminSession() {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** For route handlers: Bearer header or session cookie. */
export function isAdminRequest(req: Request) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer && checkAdminKey(bearer)) return true;
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return validSession(m ? decodeURIComponent(m[1]) : undefined);
}
