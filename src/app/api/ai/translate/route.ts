import { NextRequest, NextResponse } from "next/server";
import { aiTranslate } from "@/lib/ai";

export async function POST(request: NextRequest) {
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
      price: "$0.01 USDC",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
