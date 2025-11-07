"use client";

import React from "react";

/**
 * Client-only visual gate; server-side routes should also enforce plan via getPlan().
 * Usage:
 * <TierGate plan={planFromServer} min="pro">
 *   <button>Autopilot</button>
 * </TierGate>
 */
export default function TierGate({
  plan,
  min,
  children
}: {
  plan: "free"|"pro"|"enterprise";
  min: "free"|"pro"|"enterprise";
  children: React.ReactNode;
}) {
  const allowed = allow(plan, min);
  return (
    <div className={!allowed ? "opacity-50 pointer-events-none" : ""} title={!allowed ? `Upgrade to ${min} to unlock` : undefined}>
      {children}
      {!allowed && (
        <div className="mt-2 text-xs text-white/40">Locked — upgrade to {min} to unlock</div>
      )}
    </div>
  );
}

function allow(plan: "free"|"pro"|"enterprise", min:"free"|"pro"|"enterprise") {
  const rank = { free:0, pro:1, enterprise:2 };
  return rank[plan] >= rank[min];
}

