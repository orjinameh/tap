import { NextRequest } from "next/server";
import {
  createService,
  getServicesByCreator,
  getAllServices,
  getService,
  getServiceStats,
  getServiceCalls,
  ALL_SERVICES,
} from "@/lib/service-wallet";
import { getAddressFromRequest } from "@/lib/auth";

const TOOLS = [
  {
    name: "discover_services",
    description: "List all available AI services on AgentVault. Returns service names, descriptions, prices, and creator info.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_service_info",
    description: "Get detailed info about a specific service: description, price, stats, recent calls.",
    inputSchema: {
      type: "object",
      properties: {
        serviceId: { type: "string", description: "Service ID" },
      },
      required: ["serviceId"],
    },
  },
  {
    name: "create_service",
    description: "Create a new x402-protected AI service. It gets its own wallet and MCP endpoint.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Service name" },
        description: { type: "string", description: "What this service does" },
        category: { type: "string", description: "Service type: summarize, translate, code-review, generate, explain, classify" },
      },
      required: ["name", "description", "category"],
    },
  },
  {
    name: "my_services",
    description: "List services you created with earnings and usage stats",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_service_calls",
    description: "Get recent calls to a service you own — who called it, what they sent, what they paid",
    inputSchema: {
      type: "object",
      properties: {
        serviceId: { type: "string", description: "Service ID" },
      },
      required: ["serviceId"],
    },
  },
];

function ok(id: string | number | null, content: string) {
  return Response.json({
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text: content }] },
  });
}

function err(id: string | number | null, code: number, message: string) {
  return Response.json({
    jsonrpc: "2.0",
    id,
    error: { code, message },
  });
}

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
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
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
  }

  if (!body?.method) {
    return Response.json({
      jsonrpc: "2.0",
      id: body?.id ?? null,
      error: { code: -32600, message: "Invalid request" },
    });
  }

  if (body.method === "tools/list") {
    return Response.json({ jsonrpc: "2.0", id: body.id, result: { tools: TOOLS } });
  }

  if (body.method === "tools/call") {
    if (!body.params || typeof body.params.name !== "string") {
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32602, message: "Missing tool name" },
      });
    }

    const { name, arguments: args } = body.params;

    try {
      const address = getAddressFromRequest(request);

      if (name === "discover_services") {
        const all = getAllServices();
        const result = all.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          category: s.category,
          price: `$${s.price}`,
          endpoint: `POST /api/services/${s.id}/run`,
          calls: s.totalCalls,
        }));
        return ok(body.id, JSON.stringify({ services: result, count: result.length }, null, 2));
      }

      if (name === "get_service_info") {
        if (!args?.serviceId) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32602, message: "Missing serviceId" },
          });
        }
        const svc = getService(args.serviceId);
        if (!svc) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32002, message: `Service not found: ${args.serviceId}` },
          });
        }
        const stats = getServiceStats(args.serviceId);
        return ok(body.id, JSON.stringify({
          ...svc,
          walletPrivateKey: undefined,
          stats,
        }, null, 2));
      }

      if (name === "create_service") {
        if (!address) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32000, message: "Authentication required" },
          });
        }
        if (!args?.name || !args?.description || !args?.category) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32602, message: "Missing required: name, description, category" },
          });
        }
        if (!ALL_SERVICES.includes(args.category)) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32602, message: `Invalid category. Must be one of: ${ALL_SERVICES.join(", ")}` },
          });
        }
        const svc = createService(args.name, args.description, args.category, address);
        return ok(body.id, JSON.stringify({
          id: svc.id,
          name: svc.name,
          category: svc.category,
          price: `$${svc.price}`,
          endpoint: `POST /api/services/${svc.id}/run`,
          walletAddress: svc.walletAddress,
          message: "Service created. Others can discover and pay for it via MCP or the endpoint.",
        }, null, 2));
      }

      if (name === "my_services") {
        if (!address) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32000, message: "Authentication required" },
          });
        }
        const myServices = getServicesByCreator(address);
        const result = myServices.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          price: `$${s.price}`,
          totalCalls: s.totalCalls,
          totalEarnings: `$${s.totalEarnings.toFixed(4)}`,
          stats: getServiceStats(s.id),
        }));
        return ok(body.id, JSON.stringify({ services: result }, null, 2));
      }

      if (name === "get_service_calls") {
        if (!args?.serviceId) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32602, message: "Missing serviceId" },
          });
        }
        const svc = getService(args.serviceId);
        if (!svc) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32002, message: `Service not found: ${args.serviceId}` },
          });
        }
        if (!address || svc.creatorAddress !== address.toLowerCase()) {
          return Response.json({
            jsonrpc: "2.0",
            id: body.id,
            error: { code: -32001, message: "Unauthorized" },
          });
        }
        const records = getServiceCalls(args.serviceId);
        return ok(body.id, JSON.stringify({
          service: svc.name,
          calls: records.slice(-20).reverse(),
        }, null, 2));
      }

      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32601, message: `Unknown tool: ${name}` },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Internal error";
      return Response.json({
        jsonrpc: "2.0",
        id: body.id,
        error: { code: -32603, message },
      });
    }
  }

  return Response.json({
    jsonrpc: "2.0",
    id: body.id,
    error: { code: -32601, message: `Method not found: ${body.method}` },
  });
}
