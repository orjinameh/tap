import { NextRequest, NextResponse } from "next/server";
import { aiGenerate } from "@/lib/ai";

export async function POST(request: NextRequest) {
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
      price: "$0.02 USDC",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
