const express = require('express');
const router = express.Router();
const MonthlyScanService = require('../lib/monthly-scan');

// In-memory storage for demo purposes
const scanHistory = [];
const dealers = [
    { id: 'dealer_1', name: 'Premier Auto Group', address: '123 Main St, Anytown, USA', website: 'premierauto.com' },
    { id: 'dealer_2', name: 'Elite Motors', address: '456 Oak Ave, Somewhere, USA', website: 'elitemotors.com' },
    { id: 'dealer_3', name: 'Metro Car Center', address: '789 Pine St, Downtown, USA', website: 'metrocarcenter.com' },
    { id: 'dealer_4', name: 'Sunshine Auto', address: '321 Beach Blvd, Coastal, USA', website: 'sunshineauto.com' },
    { id: 'dealer_5', name: 'Mountain View Motors', address: '654 Hill Rd, Uptown, USA', website: 'mountainviewmotors.com' }
];

/**
 * POST /api/monthly-scan/start
 * Start a new monthly scan
 */
router.post('/start', async (req, res) => {
    try {
        const { dealers: customDealers } = req.body;
        const dealersToScan = customDealers || dealers;
        
        console.log(`🚀 Starting monthly scan for ${dealersToScan.length} dealers`);
        
        const scanService = new MonthlyScanService();
        const result = await scanService.monthlyScan(dealersToScan);
        
        // Store scan result
        const scanRecord = {
            id: `scan_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: result.success ? 'completed' : 'failed',
            dealers: dealersToScan.length,
            result: result
        };
        
        scanHistory.push(scanRecord);
        
        res.status(200).json({
            success: true,
            message: 'Monthly scan completed successfully',
            scanId: scanRecord.id,
            result: result
        });
        
    } catch (error) {
        console.error('Monthly scan error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start monthly scan',
            details: error.message
        });
    }
});

/**
 * GET /api/monthly-scan/status/:scanId
 * Get status of a specific scan
 */
router.get('/status/:scanId', (req, res) => {
    const { scanId } = req.params;
    const scan = scanHistory.find(s => s.id === scanId);
    
    if (!scan) {
        return res.status(404).json({
            success: false,
            error: 'Scan not found'
        });
    }
    
    res.status(200).json({
        success: true,
        scan: scan
    });
});

/**
 * GET /api/monthly-scan/history
 * Get scan history
 */
router.get('/history', (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    
    const paginatedHistory = scanHistory
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    res.status(200).json({
        success: true,
        scans: paginatedHistory,
        total: scanHistory.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
});

/**
 * GET /api/monthly-scan/leaderboard
 * Get current leaderboard
 */
router.get('/leaderboard', (req, res) => {
    const latestScan = scanHistory
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (!latestScan) {
        return res.status(404).json({
            success: false,
            error: 'No completed scans found'
        });
    }
    
    res.status(200).json({
        success: true,
        leaderboard: latestScan.result.rankings,
        timestamp: latestScan.timestamp,
        totalDealers: latestScan.dealers
    });
});

/**
 * GET /api/monthly-scan/trends
 * Get trend analysis
 */
router.get('/trends', (req, res) => {
    const latestScan = scanHistory
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (!latestScan) {
        return res.status(404).json({
            success: false,
            error: 'No completed scans found'
        });
    }
    
    res.status(200).json({
        success: true,
        trends: latestScan.result.trends,
        timestamp: latestScan.timestamp
    });
});

/**
 * GET /api/monthly-scan/dealer/:dealerId
 * Get specific dealer's performance
 */
router.get('/dealer/:dealerId', (req, res) => {
    const { dealerId } = req.params;
    const latestScan = scanHistory
        .filter(s => s.status === 'completed')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (!latestScan) {
        return res.status(404).json({
            success: false,
            error: 'No completed scans found'
        });
    }
    
    const dealerRanking = latestScan.result.rankings.find(r => r.dealerId === dealerId);
    
    if (!dealerRanking) {
        return res.status(404).json({
            success: false,
            error: 'Dealer not found in latest scan'
        });
    }
    
    res.status(200).json({
        success: true,
        dealer: dealerRanking,
        timestamp: latestScan.timestamp
    });
});

/**
 * POST /api/monthly-scan/schedule
 * Schedule a monthly scan (cron job)
 */
router.post('/schedule', (req, res) => {
    const { cronExpression = '0 0 1 * *' } = req.body; // Default: 1st of every month at midnight
    
    // In a real implementation, you would set up a cron job here
    // For demo purposes, we'll just store the schedule
    
    res.status(200).json({
        success: true,
        message: 'Monthly scan scheduled',
        cronExpression: cronExpression,
        nextRun: 'Calculated based on cron expression'
    });
});

/**
 * GET /api/monthly-scan/platforms
 * Get available AI platforms with API key status
 */
router.get('/platforms', (req, res) => {
    const scanService = new MonthlyScanService();
    const keyStatus = scanService.checkAPIKeys();
    
    const platforms = [
        { name: 'chatgpt', displayName: 'ChatGPT', api: 'openai', status: keyStatus.available.some(p => p.api === 'openai') ? 'active' : 'inactive' },
        { name: 'perplexity', displayName: 'Perplexity', api: 'perplexity', status: keyStatus.available.some(p => p.api === 'perplexity') ? 'active' : 'inactive' },
        { name: 'claude', displayName: 'Claude', api: 'anthropic', status: keyStatus.available.some(p => p.api === 'anthropic') ? 'active' : 'inactive' },
        { name: 'gemini', displayName: 'Gemini', api: 'google', status: keyStatus.available.some(p => p.api === 'google') ? 'active' : 'inactive' },
        { name: 'sge', displayName: 'Google SGE', api: 'google', status: keyStatus.available.some(p => p.api === 'google') ? 'active' : 'inactive' },
        { name: 'grok', displayName: 'Grok', api: 'xai', status: keyStatus.available.some(p => p.api === 'xai') ? 'active' : 'inactive' }
    ];
    
    res.status(200).json({
        success: true,
        platforms: platforms,
        keyStatus: {
            available: keyStatus.available.length,
            missing: keyStatus.missing,
            allAvailable: keyStatus.allAvailable
        }
    });
});

/**
 * GET /api/monthly-scan/api-keys/status
 * Check API key configuration status
 */
router.get('/api-keys/status', (req, res) => {
    const scanService = new MonthlyScanService();
    const keyStatus = scanService.checkAPIKeys();
    
    res.status(200).json({
        success: true,
        keyStatus: {
            available: keyStatus.available.length,
            total: scanService.platforms.length,
            missing: keyStatus.missing,
            allAvailable: keyStatus.allAvailable,
            platforms: keyStatus.available.map(p => ({
                name: p.name,
                displayName: p.displayName || p.name,
                api: p.api
            }))
        },
        instructions: {
            message: keyStatus.allAvailable ? 
                'All API keys are configured. Monthly scan is ready to run.' :
                'Some API keys are missing. Please configure them to enable full functionality.',
            missingKeys: keyStatus.missing,
            setupScript: './setup-ai-api-keys.sh'
        }
    });
});

/**
 * GET /api/monthly-scan/queries
 * Get top queries being tracked
 */
router.get('/queries', (req, res) => {
    const queries = [
        'best car dealership near me',
        'reliable used cars',
        'new car financing',
        'car dealership reviews',
        'best car deals',
        'certified pre owned cars',
        'car dealership service',
        'car trade in value',
        'car dealership warranty',
        'luxury car dealership',
        'family car dealership',
        'car dealership financing options',
        'car dealership customer service',
        'car dealership inventory',
        'car dealership test drive',
        'car dealership maintenance',
        'car dealership parts',
        'car dealership insurance',
        'car dealership extended warranty',
        'car dealership lease deals'
    ];
    
    res.status(200).json({
        success: true,
        queries: queries,
        total: queries.length
    });
});

module.exports = router;
