import { NextApiRequest, NextApiResponse } from 'next';
import { getDealershipScores, getDetailedDealershipScores } from '../src/lib/scoring-engine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin, detailed } = req.query;

  if (!origin || typeof origin !== 'string') {
    return res.status(400).json({ 
      error: 'origin parameter required',
      example: '/api/ai-scores?origin=example.com'
    });
  }

  try {
    console.log(`🔍 Analyzing dealership: ${origin}`);
    
    let scores;
    if (detailed === 'true') {
      scores = await getDetailedDealershipScores(origin);
    } else {
      scores = await getDealershipScores(origin);
    }
    
    // Add metadata
    const response = {
      ...scores,
      generated_at: new Date().toISOString(),
      domain: origin,
      cached: false, // This would be determined by the scoring engine
    };
    
    console.log(`✅ Analysis complete for ${origin}: ${scores.overall}/100`);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    
    // Return a more helpful error message
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to analyze dealership',
        message: error.message,
        domain: origin
      });
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      domain: origin
    });
  }
}
