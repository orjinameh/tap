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
          Brainwave 2026 — x402 Track
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Pay once.
          <br />
          <span className="text-violet-400">Use AI不限.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Give your AI agents 30 minutes of unlimited access to premium-quality AI services.
          Pick only what you need. Fewer services = lower price. No per-call fees.
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
              <h3 className="text-sm font-semibold text-white mb-2">AI is paywalled per model</h3>
              <p className="text-xs text-zinc-500">Premium AI costs $15-20/month per model. Agents that need multiple services face stacked subscriptions.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Agents have no payment layer</h3>
              <p className="text-xs text-zinc-500">No infrastructure for agents to autonomously purchase the AI services they need. Humans must subscribe for them.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">No visibility</h3>
              <p className="text-xs text-zinc-500">No way to track what agents are spending, where, or enforce time-based access across services.</p>
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
                <span className="text-violet-400 text-lg">+</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Create an Agent</h3>
              <p className="text-xs text-zinc-500">Pick the AI services your agent needs. Fewer services = cheaper activation. No bloat.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">$</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Buy Time</h3>
              <p className="text-xs text-zinc-500">Pay once per activation — $0.01 per service. Get 30 minutes of unlimited AI access. No per-call fees.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">⚡</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Run Unlimited</h3>
              <p className="text-xs text-zinc-500">While active, your agent calls any enabled service as many times as it wants. Premium quality, fraction of the cost.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Create Agent", desc: "Pick services, set a name" },
              { step: "2", title: "Buy Time", desc: "Pay once for 30 min access" },
              { step: "3", title: "Run Services", desc: "Unlimited calls while active" },
              { step: "4", title: "Renew or Expire", desc: "Buy again, or let it expire" },
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

      {/* Pricing */}
      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-sm text-zinc-500 mb-8">Pay per activation. No subscriptions. No per-call fees.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-xs text-zinc-500 mb-2">1 Service</p>
              <p className="text-3xl font-bold text-white">$0.01</p>
              <p className="text-xs text-zinc-600 mt-2">30 min unlimited</p>
            </div>
            <div className="bg-zinc-900 border border-violet-500/30 rounded-xl p-6">
              <p className="text-xs text-violet-400 mb-2">3 Services</p>
              <p className="text-3xl font-bold text-white">$0.03</p>
              <p className="text-xs text-zinc-600 mt-2">30 min unlimited</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-xs text-zinc-500 mb-2">All 6 Services</p>
              <p className="text-3xl font-bold text-white">$0.06</p>
              <p className="text-xs text-zinc-600 mt-2">30 min unlimited</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Built With</h2>
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-500 flex-wrap">
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
              Gemini 2.0 Flash
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              MCP Server
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Next.js 16
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Premium Prompt Engineering
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
