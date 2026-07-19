import { NextRequest, NextResponse } from "next/server";
import { getAgent, getSpendRecords } from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const address = getAddressFromRequest(request);
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  if (agent.ownerAddress !== address.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const records = getSpendRecords(id);
  return NextResponse.json({ receipts: records });
}
