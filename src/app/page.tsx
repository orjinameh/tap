"use client";

import WalletButton from "@/components/WalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AV</span>
            </div>
            <span className="text-xl font-bold text-white">AgentVault</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </a>
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-medium rounded-full mb-6 border border-violet-500/20">
          Agentic Commerce Infrastructure
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Give your agents
          <br />
          <span className="text-violet-400">spending power.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Create wallets for AI agents. Set spending policies. Let them pay for x402 services autonomously — within limits you control.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors"
          >
            Open Dashboard
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            How It Works
          </a>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Agents can&apos;t pay</h3>
              <p className="text-xs text-zinc-500">AI agents need to transact on the web but have no way to hold or spend money autonomously.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">No spending controls</h3>
              <p className="text-xs text-zinc-500">Giving agents full wallet access is dangerous. They could drain funds or make unauthorized purchases.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">No visibility</h3>
              <p className="text-xs text-zinc-500">No way to track what agents are spending, where, or enforce budgets across services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">$</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Create Agent Wallets</h3>
              <p className="text-xs text-zinc-500">Each agent gets its own wallet address. Fund it with USDC on Base Sepolia.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">#</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Set Spending Policies</h3>
              <p className="text-xs text-zinc-500">Max per transaction, per day, per week. Allowlist or blocklist specific services.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">✓</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Enforce & Track</h3>
              <p className="text-xs text-zinc-500">Policy engine blocks unauthorized spending. Dashboard shows all receipts and violations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "1", title: "Create Agent", desc: "Name it, set policies" },
              { step: "2", title: "Fund Wallet", desc: "Send USDC to agent address" },
              { step: "3", title: "Agent Calls API", desc: "Pays via x402 automatically" },
              { step: "4", title: "Policy Check", desc: "Engine validates the spend" },
              { step: "5", title: "Receipt Logged", desc: "On-chain tx tracked" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 bg-violet-500/10 text-violet-400 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold border border-violet-500/20">
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Built With</h2>
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              x402 Protocol
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Base Sepolia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Next.js 16
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              USDC
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              MetaMask
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>AgentVault — Brainwave 2026 Submission</span>
          <span>Built with x402 + Next.js 16</span>
        </div>
      </footer>
    </div>
  );
}
