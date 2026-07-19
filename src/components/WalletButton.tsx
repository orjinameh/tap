"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tap_token");
    const savedAddr = localStorage.getItem("tap_address");
    if (saved && savedAddr) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${saved}` } })
        .then((r) => {
          if (r.ok) {
            setToken(saved);
            setAddress(savedAddr);
          } else {
            localStorage.removeItem("tap_token");
            localStorage.removeItem("tap_address");
          }
        })
        .catch(() => {});
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];

      const nonceRes = await fetch(`/api/auth/nonce?address=${addr}`);
      const { message } = await nonceRes.json();

      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, addr],
      });

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, signature, message }),
      });
      const data = await verifyRes.json();
      if (!data.token) {
        alert("Verification failed. Please try again.");
        return;
      }

      localStorage.setItem("tap_token", data.token);
      localStorage.setItem("tap_address", addr);
      setToken(data.token);
      setAddress(addr);
    } catch (err) {
      console.error("Connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem("tap_token");
    localStorage.removeItem("tap_address");
    setToken(null);
    setAddress(null);
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
