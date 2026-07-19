import { ethers } from "ethers";

export interface SpendingPolicy {
  maxPerTransaction: number;  // USDC
  maxPerDay: number;          // USDC
  maxPerWeek: number;         // USDC
  allowedServices: string[];  // empty = all allowed
  blockedServices: string[];  // blocked services
}

export interface AgentWallet {
  id: string;
  name: string;
  address: string;
  privateKey: string;
  ownerAddress: string;
  policy: SpendingPolicy;
  totalSpent: number;
  createdAt: string;
  lastActive: string;
  isActive: boolean;
}

export interface SpendRecord {
  id: string;
  agentId: string;
  service: string;
  amount: number;
  txHash: string;
  timestamp: string;
  policyCheck: { passed: boolean; reason?: string };
}

// In-memory store (swap for MongoDB in production)
const agents = new Map<string, AgentWallet>();
const spends = new Map<string, SpendRecord[]>();

function generateId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createAgent(
  name: string,
  ownerAddress: string,
  policy: SpendingPolicy
): AgentWallet {
  const wallet = ethers.Wallet.createRandom();
  const id = generateId();

  const agent: AgentWallet = {
    id,
    name,
    address: wallet.address,
    privateKey: wallet.privateKey,
    ownerAddress: ownerAddress.toLowerCase(),
    policy,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    isActive: true,
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

export function updateAgentPolicy(id: string, policy: SpendingPolicy): boolean {
  const agent = agents.get(id);
  if (!agent) return false;
  agent.policy = policy;
  agents.set(id, agent);
  return true;
}

export function deactivateAgent(id: string): boolean {
  const agent = agents.get(id);
  if (!agent) return false;
  agent.isActive = false;
  agents.set(id, agent);
  return true;
}

export function getSpendRecords(agentId: string): SpendRecord[] {
  return spends.get(agentId) || [];
}

export function checkSpendingPolicy(
  agent: AgentWallet,
  service: string,
  amount: number
): { allowed: boolean; reason?: string } {
  if (!agent.isActive) {
    return { allowed: false, reason: "Agent is deactivated" };
  }

  if (amount > agent.policy.maxPerTransaction) {
    return {
      allowed: false,
      reason: `Amount $${amount} exceeds per-transaction limit of $${agent.policy.maxPerTransaction}`,
    };
  }

  // Check daily spend
  const todaySpends = getSpendRecords(agent.id).filter(
    (s) => s.timestamp.slice(0, 10) === todayKey()
  );
  const todayTotal = todaySpends.reduce((sum, s) => sum + s.amount, 0);
  if (todayTotal + amount > agent.policy.maxPerDay) {
    return {
      allowed: false,
      reason: `Daily spend ($${(todayTotal + amount).toFixed(2)}) would exceed limit of $${agent.policy.maxPerDay}`,
    };
  }

  // Check weekly spend
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekSpends = getSpendRecords(agent.id).filter(
    (s) => s.timestamp >= weekAgo
  );
  const weekTotal = weekSpends.reduce((sum, s) => sum + s.amount, 0);
  if (weekTotal + amount > agent.policy.maxPerWeek) {
    return {
      allowed: false,
      reason: `Weekly spend ($${(weekTotal + amount).toFixed(2)}) would exceed limit of $${agent.policy.maxPerWeek}`,
    };
  }

  // Check service allowlist
  if (agent.policy.allowedServices.length > 0 && !agent.policy.allowedServices.includes(service)) {
    return {
      allowed: false,
      reason: `Service "${service}" is not in the allowed services list`,
    };
  }

  // Check service blocklist
  if (agent.policy.blockedServices.includes(service)) {
    return {
      allowed: false,
      reason: `Service "${service}" is blocked`,
    };
  }

  return { allowed: true };
}

export function recordSpend(
  agentId: string,
  service: string,
  amount: number,
  txHash: string,
  policyCheck: { passed: boolean; reason?: string }
): SpendRecord {
  const record: SpendRecord = {
    id: `spend_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    agentId,
    service,
    amount,
    txHash,
    timestamp: new Date().toISOString(),
    policyCheck,
  };

  const records = spends.get(agentId) || [];
  records.push(record);
  spends.set(agentId, records);

  const agent = agents.get(agentId);
  if (agent) {
    agent.totalSpent += amount;
    agent.lastActive = new Date().toISOString();
    agents.set(agentId, agent);
  }

  return record;
}

export function getAgentStats(agentId: string) {
  const records = getSpendRecords(agentId);
  const todaySpends = records.filter((s) => s.timestamp.slice(0, 10) === todayKey());
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekSpends = records.filter((s) => s.timestamp >= weekAgo);

  return {
    totalSpent: records.reduce((sum, s) => sum + s.amount, 0),
    todaySpent: todaySpends.reduce((sum, s) => sum + s.amount, 0),
    weekSpent: weekSpends.reduce((sum, s) => sum + s.amount, 0),
    totalTransactions: records.length,
    todayTransactions: todaySpends.length,
    blockedAttempts: records.filter((s) => !s.policyCheck.passed).length,
  };
}
