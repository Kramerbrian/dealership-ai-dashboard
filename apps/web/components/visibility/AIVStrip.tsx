"use client"

import { useEffect, useMemo, useState } from "react"

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

export default function AIVStrip({
  domain,
  className,
  thresholds,
}: {
  domain?: string
  className?: string
  thresholds?: Partial<Thresholds>
}) {
  const [data, setData] = useState<Presence | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    let ok = true
    ;(async () => {
      try {
        setLoading(true)
        const q = new URLSearchParams()
        if (domain) q.set("domain", domain)

        const res = await fetch(`/api/visibility/presence?${q.toString()}`, {
          cache: "no-store",
        })
        const json = await res.json()
        if (ok) setData(json)
      } catch (error) {
        console.error("Failed to fetch presence:", error)
      } finally {
        if (ok) setLoading(false)
      }
    })()

    return () => {
      ok = false
    }
  }, [domain])

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className || ""}`}>
        {["ChatGPT", "Perplexity", "Gemini", "Copilot"].map((e) => (
          <div key={e} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/20 animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  const engines = data?.engines || []
  if (!engines.length) {
    return (
      <div className={`text-white/60 text-sm ${className || ""}`}>
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
    <div className={`flex items-center gap-4 ${className || ""}`}>
      {engines.map((e) => {
        const level = colorLevel(e.name, e.presencePct, thr)
        return (
          <div key={e.name} className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${dotColor(level)}`}
            />
            <span className="text-sm text-white/80">{e.name}</span>
            <span className={`text-sm ${textColor(level)} font-medium`}>
              {e.presencePct}%
            </span>
          </div>
        )
      })}
      {compositeScore > 0 && (
        <div className="flex items-center gap-2 pl-4 border-l border-white/20">
          <span className="text-xs text-white/60">AIV</span>
          <span className="text-sm font-semibold text-white">
            {Math.round(compositeScore)}/100
          </span>
        </div>
      )}
      <span className="text-xs text-white/40">
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

