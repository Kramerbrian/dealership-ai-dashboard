/**
 * AI Scores API integration
 * Fetches AI visibility, zero-click, and sentiment scores
 */

export interface AIScores {
  aiVisibility: number;
  zeroClick: number;
  sentiment: number;
}

/**
 * Get AI scores for a given origin (website/domain)
 * Falls back to synthetic values if API is unavailable
 */
export async function getAIScores(origin: string): Promise<AIScores> {
  const base = process.env.AISCores_API;
  const token = process.env.AISCores_TOKEN;

  // Try real API if configured
  if (base && token) {
    try {
      const u = new URL('/api/ai-scores', base);
      u.searchParams.set('origin', origin);
      
      const r = await fetch(u.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (r.ok) {
        const j = await r.json();
        return {
          aiVisibility: j.scores?.chatgpt ?? j.scores?.aiVisibility ?? 50,
          zeroClick: j.scores?.google ?? j.scores?.zeroClick ?? 50,
          sentiment: j.sentiment ?? 60,
        };
      }
    } catch (error) {
      console.warn('[AIScores] API call failed, using fallback:', error);
    }
  }

  // Synthetic fallback: generate stable values based on origin hash
  const h = [...origin].reduce((a, c) => (a * 33 + c.charCodeAt(0)) % 1000, 7);
  return {
    aiVisibility: 40 + (h % 45),
    zeroClick: 35 + (h % 40),
    sentiment: 55 + (h % 30),
  };
}

