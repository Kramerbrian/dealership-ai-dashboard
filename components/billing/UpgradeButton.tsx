"use client";

import React, { useState } from "react";

/**
 * Client-side "Upgrade" button that starts Stripe checkout
 */
export default function UpgradeButton({
  plan,
  currentPlan
}: {
  plan: "pro" | "enterprise";
  currentPlan: "free" | "pro" | "enterprise";
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert("Failed to start checkout");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
      setLoading(false);
    }
  }

  if (currentPlan === "enterprise" || (currentPlan === "pro" && plan === "pro")) {
    return null; // Already on this plan or higher
  }

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? "Loading..." : `Upgrade to ${plan === "pro" ? "Pro" : "Enterprise"}`}
    </button>
  );
}

