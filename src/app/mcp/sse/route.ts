import { NextRequest } from "next/server";

const TOOLS = [
  {
    name: "create_agent",
    description: "Create a new AI agent wallet with spending policies",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Agent name" },
        maxPerTransaction: { type: "number", description: "Max USDC per transaction" },
        maxPerDay: { type: "number", description: "Max USDC per day" },
        maxPerWeek: { type: "number", description: "Max USDC per week" },
      },
      required: ["name"],
    },
  },
  {
    name: "list_agents",
    description: "List all your agent wallets with their policies and spending",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "check_policy",
    description: "Check if an agent can make a specific payment",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
        service: { type: "string", description: "Service name" },
        amount: { type: "number", description: "Amount in USDC" },
      },
      required: ["agentId", "service", "amount"],
    },
  },
  {
    name: "get_receipts",
    description: "Get spending receipts for an agent",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
      },
      required: ["agentId"],
    },
  },
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
          serverInfo: { name: "agentvault-mcp", version: "1.0.0" },
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

    if (name === "list_agents") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{
            type: "text",
            text: "Authentication required. Call /api/auth/nonce and /api/auth/verify to get a JWT token, then call GET /api/agents with Authorization: Bearer <token>.",
          }],
        },
      });
    }

    if (name === "create_agent") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{
            type: "text",
            text: JSON.stringify({
              message: "Create an agent via POST /api/agents",
              body: {
                name: args?.name,
                policy: {
                  maxPerTransaction: args?.maxPerTransaction || 0.10,
                  maxPerDay: args?.maxPerDay || 1.00,
                  maxPerWeek: args?.maxPerWeek || 5.00,
                  allowedServices: [],
                  blockedServices: [],
                },
              },
            }, null, 2),
          }],
        },
      });
    }

    if (name === "check_policy") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{
            type: "text",
            text: `Policy check for agent ${args?.agentId}: service=${args?.service}, amount=$${args?.amount}. Call GET /api/agents/${args?.agentId} to see full policy details.`,
          }],
        },
      });
    }

    if (name === "get_receipts") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{
            type: "text",
            text: `Call GET /api/agents/${args?.agentId}/receipts with Authorization: Bearer <token> to get receipts.`,
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
