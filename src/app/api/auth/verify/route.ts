import { NextRequest, NextResponse } from "next/server";
import { recoverAddress, signJWT, getSignMessage } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { address, signature, message } = await request.json();

  if (!address || !signature) {
    return NextResponse.json({ error: "Missing address or signature" }, { status: 400 });
  }

  const signMessage = message || getSignMessage();
  const recovered = recoverAddress(signMessage, signature);

  if (!recovered || recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const token = signJWT({ address: address.toLowerCase() });

  return NextResponse.json({
    token,
    address: address.toLowerCase(),
  });
}
