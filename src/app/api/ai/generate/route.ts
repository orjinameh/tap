import { NextRequest, NextResponse } from "next/server";
import { aiGenerate } from "@/lib/ai";
import { checkSession } from "@/lib/check-session";

export async function POST(request: NextRequest) {
  const denied = checkSession(request);
  if (denied) return denied;

  try {
    const { prompt, type } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "Missing 'prompt' field" }, { status: 400 });
    }
    const generated = await aiGenerate(prompt, type || "blog post");
    return NextResponse.json({
      result: generated,
      api: "generate",
      type: type || "blog post",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
