import { NextRequest, NextResponse } from "next/server";
import { getSignMessage } from "@/lib/auth";

const nonces = new Map<string, { nonce: string; expires: number }>();

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  const nonce = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  nonces.set(address.toLowerCase(), { nonce, expires: Date.now() + 5 * 60 * 1000 });

  return NextResponse.json({
    nonce,
    message: `${getSignMessage()} — Nonce: ${nonce}`,
  });
}
