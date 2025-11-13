"use client"

/**
 * Example integration patterns for AIVStrip component
 * Copy these into your actual dashboard/landing pages
 */

import AIVStrip from "@/components/visibility/AIVStrip"
import { useState } from "react"

// Example 1: Basic usage in dashboard header
export function DashboardHeaderWithAIV({ domain }: { domain?: string }) {
  return (
    <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between bg-slate-900 text-white">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-white" />
        <span className="text-white/80">DealershipAI • Drive</span>
      </div>
      <div className="flex items-center gap-6">
        <AIVStrip domain={domain} />
        <button className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10">
          Engine Prefs
        </button>
      </div>
    </header>
  )
}

// Example 2: With custom thresholds
export function DashboardWithCustomThresholds({ domain }: { domain?: string }) {
  const [thresholds, setThresholds] = useState({
    ChatGPT: { warn: 85, critical: 75 },
    Perplexity: { warn: 80, critical: 70 },
    Gemini: { warn: 80, critical: 75 },
    Copilot: { warn: 75, critical: 65 },
  })

  return (
    <div className="p-6">
      <AIVStrip domain={domain} thresholds={thresholds} />
    </div>
  )
}

// Example 3: In landing page results section
export function LandingResultsWithAIV({ domain }: { domain: string }) {
  return (
    <div className="mt-4 p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Visibility Results</h3>
        <AIVStrip domain={domain} className="justify-end" />
      </div>
      {/* Rest of your results content */}
    </div>
  )
}

// Example 4: Compact inline version
export function CompactAIVStrip({ domain }: { domain?: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-full">
      <AIVStrip domain={domain} className="text-xs" />
    </div>
  )
}

// Example 5: With loading state handling
export function AIVStripWithState({ domain }: { domain?: string }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center">
          <div className="text-sm text-gray-600">Updating...</div>
        </div>
      )}
      <AIVStrip domain={domain} />
    </div>
  )
}

