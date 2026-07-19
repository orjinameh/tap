#!/usr/bin/env node

import { ethers } from "ethers";
import { wrapFetchWithPayment, x402Client, x402HTTPClient } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { toClientEvmSigner } from "@x402/evm";

const BASE_URL = process.env.AGENTVAULT_URL || "http://localhost:3000";
const PRIVATE_KEY = process.env.BUYER_PRIVATE_KEY;

async function main() {
  if (!PRIVATE_KEY) {
    console.error("Set BUYER_PRIVATE_KEY env var (a wallet with USDC on Base Sepolia)");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  console.log(`\n🤖 Buyer agent: ${wallet.address}`);

  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const signer = wallet.connect(provider);

  const usdcAddress = "0x036CbD53842c5426634c4923a9dFCA9f03Cc8540";
  const usdcAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
  const balance = await usdc.balanceOf(wallet.address);
  const decimals = await usdc.decimals();
  console.log(`💰 USDC balance: ${ethers.formatUnits(balance, decimals)}`);

  if (balance === BigInt(0)) {
    console.error("❌ No USDC. Fund this address on Base Sepolia first.");
    process.exit(1);
  }

  // Set up x402 payment client
  const evmScheme = new ExactEvmScheme(toClientEvmSigner(signer as any), { rpcUrl: "https://sepolia.base.org" });
  const client = new x402Client().register("eip155:84532", evmScheme);
  const httpClient = new x402HTTPClient(client);
  const fetchWithPay = wrapFetchWithPayment(fetch, httpClient);

  // Step 1: Discover services via MCP
  console.log("\n📡 Discovering services via MCP...");

  // Initialize MCP session
  const sseRes = await fetch(`${BASE_URL}/mcp/sse`);
  const reader = sseRes.body?.getReader();
  const decoder = new TextDecoder();

  let mcpEndpoint = "";
  if (reader) {
    const { value, done } = await reader.read();
    const text = decoder.decode(value);
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        mcpEndpoint = line.slice(6).trim();
      }
    }
    reader.cancel();
  }

  console.log(`   MCP endpoint: ${mcpEndpoint}`);

  // Step 2: Call discover_services tool
  const toolsRes = await fetch(`${BASE_URL}${mcpEndpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "discover_services", arguments: {} },
    }),
  });
  const toolsData = await toolsRes.json();
  const discovered = JSON.parse(toolsData.result?.content?.[0]?.text || "{}");

  if (!discovered.services || discovered.services.length === 0) {
    console.log("📭 No services available. Create one on the dashboard first.");
    process.exit(0);
  }

  console.log(`\n🔍 Found ${discovered.services.length} service(s):`);
  for (const svc of discovered.services) {
    console.log(`   ${svc.name} (${svc.category}) — $${svc.price}/call — ${svc.endpoint}`);
  }

  // Step 3: Pick first service and call it with x402 payment
  const target = discovered.services[0];
  console.log(`\n💸 Calling: ${target.name} via x402...`);

  const inputText = "AgentVault is a platform that lets AI developers create x402-protected AI services. Other agents discover and pay for them.";
  const runUrl = `${BASE_URL}${target.endpoint}`;

  console.log(`   Input: "${inputText.slice(0, 60)}..."`);

  const runRes = await fetchWithPay(runUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: inputText }),
  });

  if (!runRes.ok) {
    const errText = await runRes.text();
    console.error(`\n❌ Request failed: ${runRes.status} ${errText}`);
    process.exit(1);
  }

  const result = await runRes.json();
  console.log(`\n✅ Service call succeeded!`);
  console.log(`   Service: ${result.service}`);
  console.log(`   Amount: $${result.amount} USDC`);
  console.log(`   TX Hash: ${result.txHash}`);
  console.log(`   Timestamp: ${result.timestamp}`);
  console.log(`\n📝 Result:\n${result.result.slice(0, 500)}${result.result.length > 500 ? "..." : ""}`);

  // Step 4: Check remaining balance
  const newBalance = await usdc.balanceOf(wallet.address);
  console.log(`\n💰 Remaining USDC: ${ethers.formatUnits(newBalance, decimals)}`);
  console.log(`   Spent: $${ethers.formatUnits(balance - newBalance, decimals)}`);

  console.log("\n🎉 Full x402 flow complete: discover → pay → execute → result");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
