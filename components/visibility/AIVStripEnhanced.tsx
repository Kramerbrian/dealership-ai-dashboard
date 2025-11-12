"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import useSWR from "swr"
import { Info, RefreshCw, AlertCircle } from "lucide-react"

type EngineName = "ChatGPT" | "Perplexity" | "Gemini" | "Copilot"

type Presence = {
  domain: string
  engines: Array<{ name: EngineName; presencePct: number }>
  lastCheckedISO: string
  connected?: boolean
}

type Thresholds = Record<EngineName, { warn: number; critical: number }>

const DEFAULT_THRESHOLDS: Thresholds = {
  ChatGPT: { warn: 80, critical: 70 },
  Perplexity: { warn: 75, critical: 65 },
  Gemini: { warn: 75, critical: 70 },
  Copilot: { warn: 72, critical: 65 },
}

// SWR fetcher with error handling
const fetcher = async (url: string): Promise<Presence> => {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  return res.json()
}

export default function AIVStripEnhanced({
  domain,
  className,
  thresholds,
  showExplain = false,
  autoRefresh = true,
}: {
  domain?: string
  className?: string
  thresholds?: Partial<Thresholds>
  showExplain?: boolean
  autoRefresh?: boolean
}) {
  const [retryCount, setRetryCount] = useState(0)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // Build API URL
  const apiUrl = useMemo(() => {
    const q = new URLSearchParams()
    if (domain) q.set("domain", domain)
    return `/api/visibility/presence?${q.toString()}`
  }, [domain])

  // SWR with caching and retry
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Presence>(
    apiUrl,
    fetcher,
    {
      refreshInterval: autoRefresh ? 300000 : 0, // 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return
        setTimeout(() => revalidate({ retryCount }), 5000)
      },
    }
  )

  // Merge thresholds with defaults
  const thr: Thresholds = useMemo(() => {
    return (["ChatGPT", "Perplexity", "Gemini", "Copilot"] as EngineName[]).reduce(
      (acc, e) => ({
        ...acc,
        [e]: {
          warn: thresholds?.[e]?.warn ?? DEFAULT_THRESHOLDS[e].warn,
          critical: thresholds?.[e]?.critical ?? DEFAULT_THRESHOLDS[e].critical,
        },
      }),
      {} as Thresholds
    )
  }, [thresholds])

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    mutate()
  }, [mutate])

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-3 ${className || ""}`}
        role="status"
        aria-label="Loading AI visibility data"
      >
        {["ChatGPT", "Perplexity", "Gemini", "Copilot"].map((e) => (
          <div key={e} className="flex items-center gap-2" aria-hidden="true">
            <div className="h-2 w-2 rounded-full bg-white/20 animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center gap-2 ${className || ""}`}
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
        <span className="text-xs text-red-400">Failed to load</span>
        <button
          onClick={handleRetry}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Retry loading visibility data"
          title="Retry"
        >
          <RefreshCw className="w-3 h-3 text-white/60" />
        </button>
      </div>
    )
  }

  const engines = data?.engines || []
  if (!engines.length) {
    return (
      <div
        className={`text-white/60 text-sm ${className || ""}`}
        role="status"
        aria-label="No engines enabled"
      >
        No engines enabled
      </div>
    )
  }

  // Calculate AIV composite score (weighted average)
  const weights: Record<EngineName, number> = {
    ChatGPT: 0.35,
    Perplexity: 0.25,
    Gemini: 0.25,
    Copilot: 0.15,
  }

  const compositeScore = engines.reduce((sum, e) => {
    return sum + (e.presencePct * (weights[e.name] || 0))
  }, 0)

  return (
    <div
      className={`flex items-center gap-4 ${className || ""}`}
      role="region"
      aria-label="AI Visibility Engine Status"
    >
      {engines.map((e) => {
        const level = colorLevel(e.name, e.presencePct, thr)
        const tooltipId = `aiv-tooltip-${e.name.toLowerCase()}`
        return (
          <div
            key={e.name}
            className="flex items-center gap-2 group relative"
            onMouseEnter={() => showExplain && setShowTooltip(e.name)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${dotColor(level)}`}
              aria-label={`${e.name} status: ${level}`}
              role="img"
            />
            <span className="text-sm text-white/80" aria-label={`${e.name} presence`}>
              {e.name}
            </span>
            <span
              className={`text-sm ${textColor(level)} font-medium`}
              aria-label={`${e.name} presence percentage: ${e.presencePct}%`}
            >
              {e.presencePct}%
            </span>
            {showExplain && showTooltip === e.name && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap pointer-events-none"
                role="tooltip"
                id={tooltipId}
              >
                <div className="font-semibold mb-1">{e.name}</div>
                <div>Presence: {e.presencePct}%</div>
                <div>Threshold: Warn {thr[e.name].warn}%, Critical {thr[e.name].critical}%</div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
              </div>
            )}
          </div>
        )
      })}
      {compositeScore > 0 && (
        <div
          className="flex items-center gap-2 pl-4 border-l border-white/20"
          aria-label={`AI Visibility composite score: ${Math.round(compositeScore)} out of 100`}
        >
          <span className="text-xs text-white/60">AIV</span>
          <span className="text-sm font-semibold text-white">
            {Math.round(compositeScore)}/100
          </span>
          {showExplain && (
            <button
              className="ml-1 p-0.5 hover:bg-white/10 rounded transition-colors"
              aria-label="Explain AIV score"
              title="AI Visibility Index - Weighted average of engine presence"
            >
              <Info className="w-3 h-3 text-white/60" />
            </button>
          )}
        </div>
      )}
      <span className="text-xs text-white/40" aria-label="Last checked">
        checked{" "}
        {data?.lastCheckedISO ? timeAgo(new Date(data.lastCheckedISO)) : "now"}
      </span>
    </div>
  )
}

function colorLevel(
  engine: EngineName,
  pct: number,
  thr: Thresholds
): "good" | "warn" | "critical" {
  const T = thr[engine] || DEFAULT_THRESHOLDS[engine]
  if (pct <= T.critical) return "critical"
  if (pct <= T.warn) return "warn"
  return "good"
}

function dotColor(level: "good" | "warn" | "critical") {
  return level === "good"
    ? "bg-green-400"
    : level === "warn"
    ? "bg-amber-400"
    : "bg-red-400"
}

function textColor(level: "good" | "warn" | "critical") {
  return level === "good"
    ? "text-green-400"
    : level === "warn"
    ? "text-amber-400"
    : "text-red-400"
}

function timeAgo(d: Date) {
  const sec = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000))
  if (sec < 60) return `${sec}s ago`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  return `${hr}h ago`
}

