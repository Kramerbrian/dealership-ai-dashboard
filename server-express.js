/**
 * Express.js Server with Clerk Integration
 * Alternative to Next.js API routes for DealershipAI
 */

const express = require('express');
const { clerkMiddleware, getAuth } = require('@clerk/express');
const { createClerkExpressApp } = require('./src/lib/clerk-config');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Clerk middleware to protect all routes
app.use(clerkMiddleware());

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'DealershipAI Express Server'
  });
});

// Protected user endpoint
app.get('/api/user', (req, res) => {
  const { isAuthenticated, userId, sessionId, orgId } = getAuth(req);
  
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  res.json({ 
    userId, 
    sessionId,
    orgId,
    tenantId: orgId || userId, // Use orgId for multi-tenant, fallback to userId
    message: 'User authenticated successfully' 
  });
});

// DealershipAI specific endpoints
app.get('/api/dealerships', (req, res) => {
  const { isAuthenticated, userId, orgId } = getAuth(req);
  
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  // Mock dealership data - in production, fetch from your database
  const dealerships = [
    {
      id: 'dealer-1',
      name: 'Terry Reid Hyundai',
      domain: 'terryreidhyundai.com',
      city: 'Naples',
      state: 'FL',
      tenantId: orgId || userId
    },
    {
      id: 'dealer-2', 
      name: 'Premier Toyota Sacramento',
      domain: 'premiertoyota.com',
      city: 'Sacramento',
      state: 'CA',
      tenantId: orgId || userId
    }
  ];
  
  // Filter dealerships by tenant
  const userDealerships = dealerships.filter(d => d.tenantId === (orgId || userId));
  
  res.json({
    dealerships: userDealerships,
    total: userDealerships.length
  });
});

// AI Scores endpoint
app.get('/api/scores/:dealerId', (req, res) => {
  const { isAuthenticated, userId, orgId } = getAuth(req);
  
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const { dealerId } = req.params;
  
  // Mock AI scores - in production, fetch from your scoring engine
  const scores = {
    dealerId,
    ai_visibility: 75,
    zero_click: 68,
    ugc_health: 82,
    geo_trust: 78,
    sgp_integrity: 85,
    overall: 75,
    calculated_at: new Date().toISOString()
  };
  
  res.json(scores);
});

// Monthly scan trigger endpoint
app.post('/api/scan/trigger', (req, res) => {
  const { isAuthenticated, userId, orgId } = getAuth(req);
  
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  // Check if user has admin permissions
  // In production, check user role from Clerk metadata
  const hasAdminAccess = true; // Mock - implement proper role checking
  
  if (!hasAdminAccess) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Trigger monthly scan
  console.log('Monthly scan triggered by user:', userId);
  
  res.json({
    success: true,
    message: 'Monthly scan triggered successfully',
    triggered_by: userId,
    timestamp: new Date().toISOString()
  });
});

// Leaderboard endpoint
app.get('/api/leaderboard', (req, res) => {
  const { isAuthenticated, userId, orgId } = getAuth(req);
  
  if (!isAuthenticated) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  const { limit = 100, brand, state } = req.query;
  
  // Mock leaderboard data - in production, fetch from your database
  const leaderboard = [
    {
      id: 'dealer-1',
      name: 'Terry Reid Hyundai',
      brand: 'Hyundai',
      city: 'Naples',
      state: 'FL',
      visibility_score: 85,
      total_mentions: 45,
      avg_rank: 2.3,
      sentiment_score: 0.7,
      rank_position: 1
    },
    {
      id: 'dealer-2',
      name: 'Premier Toyota Sacramento', 
      brand: 'Toyota',
      city: 'Sacramento',
      state: 'CA',
      visibility_score: 82,
      total_mentions: 38,
      avg_rank: 2.8,
      sentiment_score: 0.6,
      rank_position: 2
    }
  ];
  
  // Apply filters
  let filteredLeaderboard = leaderboard;
  
  if (brand) {
    filteredLeaderboard = filteredLeaderboard.filter(d => d.brand === brand);
  }
  
  if (state) {
    filteredLeaderboard = filteredLeaderboard.filter(d => d.state === state);
  }
  
  // Apply limit
  filteredLeaderboard = filteredLeaderboard.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: {
      leaderboard: filteredLeaderboard,
      statistics: {
        totalDealers: filteredLeaderboard.length,
        averageScore: 83,
        averageMentions: 41,
        averageSentiment: 0.65
      },
      scanDate: new Date().toISOString().split('T')[0],
      filters: { limit, brand, state }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 DealershipAI Express server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 User endpoint: http://localhost:${PORT}/api/user`);
  console.log(`🏢 Dealerships: http://localhost:${PORT}/api/dealerships`);
  console.log(`📈 Leaderboard: http://localhost:${PORT}/api/leaderboard`);
});

module.exports = app;
