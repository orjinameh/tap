import { NextRequest, NextResponse } from "next/server";
import { aiSummarize } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }
    const summary = await aiSummarize(text);
    return NextResponse.json({
      result: summary,
      api: "summarize",
      price: "$0.01 USDC",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Summarization failed" }, { status: 500 });
  }
}
