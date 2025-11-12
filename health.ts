import type { NextApiRequest, NextApiResponse } from 'next';

// API handler for GET /api/ai/health
// Returns engine status, visibility trends and performance metrics for a dealer.
// This mock returns random data to simulate dynamic status; integrate with your
// AI monitoring infrastructure for production.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { dealerId, intent } = req.query;
  if (!dealerId || typeof dealerId !== 'string') {
    return res.status(400).json({ error: 'Missing dealerId' });
  }
  const statuses = ['healthy', 'degraded', 'down'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const health = {
    status,
    visibility: {
      current: Math.floor(Math.random() * 100),
      trend: (['up', 'down', 'stable'] as const)[Math.floor(Math.random() * 3)],
      change: parseFloat((Math.random() * 20 - 10).toFixed(2))
    },
    metrics: {
      uptime: parseFloat((Math.random() * 100).toFixed(2)),
      responseTime: parseFloat((100 + Math.random() * 400).toFixed(2)),
      accuracy: parseFloat((80 + Math.random() * 20).toFixed(2))
    },
    alerts: [
      {
        severity: 'info',
        message: 'All systems nominal',
        timestamp: new Date().toISOString()
      }
    ]
  };
  res.status(200).json(health);
}