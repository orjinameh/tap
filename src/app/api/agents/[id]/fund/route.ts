import { NextRequest, NextResponse } from "next/server";
import { getAgent } from "@/lib/agent-wallet";
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

  // In production, this would transfer USDC from owner to agent wallet
  // For now, simulate funding
  const { amount } = await request.json();

  return NextResponse.json({
    message: `Funded agent ${agent.name} with $${amount} USDC`,
    agentAddress: agent.address,
    amount,
    note: "On Base Sepolia — transfer USDC to this address to fund the agent",
    fundAddress: agent.address,
  });
}
