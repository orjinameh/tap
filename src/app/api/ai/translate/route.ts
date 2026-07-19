import { NextRequest, NextResponse } from "next/server";
import { aiTranslate } from "@/lib/ai";
import { checkSession } from "@/lib/check-session";

export async function POST(request: NextRequest) {
  const denied = checkSession(request);
  if (denied) return denied;

  try {
    const { text, targetLang } = await request.json();
    if (!text || !targetLang) {
      return NextResponse.json({ error: "Missing 'text' or 'targetLang' field" }, { status: 400 });
    }
    const translated = await aiTranslate(text, targetLang);
    return NextResponse.json({
      result: translated,
      api: "translate",
      targetLang,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
