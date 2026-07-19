import { NextRequest, NextResponse } from "next/server";
import { getAgent, checkSpendingPolicy, recordSpend } from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";

const SERVICE_PRICES: Record<string, number> = {
  summarize: 0.01,
  translate: 0.01,
  "code-review": 0.05,
  generate: 0.02,
  explain: 0.01,
  classify: 0.005,
};

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

  const { service, input } = await request.json();
  if (!service || !input) {
    return NextResponse.json({ error: "Missing 'service' or 'input' field" }, { status: 400 });
  }

  const price = SERVICE_PRICES[service];
  if (price === undefined) {
    return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
  }

  // Check spending policy
  const policyCheck = checkSpendingPolicy(agent, service, price);
  if (!policyCheck.allowed) {
    recordSpend(agent.id, service, price, "blocked", { passed: false, reason: policyCheck.reason });
    return NextResponse.json({
      error: "Policy violation",
      reason: policyCheck.reason,
      policy: agent.policy,
    }, { status: 403 });
  }

  // In production, this would call the x402-protected API with the agent's wallet
  // For now, simulate the payment and return a mock result
  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const record = recordSpend(agent.id, service, price, txHash, { passed: true });

  return NextResponse.json({
    result: `[Agent ${agent.name}] ${service} completed for $${price} USDC`,
    service,
    amount: price,
    txHash,
    spendId: record.id,
    timestamp: record.timestamp,
    policyCheck: { passed: true },
  });
}
