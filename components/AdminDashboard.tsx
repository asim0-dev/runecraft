"use client";

import { useState } from "react";

export default function AdminDashboard() {
  // Your actual admin UID
  const ADMIN_USER_ID = "558ab90b-6e5c-4376-a6d5-043683ed8fe5";

  const [targetUserId, setTargetUserId] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleAdjustCoins(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/adjust-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error || "Unknown error"}`);
      } else {
        alert(`✅ Successfully adjusted coins for ${targetUserId}`);
        setTargetUserId("");
        setAmount(0);
      }
    } catch (err) {
      alert("Network error while adjusting coins.");
    } finally {
      setLoading(false);
    }
  }

  const handleQuickAdjust = async (quickAmount: number) => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/adjust-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: ADMIN_USER_ID, amount: quickAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error || "Unknown error"}`);
      } else {
        alert(`✅ Successfully adjusted coins for your account`);
      }
    } catch (err) {
      alert("Network error while adjusting coins.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Adjust (Your Account)</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleQuickAdjust(100)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 p-2 rounded font-semibold"
          >
            +100 Coins
          </button>
          <button
            onClick={() => handleQuickAdjust(1000)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 p-2 rounded font-semibold"
          >
            +1000 Coins
          </button>
          <button
            onClick={() => handleQuickAdjust(-100)}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 p-2 rounded font-semibold"
          >
            -100 Coins
          </button>
        </div>
      </section>

      <div className="border-t border-gray-700 pt-6"></div>

      <form onSubmit={handleAdjustCoins} className="space-y-4">
        <h2 className="text-xl font-semibold">Manual Adjustment</h2>
        <div>
          <label className="block mb-1">Target User ID</label>
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Amount (can be negative)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-2 rounded font-semibold"
        >
          {loading ? "Processing..." : "Adjust Coins"}
        </button>
      </form>
    </div>
  );
}
