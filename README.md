# AgentVault — Agent Payment Infrastructure for x402

> **Give your agents spending power. Set policies. Let them pay autonomously — within limits you control.**

Built for Brainwave 2026 — Track 2: Agentic Commerce & Payment Infrastructure.

## What is AgentVault?

AgentVault is infrastructure that enables AI agents to participate in the x402 economy. Developers create agent wallets, set spending policies (per-transaction, daily, weekly limits), and agents autonomously pay for x402 services within those limits.

## The Problem

- AI agents need to transact on the web but have no way to hold or spend money
- Giving agents full wallet access is dangerous — they could drain funds
- No way to track what agents are spending or enforce budgets

## The Solution

1. **Create Agent Wallets** — each agent gets its own address
2. **Set Spending Policies** — max per tx, per day, per week, allowlist/blocklist services
3. **Agents Pay Autonomously** — policy engine validates every payment
4. **Track Everything** — dashboard shows all receipts and policy violations

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/agents` | GET | List your agents |
| `/api/agents` | POST | Create a new agent |
| `/api/agents/:id` | GET | Get agent details + stats |
| `/api/agents/:id` | PATCH | Update agent policy |
| `/api/agents/:id` | DELETE | Deactivate agent |
| `/api/agents/:id/fund` | POST | Fund agent wallet |
| `/api/agents/:id/pay` | POST | Agent makes x402 payment |
| `/api/agents/:id/receipts` | GET | Get spending receipts |
| `/mcp/sse` | GET | MCP SSE endpoint |

## Tech Stack

- **Next.js 16** (App Router)
- **@x402/next** (official x402 middleware)
- **ethers.js v6** (wallet creation)
- **Base Sepolia** (testnet)
- **MetaMask** (wallet auth)

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
```

## Environment Variables

```env
PAYMENT_RECIPIENT_ADDRESS=0x...
NEXT_PUBLIC_FACILITATOR_URL=https://facilitator.x402.org
GEMINI_API_KEY=...
JWT_SECRET=...
```

## How the Policy Engine Works

Every payment goes through the policy engine:

1. Check if agent is active
2. Check per-transaction limit
3. Check daily spend total
4. Check weekly spend total
5. Check service allowlist (if set)
6. Check service blocklist
7. Only if ALL checks pass → payment proceeds

Violations are logged and visible in the dashboard.

## License

MIT
