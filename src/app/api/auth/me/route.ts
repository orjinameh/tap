import { NextRequest, NextResponse } from "next/server";
import { getAddressFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const address = getAddressFromRequest(request);
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ address });
}
