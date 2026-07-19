import { NextRequest, NextResponse } from "next/server";
import { aiClassify } from "@/lib/ai";
import { checkSession } from "@/lib/check-session";

export async function POST(request: NextRequest) {
  const denied = checkSession(request);
  if (denied) return denied;

  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }
    const classification = await aiClassify(text);
    return NextResponse.json({
      result: classification,
      api: "classify",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
