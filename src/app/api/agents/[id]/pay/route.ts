import { NextRequest, NextResponse } from "next/server";
import { getAgent, checkSpendingPolicy, recordSpend, getSpendRecords } from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";
import { aiSummarize, aiTranslate, aiCodeReview, aiGenerate, aiExplain, aiClassify } from "@/lib/ai";

const BASE_PRICES: Record<string, number> = {
  summarize: 0.01,
  translate: 0.01,
  "code-review": 0.05,
  generate: 0.02,
  explain: 0.01,
  classify: 0.005,
};

function calculatePrice(agentId: string, service: string): number {
  const base = BASE_PRICES[service];
  if (base === undefined) return 0;
  const records = getSpendRecords(agentId);
  const uniqueServices = new Set(records.filter((r) => r.policyCheck.passed).map((r) => r.service));
  uniqueServices.add(service);
  const serviceCount = uniqueServices.size;
  const multiplier = 1 + (serviceCount - 1) * 0.15;
  return Math.round(base * multiplier * 10000) / 10000;
}

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

  if (!(service in BASE_PRICES)) {
    return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
  }

  const price = calculatePrice(id, service);

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

  // Execute the actual AI service
  let aiResult: string;
  try {
    switch (service) {
      case "summarize":
        aiResult = await aiSummarize(input);
        break;
      case "translate":
        aiResult = await aiTranslate(input, "Spanish");
        break;
      case "code-review":
        aiResult = await aiCodeReview(input);
        break;
      case "generate":
        aiResult = await aiGenerate(input, "response");
        break;
      case "explain":
        aiResult = await aiExplain(input);
        break;
      case "classify":
        aiResult = await aiClassify(input);
        break;
      default:
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
    }
  } catch (aiError) {
    return NextResponse.json({
      error: "AI service call failed",
      message: aiError instanceof Error ? aiError.message : "Unknown AI error",
    }, { status: 502 });
  }

  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const record = recordSpend(agent.id, service, price, txHash, { passed: true });

  return NextResponse.json({
    result: aiResult,
    service,
    amount: price,
    basePrice: BASE_PRICES[service],
    serviceCount: new Set(getSpendRecords(id).filter((r) => r.policyCheck.passed).map((r) => r.service)).size,
    txHash,
    spendId: record.id,
    timestamp: record.timestamp,
    agent: agent.name,
    policyCheck: { passed: true },
  });
}
