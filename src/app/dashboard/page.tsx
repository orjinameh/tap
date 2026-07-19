"use client";

import { useState, useEffect, useCallback } from "react";
import WalletButton from "@/components/WalletButton";

const SERVICES = ["summarize", "translate", "code-review", "generate", "explain", "classify"];

interface Agent {
  id: string;
  name: string;
  address: string;
  services: string[];
  isActive: boolean;
  activatedAt: string | null;
  expiresAt: string | null;
  remainingMs: number;
  totalSpent: number;
  createdAt: string;
  stats?: { totalSpent: number; totalTransactions: number };
}

function formatMs(ms: number): string {
  if (ms <= 0) return "Expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

function getPrice(serviceCount: number): number {
  return Math.round(0.05 * serviceCount * 100) / 100;
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newServices, setNewServices] = useState<string[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const loadAgents = useCallback(async () => {
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
  }, []);

  const selectAgent = useCallback(async (agent: Agent) => {
    const token = localStorage.getItem("tap_token");
    const res = await fetch(`/api/agents/${agent.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSelectedAgent(data);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("tap_address");
    if (saved) {
      setAddress(saved);
      loadAgents();
    }
  }, [loadAgents]);

  useEffect(() => {
    if (!selectedAgent) return;
    const interval = setInterval(() => {
      setSelectedAgent((prev) => {
        if (!prev || !prev.expiresAt) return prev;
        const remainingMs = Math.max(0, new Date(prev.expiresAt).getTime() - Date.now());
        return { ...prev, remainingMs, isActive: remainingMs > 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedAgent?.id]);

  const createAgent = async () => {
    if (!newName || newServices.length === 0) return;
    const token = localStorage.getItem("tap_token");
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName, services: newServices }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewName("");
      setNewServices([]);
      loadAgents();
    }
  };

  const activateAgent = async (agentId: string) => {
    setActivating(true);
    try {
      const token = localStorage.getItem("tap_token");
      const res = await fetch(`/api/agents/${agentId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        loadAgents();
        selectAgent(selectedAgent!);
      } else {
        alert(`Activation failed: ${data.error}`);
      }
    } finally {
      setActivating(false);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Agents</p>
                <p className="text-3xl font-bold text-white">{agents.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Active</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {agents.filter((a) => a.isActive).length}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-white">
                  ${agents.reduce((sum, a) => sum + a.totalSpent, 0).toFixed(2)}
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
                  <h3 className="text-lg font-semibold text-white mb-4">Create Agent</h3>
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
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Services</label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                              newServices.includes(s)
                                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      {newServices.length > 0 && (
                        <p className="text-xs text-zinc-500 mt-2">
                          Activation: ${getPrice(newServices.length)} for 30 min unlimited access
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowCreate(false); setNewName(""); setNewServices([]); }}
                        className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createAgent}
                        disabled={!newName || newServices.length === 0}
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
                            : "bg-zinc-700 text-zinc-500"
                        }`}
                      >
                        {agent.isActive ? "active" : "inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mb-3">
                      {agent.address.slice(0, 10)}...{agent.address.slice(-6)}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.services.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-600">${agent.totalSpent.toFixed(2)} spent</span>
                      {agent.isActive && (
                        <span className="text-xs text-emerald-400 font-mono">{formatMs(agent.remainingMs)}</span>
                      )}
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
                  {selectedAgent.isActive ? (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 mb-1">Time remaining</p>
                      <p className="text-2xl font-bold text-emerald-400 font-mono">{formatMs(selectedAgent.remainingMs)}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => activateAgent(selectedAgent.id)}
                      disabled={activating || selectedAgent.services.length === 0}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {activating ? "Activating..." : `Buy Time — $${getPrice(selectedAgent.services.length)}`}
                    </button>
                  )}
                </div>

                {/* Services */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.services.map((s) => (
                      <span key={s} className={`px-3 py-1 text-xs rounded-full ${
                        selectedAgent.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                      }`}>
                        {selectedAgent.isActive && "● "}{s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activation History */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Purchase History</h4>
                  <p className="text-xs text-zinc-600">
                    Total spent: ${selectedAgent.totalSpent.toFixed(2)} ·
                    Activated: {selectedAgent.activatedAt ? new Date(selectedAgent.activatedAt).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
