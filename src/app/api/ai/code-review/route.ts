import { NextRequest, NextResponse } from "next/server";
import { aiCodeReview } from "@/lib/ai";
import { checkSession } from "@/lib/check-session";

export async function POST(request: NextRequest) {
  const denied = checkSession(request);
  if (denied) return denied;

  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Missing 'code' field" }, { status: 400 });
    }
    const review = await aiCodeReview(code);
    return NextResponse.json({
      result: review,
      api: "code-review",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Code review failed" }, { status: 500 });
  }
}
