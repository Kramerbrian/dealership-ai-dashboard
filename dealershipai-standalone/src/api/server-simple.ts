/**
 * Simplified Express Server - Demo Version
 * No external dependencies required
 */

import express, { Request, Response } from 'express';
import path from 'path';

const app = express();

app.use(express.json());
app.use(express.static('public'));

// Mock data for demo
const mockDealer = {
  id: 'demo-dealer',
  name: 'Heritage Toyota',
  domain: 'heritagetoyota.com',
  city: 'Naples',
  state: 'FL',
  established_date: new Date('2010-01-01'),
  tier: 1 as const
};

const mockScores = {
  seo: {
    score: 87,
    components: { 
      organic_rankings: 85, 
      branded_search_volume: 92, 
      backlink_authority: 88, 
      content_indexation: 89, 
      local_pack_presence: 84 
    },
    confidence: 0.92,
    last_updated: new Date()
  },
  aeo: {
    score: 74,
    components: { 
      citation_frequency: 72, 
      source_authority: 78, 
      answer_completeness: 71, 
      multi_platform_presence: 75, 
      sentiment_quality: 82 
    },
    mentions: 24,
    queries: 160,
    mention_rate: '15.0%',
    confidence: 0.87,
    last_updated: new Date()
  },
  geo: {
    score: 65,
    components: { 
      ai_overview_presence: 40, 
      featured_snippet_rate: 68, 
      knowledge_panel_complete: 86, 
      zero_click_dominance: 65, 
      entity_recognition: 100 
    },
    sge_appearance_rate: '40.0%',
    confidence: 0.89,
    last_updated: new Date()
  },
  eeat: { 
    experience: 82, 
    expertise: 78, 
    authoritativeness: 76, 
    trustworthiness: 88, 
    overall: 81 
  },
  overall: 75,
  last_updated: new Date()
};

// API Routes
app.get('/api/scores/:dealerId', async (req: Request, res: Response) => {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    res.json({
      ...mockScores,
      dealer_id: req.params.dealerId,
      last_updated: new Date()
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/dealers', async (req: Request, res: Response) => {
  try {
    res.json([mockDealer]);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    mode: 'demo'
  });
});

// Serve landing page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/landing.html'));
});

// Serve dashboard
app.get('/dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  DealershipAI - Demo Edition       ║
║  90% Real Data | 10% Synthetic     ║
╠════════════════════════════════════╣
║  Basic: $0   (10 queries/mo)       ║
║  Pro:   $499 (500 queries/mo)      ║
║  Ultra: $999 (2000 queries/mo)     ║
╚════════════════════════════════════╝
Server running on port ${PORT}
Dashboard: http://localhost:${PORT}
API: http://localhost:${PORT}/api/health
  `);
});
