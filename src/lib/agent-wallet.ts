import { ethers } from "ethers";

export const ALL_SERVICES = ["summarize", "translate", "code-review", "generate", "explain", "classify"];

const BASE_RATE = 0.01; // $0.01 per service for 30 min
const DURATION_MS = 30 * 60 * 1000; // 30 minutes

export interface AgentWallet {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  ownerAddress: string;
  services: string[];
  activatedAt: string | null;
  expiresAt: string | null;
  totalSpent: number;
  createdAt: string;
}

export interface SpendRecord {
  id: string;
  agentId: string;
  service: string;
  txHash: string;
  timestamp: string;
}

const agents = new Map<string, AgentWallet>();
const spends = new Map<string, SpendRecord[]>();

function generateId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getActivationPrice(serviceCount: number): number {
  return Math.round(BASE_RATE * serviceCount * 100) / 100;
}

export function createAgent(
  name: string,
  ownerAddress: string,
  services: string[]
): AgentWallet {
  const wallet = ethers.Wallet.createRandom();
  const id = generateId();

  const agent: AgentWallet = {
    id,
    name,
    address: wallet.address,
    privateKey: wallet.privateKey,
    ownerAddress: ownerAddress.toLowerCase(),
    services,
    activatedAt: null,
    expiresAt: null,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };

  agents.set(id, agent);
  spends.set(id, []);
  return agent;
}

export function getAgent(id: string): AgentWallet | null {
  return agents.get(id) || null;
}

export function getAgentsByOwner(ownerAddress: string): AgentWallet[] {
  return Array.from(agents.values()).filter(
    (a) => a.ownerAddress === ownerAddress.toLowerCase()
  );
}

export function isAgentActive(agent: AgentWallet): boolean {
  if (!agent.expiresAt) return false;
  return Date.now() < new Date(agent.expiresAt).getTime();
}

export function getRemainingMs(agent: AgentWallet): number {
  if (!agent.expiresAt) return 0;
  return Math.max(0, new Date(agent.expiresAt).getTime() - Date.now());
}

export function activateAgent(agentId: string, txHash: string): AgentWallet | null {
  const agent = agents.get(agentId);
  if (!agent) return null;

  const now = new Date();
  const prevExpiry = agent.expiresAt ? new Date(agent.expiresAt).getTime() : 0;
  const startFrom = Math.max(now.getTime(), prevExpiry);

  agent.activatedAt = now.toISOString();
  agent.expiresAt = new Date(startFrom + DURATION_MS).toISOString();
  agent.totalSpent += getActivationPrice(agent.services.length);
  agents.set(agentId, agent);

  const record: SpendRecord = {
    id: `spend_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    agentId,
    service: "activation",
    txHash,
    timestamp: now.toISOString(),
  };
  const records = spends.get(agentId) || [];
  records.push(record);
  spends.set(agentId, records);

  return agent;
}

export function getSpendRecords(agentId: string): SpendRecord[] {
  return spends.get(agentId) || [];
}

export function getAgentStats(agentId: string) {
  const records = getSpendRecords(agentId);
  return {
    totalSpent: records.reduce((sum, s) => sum + 0, 0),
    totalTransactions: records.length,
  };
}
