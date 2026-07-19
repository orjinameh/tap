# Tap — x402-Powered AI API Marketplace

> **Pay-per-use AI APIs. No API keys. No subscriptions. Just USDC micropayments via x402.**

Built for Brainwave 2026 — X402 Blockchain Track.

## What is Tap?

Tap is an AI API marketplace where developers and AI agents pay per request using the x402 payment protocol. Every API call settles a USDC micropayment on Base Sepolia, and the caller gets a verifiable on-chain receipt.

## How it works

```
1. Client sends request to /api/ai/summarize
2. x402 middleware intercepts → returns 402 + PaymentRequired
3. Client wallet signs EIP-712 USDC transfer
4. Client retries with X-PAYMENT header
5. Facilitator verifies + settles on-chain
6. Server returns 200 + PAYMENT-RESPONSE receipt
```

## Available APIs

| Endpoint | Price | Description |
|---|---|---|
| `POST /api/ai/summarize` | $0.01 | AI Text Summarization |
| `POST /api/ai/translate` | $0.01 | AI Translation |
| `POST /api/ai/code-review` | $0.05 | AI Code Review |
| `POST /api/ai/generate` | $0.02 | AI Content Generation |
| `POST /api/ai/explain` | $0.01 | AI Code/Text Explanation |
| `POST /api/ai/classify` | $0.005 | AI Text Classification |

## Tech Stack

- **Next.js 16** (App Router)
- **@x402/next** (official x402 middleware)
- **@x402/evm** (EVM chain support)
- **Google Gemini** (AI inference)
- **Base Sepolia** (testnet)
- **MetaMask** (wallet auth)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your keys

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
# x402
PAYMENT_RECIPIENT_ADDRESS=0x...
NEXT_PUBLIC_FACILITATOR_URL=https://facilitator.x402.org

# AI
GEMINI_API_KEY=...

# Auth
JWT_SECRET=...

# Base Sepolia
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634c4923a9dFCA9f03Cc8540
```

## MCP Server

Tap exposes an MCP SSE endpoint at `/mcp/sse` for AI agent discovery:

- `list_apis` — Discover all available APIs and their prices
- `call_api` — Call any API (requires x402 payment)

## License

MIT
