import { NextRequest, NextResponse } from "next/server";
import { getAgent, activateAgent, getActivationPrice } from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";

export async function POST(
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

  if (agent.services.length === 0) {
    return NextResponse.json({ error: "Agent has no services configured" }, { status: 400 });
  }

  const price = getActivationPrice(agent.services.length);
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  const updated = activateAgent(id, txHash);
  if (!updated) {
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }

  return NextResponse.json({
    activated: true,
    services: updated.services,
    serviceCount: updated.services.length,
    price,
    txHash,
    expiresAt: updated.expiresAt,
    duration: "30 minutes",
    message: `Activated ${updated.services.length} service${updated.services.length !== 1 ? "s" : ""} for 30 minutes.`,
  });
}
