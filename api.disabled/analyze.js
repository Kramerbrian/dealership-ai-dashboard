const express = require('express');
const DataIntegrationService = require('../lib/data-integration');
const { supabaseAdmin } = require('../lib/supabase');

const router = express.Router();
const dataIntegration = new DataIntegrationService();

// Initialize the service
dataIntegration.initialize().catch(console.error);

/**
 * POST /api/analyze
 * Analyze a dealership website
 */
router.post('/', async (req, res) => {
    try {
        const { dealershipUrl, userId, plan = 'free' } = req.body;

        if (!dealershipUrl) {
            return res.status(400).json({
                error: 'Dealership URL is required'
            });
        }

        // Validate URL
        try {
            new URL(dealershipUrl);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid URL format'
            });
        }

        // Check user's analysis limit based on plan
        if (userId) {
            const analysisCount = await getAnalysisCount(userId);
            const planLimits = {
                free: 1,
                starter: 5,
                pro: -1 // unlimited
            };

            const limit = planLimits[plan] || planLimits.free;
            if (limit !== -1 && analysisCount >= limit) {
                return res.status(403).json({
                    error: 'Analysis limit reached for your plan',
                    limit: limit,
                    current: analysisCount,
                    upgradeRequired: true
                });
            }
        }

        // Start analysis
        console.log(`Starting analysis for ${dealershipUrl}`);
        
        const results = await dataIntegration.analyzeDealership(dealershipUrl, userId);

        // Return results based on plan
        const response = {
            analysisId: results.analysisId,
            dealershipUrl: results.dealershipUrl,
            timestamp: results.timestamp,
            processingTime: results.processingTime,
            aiVisibilityScore: results.aiVisibilityScore,
            data: {}
        };

        // Free plan: limited data
        if (plan === 'free') {
            response.data = {
                basicInfo: {
                    title: results.data.website?.title,
                    description: results.data.website?.description,
                    domain: results.data.website?.domain
                },
                score: results.aiVisibilityScore,
                topIssues: results.data.aiInsights?.recommendations?.slice(0, 3) || [],
                upgradePrompt: {
                    message: "Unlock detailed insights with a paid plan",
                    features: [
                        "Detailed SEO analysis",
                        "Social media insights",
                        "Competitor analysis",
                        "AI-powered recommendations"
                    ]
                }
            };
        } else {
            // Paid plans: full data
            response.data = results.data;
        }

        res.json(response);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message
        });
    }
});

/**
 * GET /api/analyze/:analysisId
 * Get analysis results by ID
 */
router.get('/:analysisId', async (req, res) => {
    try {
        const { analysisId } = req.params;
        const { userId, plan = 'free' } = req.query;

        if (!userId) {
            return res.status(401).json({
                error: 'User ID required'
            });
        }

        // Get analysis from database
        const { data: analysis, error } = await supabaseAdmin
            .from('analyses')
            .select('*')
            .eq('id', analysisId)
            .eq('user_id', userId)
            .single();

        if (error || !analysis) {
            return res.status(404).json({
                error: 'Analysis not found'
            });
        }

        // Return data based on plan
        const response = {
            analysisId: analysis.id,
            dealershipUrl: analysis.dealership_url,
            timestamp: analysis.created_at,
            aiVisibilityScore: analysis.ai_visibility_score,
            data: {}
        };

        if (plan === 'free') {
            // Free plan: limited data
            const results = analysis.results;
            response.data = {
                basicInfo: {
                    title: results.data?.website?.title,
                    description: results.data?.website?.description,
                    domain: results.data?.website?.domain
                },
                score: analysis.ai_visibility_score,
                topIssues: results.data?.aiInsights?.recommendations?.slice(0, 3) || []
            };
        } else {
            // Paid plans: full data
            response.data = analysis.results.data;
        }

        res.json(response);

    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({
            error: 'Failed to retrieve analysis',
            message: error.message
        });
    }
});

/**
 * GET /api/analyze/user/:userId
 * Get all analyses for a user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { plan = 'free', limit = 10, offset = 0 } = req.query;

        // Get user's analyses
        const { data: analyses, error } = await supabaseAdmin
            .from('analyses')
            .select('id, dealership_url, ai_visibility_score, created_at, is_premium')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return res.status(500).json({
                error: 'Failed to retrieve analyses',
                message: error.message
            });
        }

        // Format response based on plan
        const response = analyses.map(analysis => ({
            analysisId: analysis.id,
            dealershipUrl: analysis.dealership_url,
            timestamp: analysis.created_at,
            aiVisibilityScore: analysis.ai_visibility_score,
            isPremium: analysis.is_premium,
            accessible: plan !== 'free' || !analysis.is_premium
        }));

        res.json({
            analyses: response,
            total: analyses.length,
            hasMore: analyses.length === limit
        });

    } catch (error) {
        console.error('Get user analyses error:', error);
        res.status(500).json({
            error: 'Failed to retrieve user analyses',
            message: error.message
        });
    }
});

/**
 * DELETE /api/analyze/:analysisId
 * Delete an analysis
 */
router.delete('/:analysisId', async (req, res) => {
    try {
        const { analysisId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                error: 'User ID required'
            });
        }

        // Delete analysis
        const { error } = await supabaseAdmin
            .from('analyses')
            .delete()
            .eq('id', analysisId)
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({
                error: 'Failed to delete analysis',
                message: error.message
            });
        }

        res.json({
            message: 'Analysis deleted successfully'
        });

    } catch (error) {
        console.error('Delete analysis error:', error);
        res.status(500).json({
            error: 'Failed to delete analysis',
            message: error.message
        });
    }
});

/**
 * Helper function to get user's analysis count
 */
async function getAnalysisCount(userId) {
    try {
        const { count, error } = await supabaseAdmin
            .from('analyses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            console.error('Error getting analysis count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Error getting analysis count:', error);
        return 0;
    }
}

module.exports = router;
