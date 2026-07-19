import { NextRequest, NextResponse } from "next/server";
import { aiExplain } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }
    const explanation = await aiExplain(text);
    return NextResponse.json({
      result: explanation,
      api: "explain",
      price: "$0.01 USDC",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Explanation failed" }, { status: 500 });
  }
}
