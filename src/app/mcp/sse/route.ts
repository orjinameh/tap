import { NextRequest } from "next/server";

const TOOLS = [
  {
    name: "list_apis",
    description: "List all available AI APIs with their prices and descriptions",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "call_api",
    description: "Call an AI API endpoint. Requires x402 payment.",
    inputSchema: {
      type: "object",
      properties: {
        api: { type: "string", description: "API name: summarize, translate, code-review, generate, explain, classify" },
        text: { type: "string", description: "Input text for the API" },
        targetLang: { type: "string", description: "Target language (for translate API)" },
        type: { type: "string", description: "Content type (for generate API)" },
      },
      required: ["api", "text"],
    },
  },
];

const API_CATALOG = [
  { name: "summarize", price: "$0.01 USDC", description: "AI Text Summarization" },
  { name: "translate", price: "$0.01 USDC", description: "AI Translation" },
  { name: "code-review", price: "$0.05 USDC", description: "AI Code Review" },
  { name: "generate", price: "$0.02 USDC", description: "AI Content Generation" },
  { name: "explain", price: "$0.01 USDC", description: "AI Code/Text Explanation" },
  { name: "classify", price: "$0.005 USDC", description: "AI Text Classification" },
];

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("endpoint", { url: "/mcp/sse" });

      const messageId = "msg-" + Date.now();
      send("message", {
        jsonrpc: "2.0",
        id: messageId,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "tap-mcp", version: "1.0.0" },
        },
      });

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.method === "tools/list") {
    return Response.json({
      jsonrpc: "2.0",
      id: body.id,
      result: { tools: TOOLS },
    });
  }

  if (body.method === "tools/call") {
    const { name, arguments: args } = body.params;

    if (name === "list_apis") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{ type: "text", text: JSON.stringify(API_CATALOG, null, 2) }],
        },
      });
    }

    if (name === "call_api") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: "x402 payment required",
              message: `To call /api/ai/${args?.api || "unknown"}, include an X-PAYMENT header with a valid x402 payment.`,
              endpoint: `/api/ai/${args?.api || "unknown"}`,
              price: API_CATALOG.find((a) => a.name === args?.api)?.price || "unknown",
            }, null, 2),
          }],
        },
      });
    }

    return Response.json({
      jsonrpc: "2.0",
      id: body.id,
      error: { code: -32601, message: `Unknown tool: ${name}` },
    });
  }

  return Response.json({ jsonrpc: "2.0", id: body.id, error: { code: -32601, message: "Method not found" } });
}
