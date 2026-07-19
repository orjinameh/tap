"use client";

import { useState, useEffect, useCallback } from "react";
import WalletButton from "@/components/WalletButton";

const CATEGORIES = ["summarize", "translate", "code-review", "generate", "explain", "classify"];

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  walletAddress: string;
  creatorAddress: string;
  createdAt: string;
  stats: {
    totalCalls: number;
    todayCalls: number;
    totalEarnings: number;
    todayEarnings: number;
    uniqueCallers: number;
  };
  recentCalls?: Array<{
    id: string;
    callerAddress: string;
    input: string;
    amount: number;
    txHash: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("summarize");
  const [address, setAddress] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    try {
      const token = localStorage.getItem("tap_token");
      const res = await fetch("/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
      }
    } catch {}
  }, []);

  const selectService = useCallback(async (svc: Service) => {
    const token = localStorage.getItem("tap_token");
    const res = await fetch(`/api/services/${svc.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setSelectedService(data);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("tap_address");
    if (saved) {
      setAddress(saved);
      loadServices();
    }
  }, [loadServices]);

  const createService = async () => {
    if (!newName || !newDesc) return;
    const token = localStorage.getItem("tap_token");
    const res = await fetch("/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newName, description: newDesc, category: newCategory }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewName("");
      setNewDesc("");
      loadServices();
    }
  };

  const totalEarnings = services.reduce((sum, s) => sum + (s.stats?.totalEarnings || 0), 0);
  const totalCalls = services.reduce((sum, s) => sum + (s.stats?.totalCalls || 0), 0);

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
            <p className="text-zinc-500 text-lg">Connect your wallet to manage services</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Services</p>
                <p className="text-3xl font-bold text-white">{services.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Calls</p>
                <p className="text-3xl font-bold text-white">{totalCalls}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Earnings</p>
                <p className="text-3xl font-bold text-emerald-400">${totalEarnings.toFixed(4)}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Callers</p>
                <p className="text-3xl font-bold text-white">
                  {new Set(services.flatMap((s) => {
                    const calls = (s as any).recentCalls || [];
                    return calls.map((c: any) => c.callerAddress);
                  })).size}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Services</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Create Service
              </button>
            </div>

            {showCreate && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-white mb-4">Create AI Service</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Service Name</label>
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g., Doc Summarizer"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Description</label>
                      <input
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="What this service does"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewCategory(c)}
                            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                              newCategory === c
                                ? "border-violet-500 bg-violet-500/10 text-violet-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-600 mt-2">Price: $0.01 per call (x402 protected)</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCreate(false)}
                        className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createService}
                        disabled={!newName || !newDesc}
                        className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {services.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-zinc-500 mb-4">No services yet. Create one to start earning.</p>
                <p className="text-xs text-zinc-600">Your service gets an x402-protected endpoint. Other agents pay to use it.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => selectService(svc)}
                    className={`bg-zinc-900 border rounded-xl p-5 text-left transition-colors ${
                      selectedService?.id === svc.id
                        ? "border-violet-500"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{svc.name}</h3>
                      <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 rounded-full">
                        ${svc.price}/call
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{svc.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">{svc.category}</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-400 rounded">x402</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-600">
                      <span>{svc.stats?.totalCalls || 0} calls</span>
                      <span>${(svc.stats?.totalEarnings || 0).toFixed(4)} earned</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedService && (
              <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedService.name}</h3>
                    <p className="text-xs text-zinc-500">{selectedService.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Endpoint</p>
                    <p className="text-xs text-zinc-400 font-mono">POST /api/services/{selectedService.id}/run</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Total Calls</p>
                    <p className="text-lg font-bold text-white">{selectedService.stats.totalCalls}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Today</p>
                    <p className="text-lg font-bold text-white">{selectedService.stats.todayCalls}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Earnings</p>
                    <p className="text-lg font-bold text-emerald-400">${selectedService.stats.totalEarnings.toFixed(4)}</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <p className="text-xs text-zinc-500">Unique Callers</p>
                    <p className="text-lg font-bold text-white">{selectedService.stats.uniqueCallers}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Recent Calls</h4>
                  {!selectedService.recentCalls || selectedService.recentCalls.length === 0 ? (
                    <p className="text-sm text-zinc-600">No calls yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedService.recentCalls.map((call) => (
                        <div key={call.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-xs text-zinc-400 font-mono truncate">{call.input.slice(0, 50)}</span>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-xs text-emerald-400">${call.amount}</span>
                            <p className="text-[10px] text-zinc-600">{new Date(call.timestamp).toLocaleTimeString()}</p>
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
