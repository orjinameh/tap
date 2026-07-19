import { NextRequest, NextResponse } from "next/server";
import { recoverAddress, signJWT, getSignMessage } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { address, signature } = await request.json();

  if (!address || !signature) {
    return NextResponse.json({ error: "Missing address or signature" }, { status: 400 });
  }

  const message = getSignMessage();
  const recovered = recoverAddress(message, signature);

  if (!recovered || recovered.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const token = signJWT({ address: address.toLowerCase() });

  return NextResponse.json({
    token,
    address: address.toLowerCase(),
  });
}
