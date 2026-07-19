"use client";

import { useState, useEffect } from "react";
import WalletButton from "@/components/WalletButton";

interface Transaction {
  id: string;
  api: string;
  price: string;
  timestamp: string;
  txHash?: string;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tap_address");
    if (saved) setAddress(saved);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-white">Tap</span>
            </a>
            <span className="text-zinc-600">/</span>
            <span className="text-sm text-zinc-400">Dashboard</span>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!address ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">Connect your wallet to view your dashboard</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-white">$0.00</p>
                <p className="text-xs text-zinc-600 mt-1">USDC on Base Sepolia</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">API Calls</p>
                <p className="text-3xl font-bold text-white">{transactions.length}</p>
                <p className="text-xs text-zinc-600 mt-1">Total requests made</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Network</p>
                <p className="text-3xl font-bold text-emerald-400">Base</p>
                <p className="text-xs text-zinc-600 mt-1">Sepolia Testnet</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
                <p className="text-zinc-500">No transactions yet. Head to the API catalog to make your first call.</p>
                <a href="/" className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
                  Browse APIs
                </a>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-6 py-3">API</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-6 py-3">Price</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-6 py-3">Time</th>
                      <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="px-6 py-3 text-sm text-white font-mono">{tx.api}</td>
                        <td className="px-6 py-3 text-sm text-emerald-400">{tx.price}</td>
                        <td className="px-6 py-3 text-sm text-zinc-400">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-md">confirmed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
