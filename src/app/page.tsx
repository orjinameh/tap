"use client";

import WalletButton from "@/components/WalletButton";
import ApiCard from "@/components/ApiCard";

const APIS = [
  {
    name: "Summarize",
    endpoint: "/api/ai/summarize",
    price: "Free",
    description: "Condense any text into a concise summary. Perfect for articles, docs, and reports.",
    inputLabel: "Text to summarize",
    inputPlaceholder: "Paste a long article or document here...",
    inputType: "textarea" as const,
  },
  {
    name: "Translate",
    endpoint: "/api/ai/translate",
    price: "Free",
    description: "Translate text between languages. Specify target language in the extra field.",
    inputLabel: "Text to translate",
    inputPlaceholder: "Enter text to translate...",
    inputType: "textarea" as const,
    extraFields: [{ name: "targetLang", placeholder: "e.g., Spanish, Chinese, French", label: "Target Language" }],
  },
  {
    name: "Code Review",
    endpoint: "/api/ai/code-review",
    price: "Free",
    description: "Get AI-powered code review with bug detection, suggestions, and best practices.",
    inputLabel: "Code to review",
    inputPlaceholder: "Paste your code here...",
    inputType: "textarea" as const,
  },
  {
    name: "Generate",
    endpoint: "/api/ai/generate",
    price: "Free",
    description: "Generate content — blog posts, emails, social media, SEO articles, and more.",
    inputLabel: "Generation prompt",
    inputPlaceholder: "Write a blog post about the future of AI...",
    inputType: "textarea" as const,
    extraFields: [{ name: "type", placeholder: "e.g., blog post, email, tweet, SEO article", label: "Content Type" }],
  },
  {
    name: "Explain",
    endpoint: "/api/ai/explain",
    price: "Free",
    description: "Get plain-English explanations of code, concepts, or technical text.",
    inputLabel: "Text to explain",
    inputPlaceholder: "Explain this code snippet or concept...",
    inputType: "textarea" as const,
  },
  {
    name: "Classify",
    endpoint: "/api/ai/classify",
    price: "Free",
    description: "Classify text by topic, sentiment, or intent. Returns structured categories.",
    inputLabel: "Text to classify",
    inputPlaceholder: "Enter text to classify...",
    inputType: "textarea" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-white">Tap</span>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full mb-6 border border-emerald-500/20">
          Powered by x402 Protocol
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Tap into any API.
          <br />
          <span className="text-emerald-400">Pay once, use all.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
          An AI API marketplace powered by x402 micropayments. Pay $0.05 once via x402, get 30 minutes of unlimited access to all 6 AI APIs.
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            x402 Protocol
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            USDC on Base
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            On-chain Receipts
          </span>
        </div>
      </section>

      {/* API Catalog */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white mb-2">API Catalog</h2>
        <p className="text-sm text-zinc-500 mb-8">Each API costs a micropayment via x402. Connect your wallet, enter your input, and tap to call.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {APIS.map((api) => (
            <ApiCard key={api.endpoint} {...api} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How x402 Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Buy Session", desc: "Pay $0.05 USDC via x402 to activate" },
              { step: "2", title: "30 Min Access", desc: "Use all 6 AI APIs unlimited" },
              { step: "3", title: "On-chain Receipt", desc: "Verifiable USDC transfer on Base" },
              { step: "4", title: "Session Expires", desc: "Pay again to continue using" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold border border-emerald-500/20">
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-xs text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-zinc-600">
          <span>Tap — Brainwave 2026 Submission</span>
          <span>Built with x402 + Next.js 16 + Gemini</span>
        </div>
      </footer>
    </div>
  );
}
