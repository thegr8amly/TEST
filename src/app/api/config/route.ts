import { NextResponse } from "next/server";
import { storageEnabled } from "@/lib/storage";

export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ storage: storageEnabled(), ai: Boolean(process.env.ANTHROPIC_API_KEY) });
}
