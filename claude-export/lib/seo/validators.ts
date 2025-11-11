export function densityScore(text: string) {
  const words = text.trim().split(/\s+/).length || 1
  const chars = text.replace(/\s+/g, '').length
  const density = chars / words
  return { density, ok: density >= 3 && density <= 7 }
}
export function readabilityScore(text: string) {
  // Simple Flesch-Kincaid proxy
  const sentences = Math.max(1, (text.match(/[.!?]/g)?.length || 0))
  const words = Math.max(1, text.trim().split(/\s+/).length)
  const syll = Math.max(1, (text.match(/[aeiouy]/gi)?.length || 0))
  const flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syll / words)
  return { flesch, ok: flesch >= 50 }
}