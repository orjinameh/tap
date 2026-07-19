import { NextRequest, NextResponse } from "next/server";
import { createService, getServicesByCreator } from "@/lib/service-wallet";
import { getAddressFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const address = getAddressFromRequest(request);
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const services = getServicesByCreator(address);
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const address = getAddressFromRequest(request);
  if (!address) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name, description, category } = await request.json();
  if (!name || !description) {
    return NextResponse.json({ error: "Missing 'name' or 'description'" }, { status: 400 });
  }

  const svc = createService(name, description, category || "general", address);

  return NextResponse.json({
    id: svc.id,
    name: svc.name,
    description: svc.description,
    category: svc.category,
    price: svc.price,
    walletAddress: svc.walletAddress,
    message: "Service created. Share the MCP endpoint or endpoint URL for others to discover and pay to use.",
  });
}
