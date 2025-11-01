// PLG (Product-Led Growth) utility functions

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, properties);
  }
}

export function trackShareUnlock(domain: string, platform: string) {
  trackEvent("share_unlock", { domain, platform });
}

export function trackUpgradeClick(tier: "pro" | "enterprise") {
  trackEvent("upgrade_click", { tier });
}

export function trackAnalyzeStart(domain: string) {
  trackEvent("analyze_start", { domain });
}

export function getRemainingAnalyses(): number {
  if (typeof window === "undefined") return 3;
  const stored = localStorage.getItem("remaining_analyses");
  const count = stored ? parseInt(stored, 10) : 3;
  if (count <= 0) return 0;
  return count;
}

export function decrementAnalyses(): number {
  const current = getRemainingAnalyses();
  const next = Math.max(0, current - 1);
  localStorage.setItem("remaining_analyses", String(next));
  return next;
}

export function resetAnalyses() {
  localStorage.setItem("remaining_analyses", "3");
}
