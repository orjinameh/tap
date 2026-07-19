import { NextRequest, NextResponse } from "next/server";

const sessions = new Map<string, { expiresAt: number; paymentTxHash: string }>();

export function createSession(txHash: string, durationMs: number = 30 * 60 * 1000): string {
  const token = `sess_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  sessions.set(token, {
    expiresAt: Date.now() + durationMs,
    paymentTxHash: txHash,
  });
  return token;
}

export function isValidSession(token: string | null): boolean {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function getSessionFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer sess_")) return auth.slice(7);

  // Check cookie
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/tap_session=([^;]+)/);
  if (match) return match[1];

  // Check query param
  const param = request.nextUrl.searchParams.get("session");
  if (param) return param;

  return null;
}

export async function GET(request: NextRequest) {
  const token = getSessionFromRequest(request);

  if (!token) {
    return NextResponse.json({ error: "No session found" }, { status: 401 });
  }

  const session = sessions.get(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  return NextResponse.json({
    valid: true,
    expiresAt: new Date(session.expiresAt).toISOString(),
    remainingMinutes: Math.round((session.expiresAt - Date.now()) / 60000),
    paymentTxHash: session.paymentTxHash,
  });
}
