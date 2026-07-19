import { NextRequest, NextResponse } from "next/server";
import { getAgent, getAgentStats, isAgentActive, getRemainingMs } from "@/lib/agent-wallet";
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

  const active = isAgentActive(agent);
  const remainingMs = getRemainingMs(agent);
  const stats = getAgentStats(id);

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    address: agent.address,
    services: agent.services,
    isActive: active,
    activatedAt: agent.activatedAt,
    expiresAt: agent.expiresAt,
    remainingMs,
    totalSpent: agent.totalSpent,
    createdAt: agent.createdAt,
    stats,
  });
}

export async function DELETE(
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

  return NextResponse.json({ message: "Agent deactivated" });
}
