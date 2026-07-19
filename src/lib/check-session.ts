import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, isValidSession } from "@/lib/session";

export function checkSession(request: NextRequest): NextResponse | null {
  const sessionToken = getSessionFromRequest(request);
  if (!isValidSession(sessionToken)) {
    return NextResponse.json(
      {
        error: "Session required",
        message: "Pay $0.05 USDC via x402 to get 30 minutes of unlimited API access.",
        endpoint: "POST /api/auth/session",
      },
      { status: 402 }
    );
  }
  return null;
}
