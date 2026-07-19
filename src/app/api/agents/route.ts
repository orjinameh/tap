import { NextRequest, NextResponse } from "next/server";
import { createAgent, getAgentsByOwner, SpendingPolicy } from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const address = getAddressFromRequest(request);
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const agents = getAgentsByOwner(address);
  return NextResponse.json({ agents });
}

export async function POST(request: NextRequest) {
  const address = getAddressFromRequest(request);
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, policy } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Missing 'name' field" }, { status: 400 });
  }

  const defaultPolicy: SpendingPolicy = policy || {
    maxPerTransaction: 0.10,
    maxPerDay: 1.00,
    maxPerWeek: 5.00,
    allowedServices: [],
    blockedServices: [],
  };

  const agent = createAgent(name, address, defaultPolicy);

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    address: agent.address,
    policy: agent.policy,
    message: "Agent wallet created. Fund it with USDC on Base Sepolia to start spending.",
  });
}
