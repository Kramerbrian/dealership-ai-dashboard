import type { NextApiRequest, NextApiResponse } from 'next';

// API handler for GET /api/ai-scores
// Returns AI Visibility (VAI), Algorithmic Trust Index (ATI) and Competitive Rank Score (CRS)
// for a given dealership domain.  These values are mocked for demonstration and should
// ultimately call into your analytics engine or database to compute real scores.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { domain } = req.query;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Missing required domain parameter' });
  }
  // TODO: Plug this into real analytics pipeline
  const fakeScore = (baseline: number) => baseline + Math.round(Math.random() * 10);
  const response = {
    vai: fakeScore(80),
    ati: fakeScore(75),
    crs: fakeScore(70),
    domain
  };
  res.status(200).json(response);
}