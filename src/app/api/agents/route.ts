import { NextRequest, NextResponse } from "next/server";
import { createAgent, getAgentsByOwner, ALL_SERVICES } from "@/lib/agent-wallet";
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

  const { name, services } = await request.json();
  if (!name) {
    return NextResponse.json({ error: "Missing 'name' field" }, { status: 400 });
  }

  const selectedServices = Array.isArray(services) ? services : [];
  if (selectedServices.length === 0) {
    return NextResponse.json({ error: "Select at least one service" }, { status: 400 });
  }

  const invalid = selectedServices.filter((s: string) => !ALL_SERVICES.includes(s));
  if (invalid.length > 0) {
    return NextResponse.json({ error: `Invalid services: ${invalid.join(", ")}` }, { status: 400 });
  }

  const agent = createAgent(name, address, selectedServices);

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    address: agent.address,
    services: agent.services,
    isActive: false,
    message: "Agent created. Buy time to activate AI access.",
  });
}
