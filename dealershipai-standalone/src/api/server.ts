/**
 * Express Server - Consolidated API Routes
 * Single server file with all endpoints
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { ThreePillarScoring } from '../core/three-pillar';
import { db } from '../database/db';

const app = express();

app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/scores/:dealerId', async (req: Request, res: Response) => {
  try {
    const dealer = await db.getDealer(req.params.dealerId);
    if (!dealer) return res.status(404).json({ error: 'Dealer not found' });

    let scores = await db.getScores(dealer.id);
    
    if (!scores) {
      const scorer = new ThreePillarScoring();
      scores = await scorer.calculateAll(dealer);
      await db.saveScores(dealer.id, scores);
    }

    res.json(scores);
  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/dealers', async (req: Request, res: Response) => {
  try {
    const dealers = await db.getAllDealers();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Serve dashboard
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  DealershipAI - Premium Edition    ║
║  90% Real Data | 10% Synthetic     ║
╠════════════════════════════════════╣
║  Basic: $0   (10 queries/mo)       ║
║  Pro:   $499 (500 queries/mo)      ║
║  Ultra: $999 (2000 queries/mo)     ║
╚════════════════════════════════════╝
Server running on port ${PORT}
  `);
});
