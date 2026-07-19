"use client";

import { useState, useEffect } from "react";
import WalletButton from "@/components/WalletButton";

const SERVICES = ["summarize", "translate", "code-review", "generate", "explain", "classify"];

interface Agent {
  id: string;
  name: string;
  address: string;
  policy: {
    maxPerTransaction: number;
    maxPerDay: number;
    maxPerWeek: number;
    allowedServices: string[];
    blockedServices: string[];
  };
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  lastActive: string;
  stats?: {
    totalSpent: number;
    todaySpent: number;
    weekSpent: number;
    totalTransactions: number;
    todayTransactions: number;
    blockedAttempts: number;
  };
}

interface Receipt {
  id: string;
  service: string;
  amount: number;
  txHash: string;
  timestamp: string;
  policyCheck: { passed: boolean; reason?: string };
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPolicy, setNewPolicy] = useState({
    maxPerTransaction: 0.10,
    maxPerDay: 1.00,
    maxPerWeek: 5.00,
  });
  const [newAllowedServices, setNewAllowedServices] = useState<string[]>([]);
  const [newBlockedServices, setNewBlockedServices] = useState<string[]>([]);
  const [testService, setTestService] = useState("summarize");
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tap_address");
    if (saved) {
      setAddress(saved);
      loadAgents();
    }
  }, []);

  const loadAgents = async () => {
    try {
      const token = localStorage.getItem("tap_token");
      const res = await fetch("/api/agents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents);
      }
    } catch {}
  };

  const createAgent = async () => {
    const token = localStorage.getItem("tap_token");
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: newName,
        policy: {
          ...newPolicy,
          allowedServices: newAllowedServices,
          blockedServices: newBlockedServices,
        },
      }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewName("");
      setNewAllowedServices([]);
      setNewBlockedServices([]);
      loadAgents();
    }
  };

  const selectAgent = async (agent: Agent) => {
    const token = localStorage.getItem("tap_token");
    const [agentRes, receiptsRes] = await Promise.all([
      fetch(`/api/agents/${agent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`/api/agents/${agent.id}/receipts`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    if (agentRes.ok) {
      const data = await agentRes.json();
      setSelectedAgent(data);
    }
    if (receiptsRes.ok) {
      const data = await receiptsRes.json();
      setReceipts(data.receipts);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AV</span>
              </div>
              <span className="text-xl font-bold text-white">AgentVault</span>
            </a>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!address ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">Connect your wallet to manage agent spending</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Agents</p>
                <p className="text-3xl font-bold text-white">{agents.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-white">
                  ${agents.reduce((sum, a) => sum + a.totalSpent, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Active</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {agents.filter((a) => a.isActive).length}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Blocked</p>
                <p className="text-3xl font-bold text-red-400">
                  {agents.reduce((sum, a) => sum + (a.stats?.blockedAttempts || 0), 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Agents</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Create Agent
              </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Create Agent Wallet</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Agent Name</label>
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g., Research Bot"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Max/Tx</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newPolicy.maxPerTransaction}
                          onChange={(e) => setNewPolicy({ ...newPolicy, maxPerTransaction: +e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Max/Day</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newPolicy.maxPerDay}
                          onChange={(e) => setNewPolicy({ ...newPolicy, maxPerDay: +e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Max/Week</label>
                        <input
                          type="number"
                          step="0.5"
                          value={newPolicy.maxPerWeek}
                          onChange={(e) => setNewPolicy({ ...newPolicy, maxPerWeek: +e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Allowed Services</label>
                      <p className="text-xs text-zinc-600 mb-2">Leave empty to allow all services</p>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewAllowedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                              newAllowedServices.includes(s)
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Blocked Services</label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewBlockedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                              newBlockedServices.includes(s)
                                ? "border-red-500 bg-red-500/10 text-red-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCreate(false)}
                        className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createAgent}
                        disabled={!newName}
                        className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Agent List */}
            {agents.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-zinc-500 mb-4">No agents yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent)}
                    className={`bg-zinc-900 border rounded-xl p-5 text-left transition-colors ${
                      selectedAgent?.id === agent.id
                        ? "border-violet-500"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          agent.isActive
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {agent.isActive ? "active" : "inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mb-3">
                      {agent.address.slice(0, 10)}...{agent.address.slice(-6)}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-zinc-600">Spent</p>
                        <p className="text-sm font-medium text-white">${agent.totalSpent.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600">Day Limit</p>
                        <p className="text-sm font-medium text-white">${agent.policy.maxPerDay}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600">Tx Limit</p>
                        <p className="text-sm font-medium text-white">${agent.policy.maxPerTransaction}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Agent Detail */}
            {selectedAgent && (
              <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedAgent.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{selectedAgent.address}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={testService}
                      onChange={(e) => setTestService(e.target.value)}
                      className="px-2 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-lg"
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem("tap_token");
                        const res = await fetch(`/api/agents/${selectedAgent!.id}/pay`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ service: testService, input: "Test payment" }),
                        });
                        const data = await res.json();
                        alert(res.ok ? `Payment sent! TX: ${data.txHash?.slice(0, 18)}...` : `Failed: ${data.error}`);
                        if (res.ok) loadAgents();
                      }}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg transition-colors"
                    >
                      Test Payment
                    </button>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Service Access</h4>
                  <div className="space-y-2">
                    {selectedAgent.policy.allowedServices.length > 0 ? (
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Allowed</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedAgent.policy.allowedServices.map((s) => (
                            <span key={s} className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600">All services allowed</p>
                    )}
                    {selectedAgent.policy.blockedServices.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Blocked</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedAgent.policy.blockedServices.map((s) => (
                            <span key={s} className="px-2 py-0.5 text-xs bg-red-500/10 text-red-400 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Policy */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Spending Policy</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Per Transaction</p>
                      <p className="text-lg font-bold text-white">${selectedAgent.policy.maxPerTransaction}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Per Day</p>
                      <p className="text-lg font-bold text-white">${selectedAgent.policy.maxPerDay}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Per Week</p>
                      <p className="text-lg font-bold text-white">${selectedAgent.policy.maxPerWeek}</p>
                    </div>
                  </div>
                </div>

                {/* Receipts */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Recent Transactions</h4>
                  {receipts.length === 0 ? (
                    <p className="text-sm text-zinc-600">No transactions yet</p>
                  ) : (
                    <div className="space-y-2">
                      {receipts.slice(-5).reverse().map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                r.policyCheck.passed ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm text-white font-mono">{r.service}</span>
                            <span className="text-xs text-zinc-500">{r.txHash.slice(0, 10)}...</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-emerald-400">${r.amount}</span>
                            <p className="text-xs text-zinc-600">
                              {new Date(r.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
