import { NextRequest, NextResponse } from "next/server";
import { getService, getServiceStats, getServiceCalls } from "@/lib/service-wallet";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const svc = getService(id);
  if (!svc) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const stats = getServiceStats(id);
  const recentCalls = getServiceCalls(id).slice(-10).reverse();

  return NextResponse.json({
    id: svc.id,
    name: svc.name,
    description: svc.description,
    category: svc.category,
    price: svc.price,
    walletAddress: svc.walletAddress,
    creatorAddress: svc.creatorAddress,
    createdAt: svc.createdAt,
    stats,
    recentCalls,
  });
}
