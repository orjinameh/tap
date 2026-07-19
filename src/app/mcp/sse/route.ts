import { NextRequest } from "next/server";
import {
  createAgent,
  getAgentsByOwner,
  getAgent,
  activateAgent,
  getActivationPrice,
  isAgentActive,
  getRemainingMs,
  getSpendRecords,
  ALL_SERVICES,
} from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";
import { aiSummarize, aiTranslate, aiCodeReview, aiGenerate, aiExplain, aiClassify } from "@/lib/ai";

const TOOLS = [
  {
    name: "create_agent",
    description: "Create a new AI agent wallet. Pick services to include. Costs $0.05/service for 30 min unlimited access.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Agent name" },
        services: { type: "array", items: { type: "string" }, description: "Services to enable" },
      },
      required: ["name", "services"],
    },
  },
  {
    name: "list_agents",
    description: "List all your agents with activation status, services, and remaining time",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "activate_agent",
    description: "Buy 30 minutes of unlimited AI access for an agent. Price = $0.05 × number of services.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
      },
      required: ["agentId"],
    },
  },
  {
    name: "check_status",
    description: "Check if an agent is active and how much time is remaining",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
      },
      required: ["agentId"],
    },
  },
  {
    name: "run_service",
    description: "Run an AI service using an active agent. Agent must have time remaining.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
        service: { type: "string", description: "Service name" },
        input: { type: "string", description: "Input text" },
        targetLang: { type: "string", description: "Target language (for translate only)" },
      },
      required: ["agentId", "service", "input"],
    },
  },
  {
    name: "get_receipts",
    description: "Get activation history for an agent",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
      },
      required: ["agentId"],
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

function jsonErr(id: string | number | null) {
  return err(id, -32700, "Parse error: malformed JSON-RPC request");
}

function toolErr(id: string | number | null, message: string) {
  return err(id, -32603, message);
}

function paramErr(id: string | number | null, message: string) {
  return err(id, -32602, message);
}

function ownershipErr(id: string | number | null) {
  return err(id, -32001, "Unauthorized: you do not own this agent");
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
    return jsonErr(null);
  }

  if (!body || typeof body !== "object" || !body.method) {
    return err(body?.id ?? null, -32600, "Invalid request: missing method");
  }

  if (body.method === "tools/list") {
    return Response.json({ jsonrpc: "2.0", id: body.id, result: { tools: TOOLS } });
  }

  if (body.method === "tools/call") {
    if (!body.params || typeof body.params.name !== "string") {
      return paramErr(body.id, "Missing tool name in params");
    }

    const { name, arguments: args } = body.params;

    try {
      const address = getAddressFromRequest(request);
      if (!address) {
        return err(body.id, -32000, "Authentication required: provide a valid JWT in Authorization: Bearer <token>");
      }

      if (name === "create_agent") {
        if (!args?.name || typeof args.name !== "string") return paramErr(body.id, "Missing required parameter: name");
        if (!Array.isArray(args.services) || args.services.length === 0) return paramErr(body.id, "Missing required parameter: services (array)");
        const invalid = args.services.filter((s: string) => !ALL_SERVICES.includes(s));
        if (invalid.length > 0) return paramErr(body.id, `Invalid services: ${invalid.join(", ")}`);
        const agent = createAgent(args.name, address, args.services);
        const price = getActivationPrice(args.services.length);
        return ok(body.id, JSON.stringify({
          id: agent.id,
          name: agent.name,
          address: agent.address,
          services: agent.services,
          activationPrice: `$${price} for 30 min`,
          message: "Agent created. Call activate_agent to buy time.",
        }, null, 2));
      }

      if (name === "list_agents") {
        const agents = getAgentsByOwner(address);
        const result = agents.map((a) => ({
          id: a.id,
          name: a.name,
          isActive: isAgentActive(a),
          services: a.services,
          remainingMs: getRemainingMs(a),
          totalSpent: a.totalSpent,
        }));
        return ok(body.id, JSON.stringify({ agents: result }, null, 2));
      }

      if (name === "activate_agent") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        if (agent.services.length === 0) return err(body.id, -32003, "Agent has no services configured");
        const price = getActivationPrice(agent.services.length);
        const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        const updated = activateAgent(args.agentId, txHash);
        if (!updated) return toolErr(body.id, "Activation failed");
        return ok(body.id, JSON.stringify({
          activated: true,
          services: updated.services,
          price: `$${price}`,
          txHash,
          expiresAt: updated.expiresAt,
          duration: "30 minutes",
        }, null, 2));
      }

      if (name === "check_status") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        const active = isAgentActive(agent);
        const remainingMs = getRemainingMs(agent);
        return ok(body.id, JSON.stringify({
          agent: agent.name,
          isActive: active,
          services: agent.services,
          remainingMs,
          remainingFormatted: active ? `${Math.floor(remainingMs / 60000)}m ${Math.floor((remainingMs % 60000) / 1000)}s` : "Expired",
          expiresAt: agent.expiresAt,
        }, null, 2));
      }

      if (name === "run_service") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        if (!args?.service) return paramErr(body.id, "Missing required parameter: service");
        if (!args?.input) return paramErr(body.id, "Missing required parameter: input");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        if (!isAgentActive(agent)) return err(body.id, -32003, `Agent expired. ${Math.floor(getRemainingMs(agent) / 60000)}m remaining. Call activate_agent to renew.`);
        if (!agent.services.includes(args.service)) return err(body.id, -32004, `Service "${args.service}" not enabled. Enabled: ${agent.services.join(", ")}`);

        let aiResult: string;
        switch (args.service) {
          case "summarize": aiResult = await aiSummarize(args.input); break;
          case "translate": aiResult = await aiTranslate(args.input, args.targetLang || "Spanish"); break;
          case "code-review": aiResult = await aiCodeReview(args.input); break;
          case "generate": aiResult = await aiGenerate(args.input, "response"); break;
          case "explain": aiResult = await aiExplain(args.input); break;
          case "classify": aiResult = await aiClassify(args.input); break;
          default: return err(body.id, -32004, `Unknown service: ${args.service}`);
        }

        return ok(body.id, JSON.stringify({
          service: args.service,
          result: aiResult,
          agent: agent.name,
          remainingMs: getRemainingMs(agent),
        }, null, 2));
      }

      if (name === "get_receipts") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        const records = getSpendRecords(args.agentId);
        return ok(body.id, JSON.stringify({ agent: agent.name, activations: records }, null, 2));
      }

      return err(body.id, -32601, `Unknown tool: ${name}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Internal error";
      return toolErr(body.id, message);
    }
  }

  return err(body.id, -32601, `Method not found: ${body.method}`);
}
