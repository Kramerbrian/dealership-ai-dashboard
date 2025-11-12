import type { NextApiRequest, NextApiResponse } from 'next';

// API handler for POST /api/refresh
// Triggers a new crawl and metric re‑computation for the specified domain.
// This mock implementation simply returns a fake job ID and estimated completion time.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { domain, force } = req.body;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ success: false, message: 'Missing domain' });
  }
  const jobId = `job-${Date.now()}`;
  return res.status(200).json({ success: true, jobId, message: `Refresh started for ${domain}`, estimatedTime: 10 });
}