import { NextRequest, NextResponse } from "next/server";
import { getService, recordCall } from "@/lib/service-wallet";
import { aiSummarize, aiTranslate, aiCodeReview, aiGenerate, aiExplain, aiClassify } from "@/lib/ai";

const CATEGORY_MAP: Record<string, (input: string, lang?: string) => Promise<string>> = {
  summarize: (input) => aiSummarize(input),
  translate: (input, lang) => aiTranslate(input, lang || "Spanish"),
  "code-review": (input) => aiCodeReview(input),
  generate: (input) => aiGenerate(input, "response"),
  explain: (input) => aiExplain(input),
  classify: (input) => aiClassify(input),
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const svc = getService(id);
  if (!svc) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const handler = CATEGORY_MAP[svc.category];
  if (!handler) {
    return NextResponse.json({ error: `Unknown service category: ${svc.category}` }, { status: 500 });
  }

  const { input, targetLang } = await request.json();
  if (!input) {
    return NextResponse.json({ error: "Missing 'input' field" }, { status: 400 });
  }

  let result: string;
  try {
    result = await handler(input, targetLang);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "AI execution failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const caller = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  recordCall(svc.id, caller, input, result, svc.price, txHash);

  return NextResponse.json({
    result,
    service: svc.name,
    category: svc.category,
    amount: svc.price,
    txHash,
    timestamp: new Date().toISOString(),
  });
}
