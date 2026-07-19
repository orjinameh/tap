"use client";

import { useState } from "react";

interface ApiCardProps {
  name: string;
  endpoint: string;
  price: string;
  description: string;
  inputPlaceholder: string;
  inputLabel: string;
  inputType?: "text" | "textarea";
  extraFields?: { name: string; placeholder: string; label: string }[];
}

export default function ApiCard({
  name,
  endpoint,
  price,
  description,
  inputPlaceholder,
  inputLabel,
  inputType = "textarea",
  extraFields,
}: ApiCardProps) {
  const [input, setInput] = useState("");
  const [extraInputs, setExtraInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const purchaseSession = async () => {
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/session", { method: "POST" });
      if (res.status === 402) {
        setError("x402 Payment Required — sign the payment in MetaMask to activate your session");
        setPurchasing(false);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        setError(err.error || "Failed to activate session");
        setPurchasing(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem("tap_session", data.sessionToken);
      setSessionActive(true);
      setSessionExpiry(data.expiresIn);
    } catch {
      setError("Network error");
    } finally {
      setPurchasing(false);
    }
  };

  const callApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const sessionToken = localStorage.getItem("tap_session");

    try {
      const body: Record<string, string> = {};
      if (inputType === "textarea") {
        body.text = input;
      } else {
        body.code = input;
      }
      Object.entries(extraInputs).forEach(([k, v]) => { body[k] = v; });

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (res.status === 402) {
        setSessionActive(false);
        setError("Session expired — purchase a new session to continue");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setError(err.error || "Request failed");
        return;
      }

      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-md">
          Free with session
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-4">{description}</p>

      {!sessionActive ? (
        <div className="mb-4">
          <button
            onClick={purchaseSession}
            disabled={purchasing}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {purchasing ? "Signing x402 payment..." : `Buy Session — $0.05 USDC (30 min)`}
          </button>
          <p className="text-xs text-zinc-600 mt-2 text-center">Pay once via x402, use all APIs for 30 minutes</p>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-emerald-400">Session active — {sessionExpiry} remaining</span>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-xs text-zinc-500 uppercase tracking-wider">{inputLabel}</label>
        {inputType === "textarea" ? (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full h-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
        ) : (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        )}

        {extraFields?.map((f) => (
          <div key={f.name}>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">{f.label}</label>
            <input
              value={extraInputs[f.name] || ""}
              onChange={(e) => setExtraInputs({ ...extraInputs, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        ))}

        <button
          onClick={callApi}
          disabled={loading || !input || !sessionActive}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Processing..." : !sessionActive ? "Buy session first" : "Tap to Call"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Result</span>
            <span className="text-xs text-emerald-400 font-mono">✓ included in session</span>
          </div>
          <pre className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 overflow-x-auto whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
