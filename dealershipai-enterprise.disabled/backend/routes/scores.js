const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { calculateSEOScore, calculateAEOScore, calculateGEOScore, calculateEEATScore } = require('../services/scoringService');

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

// Get scores for a specific dealer
router.get('/:dealerId', async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { forceRefresh } = req.query;

    // Check cache first
    const cacheKey = `scores_${dealerId}`;
    if (!forceRefresh && cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    // Calculate scores
    const scores = {
      seo: await calculateSEOScore(dealerId),
      aeo: await calculateAEOScore(dealerId),
      geo: await calculateGEOScore(dealerId),
      eeat: await calculateEEATScore(dealerId),
      overall: 0,
      lastUpdated: new Date().toISOString()
    };

    // Calculate overall score
    scores.overall = Math.round(
      (scores.seo.score + scores.aeo.score + scores.geo.score + scores.eeat.score) / 4
    );

    // Cache the result
    cache.set(cacheKey, scores);

    res.json(scores);
  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({
      error: 'Failed to calculate scores',
      message: error.message
    });
  }
});

// Get score history for a dealer
router.get('/:dealerId/history', async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { days = 30 } = req.query;

    // Mock historical data - in production, this would come from database
    const history = [];
    const now = new Date();
    
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      history.push({
        date: date.toISOString().split('T')[0],
        seo: Math.floor(Math.random() * 20) + 70,
        aeo: Math.floor(Math.random() * 20) + 60,
        geo: Math.floor(Math.random() * 20) + 65,
        eeat: Math.floor(Math.random() * 20) + 75,
        overall: Math.floor(Math.random() * 15) + 70
      });
    }

    res.json({
      dealerId,
      history: history.reverse(),
      period: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching score history:', error);
    res.status(500).json({
      error: 'Failed to fetch score history',
      message: error.message
    });
  }
});

// Batch calculate scores for multiple dealers
router.post('/batch', async (req, res) => {
  try {
    const { dealerIds } = req.body;

    if (!Array.isArray(dealerIds) || dealerIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'dealerIds must be a non-empty array'
      });
    }

    const results = [];
    
    for (const dealerId of dealerIds) {
      try {
        const scores = {
          dealerId,
          seo: await calculateSEOScore(dealerId),
          aeo: await calculateAEOScore(dealerId),
          geo: await calculateGEOScore(dealerId),
          eeat: await calculateEEATScore(dealerId),
          overall: 0,
          lastUpdated: new Date().toISOString()
        };

        scores.overall = Math.round(
          (scores.seo.score + scores.aeo.score + scores.geo.score + scores.eeat.score) / 4
        );

        results.push(scores);
      } catch (error) {
        console.error(`Error calculating scores for dealer ${dealerId}:`, error);
        results.push({
          dealerId,
          error: error.message
        });
      }
    }

    res.json({
      results,
      totalProcessed: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in batch score calculation:', error);
    res.status(500).json({
      error: 'Failed to calculate batch scores',
      message: error.message
    });
  }
});

module.exports = router;
