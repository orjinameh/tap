import { NextRequest } from "next/server";
import {
  createAgent,
  getAgentsByOwner,
  getAgent,
  getAgentStats,
  checkSpendingPolicy,
  getSpendRecords,
  recordSpend,
  SpendingPolicy,
} from "@/lib/agent-wallet";
import { getAddressFromRequest } from "@/lib/auth";

const TOOLS = [
  {
    name: "create_agent",
    description: "Create a new AI agent wallet with spending policies. Returns agent ID, address, and policy.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Agent name" },
        maxPerTransaction: { type: "number", description: "Max USDC per transaction (default 0.10)" },
        maxPerDay: { type: "number", description: "Max USDC per day (default 1.00)" },
        maxPerWeek: { type: "number", description: "Max USDC per week (default 5.00)" },
        allowedServices: { type: "array", items: { type: "string" }, description: "Whitelist of services (empty = all allowed)" },
        blockedServices: { type: "array", items: { type: "string" }, description: "Blacklist of services" },
      },
      required: ["name"],
    },
  },
  {
    name: "list_agents",
    description: "List all your agent wallets with their policies, spending stats, and status",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_agent_stats",
    description: "Get detailed spending stats for an agent: today/week/total spend, transaction count, blocked attempts",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
      },
      required: ["agentId"],
    },
  },
  {
    name: "check_policy",
    description: "Check if an agent is allowed to make a specific payment. Returns allowed/denied with reason.",
    inputSchema: {
      type: "object",
      properties: {
        agentId: { type: "string", description: "Agent ID" },
        service: { type: "string", description: "Service name (e.g. summarize, translate, code-review)" },
        amount: { type: "number", description: "Amount in USDC" },
      },
      required: ["agentId", "service", "amount"],
    },
  },
  {
    name: "agent_pay",
    description: "Execute a payment from an agent to a service. Checks policy, records spend, returns tx hash.",
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
    description: "Get spending receipts for an agent. Returns all transactions with amounts, services, tx hashes, and policy check results.",
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

      if (name === "list_agents") {
        const agents = getAgentsByOwner(address);
        const result = agents.map((a) => ({
          id: a.id,
          name: a.name,
          address: a.address,
          isActive: a.isActive,
          policy: a.policy,
          totalSpent: a.totalSpent,
          stats: getAgentStats(a.id),
        }));
        return ok(body.id, JSON.stringify({ agents: result }, null, 2));
      }

      if (name === "create_agent") {
        if (!args?.name || typeof args.name !== "string") {
          return paramErr(body.id, "Missing required parameter: name (string)");
        }
        const policy: SpendingPolicy = {
          maxPerTransaction: args.maxPerTransaction ?? 0.10,
          maxPerDay: args.maxPerDay ?? 1.00,
          maxPerWeek: args.maxPerWeek ?? 5.00,
          allowedServices: Array.isArray(args.allowedServices) ? args.allowedServices : [],
          blockedServices: Array.isArray(args.blockedServices) ? args.blockedServices : [],
        };
        const agent = createAgent(args.name, address, policy);
        return ok(body.id, JSON.stringify({
          id: agent.id,
          name: agent.name,
          address: agent.address,
          policy: agent.policy,
          message: "Agent created. Fund with USDC on Base Sepolia to start spending.",
        }, null, 2));
      }

      if (name === "get_agent_stats") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        const stats = getAgentStats(args.agentId);
        return ok(body.id, JSON.stringify({ agent: agent.name, ...stats }, null, 2));
      }

      if (name === "check_policy") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        if (!args?.service) return paramErr(body.id, "Missing required parameter: service");
        if (args?.amount === undefined || args?.amount === null) return paramErr(body.id, "Missing required parameter: amount");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        const result = checkSpendingPolicy(agent, args.service, args.amount);
        return ok(body.id, JSON.stringify({
          agent: agent.name,
          service: args.service,
          amount: args.amount,
          allowed: result.allowed,
          reason: result.reason || null,
        }, null, 2));
      }

      if (name === "agent_pay") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        if (!args?.service) return paramErr(body.id, "Missing required parameter: service");
        if (args?.amount === undefined || args?.amount === null) return paramErr(body.id, "Missing required parameter: amount");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);

        const policyCheck = checkSpendingPolicy(agent, args.service, args.amount);
        if (!policyCheck.allowed) {
          recordSpend(agent.id, args.service, args.amount, "blocked", { passed: false, reason: policyCheck.reason });
          return err(body.id, -32003, `Policy violation: ${policyCheck.reason}`);
        }

        const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        const record = recordSpend(agent.id, args.service, args.amount, txHash, { passed: true });
        return ok(body.id, JSON.stringify({
          agent: agent.name,
          service: args.service,
          amount: args.amount,
          txHash,
          spendId: record.id,
          timestamp: record.timestamp,
          policyCheck: { passed: true },
        }, null, 2));
      }

      if (name === "get_receipts") {
        if (!args?.agentId) return paramErr(body.id, "Missing required parameter: agentId");
        const agent = getAgent(args.agentId);
        if (!agent) return err(body.id, -32002, `Agent not found: ${args.agentId}`);
        if (agent.ownerAddress !== address.toLowerCase()) return ownershipErr(body.id);
        const records = getSpendRecords(args.agentId);
        return ok(body.id, JSON.stringify({ agent: agent.name, count: records.length, receipts: records }, null, 2));
      }

      return err(body.id, -32601, `Unknown tool: ${name}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Internal error";
      return toolErr(body.id, message);
    }
  }

  return err(body.id, -32601, `Method not found: ${body.method}`);
}
