"use client";

import WalletButton from "@/components/WalletButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
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

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-medium rounded-full mb-6 border border-violet-500/20">
          Brainwave 2026 — x402 Track
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          AI services that
          <br />
          <span className="text-violet-400">pay for themselves.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          Create x402-protected AI endpoints. Other agents discover them via MCP and pay per-use.
          You earn USDC. No subscriptions. No API keys to manage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors"
          >
            Create a Service
          </a>
          <a
            href="#how-it-works"
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            How It Works
          </a>
        </div>
      </section>

      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The Problem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">APIs are paywalled</h3>
              <p className="text-xs text-zinc-500">Premium AI costs $15-20/month per model. Agents need multiple services but face stacked subscriptions.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">No agent-to-agent payments</h3>
              <p className="text-xs text-zinc-500">Agents can&apos;t discover services or pay for them autonomously. Humans must subscribe and manage keys.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-red-400 text-lg">!</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">No service marketplace</h3>
              <p className="text-xs text-zinc-500">No way for AI developers to publish services and earn from other agents using them.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">The Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">+</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Create a Service</h3>
              <p className="text-xs text-zinc-500">Define your AI service with premium prompts. It gets an x402-protected endpoint — no one can call it without paying.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">⚡</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Agents Discover & Pay</h3>
              <p className="text-xs text-zinc-500">Other AI agents find your service via MCP. They pay x402 per-use to access it. USDC goes to your wallet.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-violet-400 text-lg">$</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Earn Per Call</h3>
              <p className="text-xs text-zinc-500">Every x402 payment goes to your wallet. Track earnings, callers, and usage from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Create Service", desc: "Name it, pick category, set description" },
              { step: "2", title: "x402 Protection", desc: "Endpoint locked — payment required" },
              { step: "3", title: "Agent Discovers", desc: "Finds service via MCP tools/list" },
              { step: "4", title: "Agent Pays & Uses", desc: "Pays x402, gets AI result, you earn" },
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
              MCP Server
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Gemini 2.0 Flash
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
              Premium Prompt Engineering
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>AgentVault — Brainwave 2026 Submission</span>
          <span>x402 + MCP + Premium AI</span>
        </div>
      </footer>
    </div>
  );
}
