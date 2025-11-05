import type { NextApiRequest, NextApiResponse } from 'next';

// API handler for GET /api/opportunities
// Returns a paginated list of optimization opportunities for the specified domain.
// This implementation generates mock data; integrate with your ranking engine for production use.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { domain, limit = '10', cursor } = req.query;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Missing required domain parameter' });
  }
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
  // Generate some fake opportunities
  const opportunities = Array.from({ length: limitNum }).map((_, idx) => {
    const impact = 100 - idx * 2;
    return {
      id: `opp-${Date.now()}-${idx}`,
      title: `Opportunity ${idx + 1}`,
      description: `This is a generated opportunity for ${domain}. Rank ${idx + 1}.`,
      impact_score: impact,
      effort: impact > 80 ? 'low' : impact > 60 ? 'medium' : 'high',
      category: 'schema',
      estimated_aiv_gain: Math.floor(Math.random() * 20) + 5
    };
  });
  // Cursor is ignored in this mock implementation
  res.status(200).json({ opportunities, nextCursor: null });
}