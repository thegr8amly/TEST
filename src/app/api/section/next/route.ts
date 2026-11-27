import { NextResponse } from "next/server";
import { z } from "zod";
import { nextStep } from "@/lib/adaptive";

const Body = z.object({
  skill: z.enum(["reading", "listening"]),
  attemptId: z.string().regex(/^ipt_[a-z0-9]{6,20}$/).optional(),
  answers: z.array(z.object({ testletId: z.string().max(40), questionId: z.string().max(40), choice: z.number().int().min(0).max(5).nullable(), ms: z.number().optional() })).max(60),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const step = nextStep(parsed.data.skill, parsed.data.answers, parsed.data.attemptId);
  // Never leak the section score mid-test.
  if (step.done) return NextResponse.json({ done: true });
  return NextResponse.json(step, { headers: { "cache-control": "no-store" } });
}
