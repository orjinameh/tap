import { NextRequest, NextResponse } from "next/server";
import { getAgent, getAgentStats, deactivateAgent, updateAgentPolicy, SpendingPolicy } from "@/lib/agent-wallet";
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

  const stats = getAgentStats(id);

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    address: agent.address,
    policy: agent.policy,
    totalSpent: agent.totalSpent,
    isActive: agent.isActive,
    createdAt: agent.createdAt,
    lastActive: agent.lastActive,
    stats,
  });
}

export async function PATCH(
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

  const { policy, isActive } = await request.json();
  if (policy) {
    updateAgentPolicy(id, policy as SpendingPolicy);
  }
  if (isActive === false) {
    deactivateAgent(id);
  }

  const updated = getAgent(id);
  return NextResponse.json({ agent: updated });
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

  deactivateAgent(id);
  return NextResponse.json({ message: "Agent deactivated" });
}
