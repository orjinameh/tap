import { NextRequest, NextResponse } from "next/server";
import { aiCodeReview } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Missing 'code' field" }, { status: 400 });
    }
    const review = await aiCodeReview(code);
    return NextResponse.json({
      result: review,
      api: "code-review",
      price: "$0.05 USDC",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Code review failed" }, { status: 500 });
  }
}
