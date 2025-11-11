export function honestyScore({ content, claims }: { content?: string; claims?: Array<{ claim: string; source?: string; confidence?: number; last_verified?: string }> }) {
  const n = claims?.length || 0
  const avgConf = n ? (claims!.reduce((s, c) => s + (c.confidence ?? 0), 0) / n) : 0
  return { claims: n, avgConfidence: avgConf, ok: avgConf >= 0.7 }
}
