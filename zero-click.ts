import type { NextApiRequest, NextApiResponse } from 'next';

// API handler for GET /api/zero-click
// Returns zero‑click metrics and time series data for a dealer.  This mock
// implementation produces synthetic values; integrate with your search metrics
// provider or analytics database for production use.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { dealerId, q, days = '30' } = req.query;
  if (!dealerId || typeof dealerId !== 'string') {
    return res.status(400).json({ error: 'Missing dealerId' });
  }
  const numDays = Math.min(365, Math.max(1, parseInt(days as string, 10) || 30));
  const series = Array.from({ length: numDays }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 500),
      zcr: Math.random()
    };
  });
  return res.status(200).json({
    zcr: 0.45,
    zcco: 0.62,
    airi: 0.28,
    aiPresenceRate: 0.33,
    series
  });
}