import { ethers } from "ethers";

export const ALL_SERVICES = ["summarize", "translate", "code-review", "generate", "explain", "classify"];

const BASE_RATE = 0.01;

export interface AiService {
  id: string;
  name: string;
  description: string;
  category: string;
  creatorAddress: string;
  walletAddress: string;
  walletPrivateKey: string;
  price: number;
  createdAt: string;
  totalEarnings: number;
  totalCalls: number;
}

export interface ServiceCall {
  id: string;
  serviceId: string;
  callerAddress: string;
  input: string;
  result: string;
  amount: number;
  txHash: string;
  timestamp: string;
}

const services = new Map<string, AiService>();
const calls = new Map<string, ServiceCall[]>();

function generateId(): string {
  return `svc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function calculatePrice(serviceCount: number): number {
  return Math.round(BASE_RATE * serviceCount * 100) / 100;
}

export function createService(
  name: string,
  description: string,
  category: string,
  creatorAddress: string,
): AiService {
  const wallet = ethers.Wallet.createRandom();
  const id = generateId();

  const svc: AiService = {
    id,
    name,
    description,
    category,
    creatorAddress: creatorAddress.toLowerCase(),
    walletAddress: wallet.address,
    walletPrivateKey: wallet.privateKey,
    price: BASE_RATE,
    createdAt: new Date().toISOString(),
    totalEarnings: 0,
    totalCalls: 0,
  };

  services.set(id, svc);
  calls.set(id, []);
  return svc;
}

export function getService(id: string): AiService | null {
  return services.get(id) || null;
}

export function getServicesByCreator(creatorAddress: string): AiService[] {
  return Array.from(services.values()).filter(
    (s) => s.creatorAddress === creatorAddress.toLowerCase()
  );
}

export function getAllServices(): AiService[] {
  return Array.from(services.values());
}

export function getServiceCalls(serviceId: string): ServiceCall[] {
  return calls.get(serviceId) || [];
}

export function recordCall(
  serviceId: string,
  callerAddress: string,
  input: string,
  result: string,
  amount: number,
  txHash: string,
): ServiceCall {
  const record: ServiceCall = {
    id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    serviceId,
    callerAddress,
    input,
    result,
    amount,
    txHash,
    timestamp: new Date().toISOString(),
  };

  const records = calls.get(serviceId) || [];
  records.push(record);
  calls.set(serviceId, records);

  const svc = services.get(serviceId);
  if (svc) {
    svc.totalEarnings += amount;
    svc.totalCalls += 1;
    services.set(serviceId, svc);
  }

  return record;
}

export function getServiceStats(serviceId: string) {
  const records = getServiceCalls(serviceId);
  const today = new Date().toISOString().slice(0, 10);
  const todayCalls = records.filter((r) => r.timestamp.slice(0, 10) === today);

  return {
    totalCalls: records.length,
    todayCalls: todayCalls.length,
    totalEarnings: records.reduce((sum, r) => sum + r.amount, 0),
    todayEarnings: todayCalls.reduce((sum, r) => sum + r.amount, 0),
    uniqueCallers: new Set(records.map((r) => r.callerAddress)).size,
  };
}
