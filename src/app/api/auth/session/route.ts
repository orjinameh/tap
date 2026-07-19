import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  // If we reach here, x402 middleware already verified the payment
  const token = createSession("x402-paid", 30 * 60 * 1000);

  const response = NextResponse.json({
    sessionToken: token,
    expiresIn: "30 minutes",
    message: "Session activated. Use this token in Authorization: Bearer <token> header for all API calls.",
  });

  response.headers.set("Set-Cookie", `tap_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=1800`);

  return response;
}
