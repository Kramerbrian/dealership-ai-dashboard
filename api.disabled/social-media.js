const express = require('express');
const axios = require('axios');

const router = express.Router();

/**
 * GET /api/social-media/facebook
 * Get Facebook page data
 */
router.get('/facebook', async (req, res) => {
    try {
        const { pageId, accessToken } = req.query;

        if (!pageId || !accessToken) {
            return res.status(400).json({
                error: 'Page ID and access token are required'
            });
        }

        // Get page insights
        const insights = await getFacebookInsights(pageId, accessToken);
        
        // Get page posts
        const posts = await getFacebookPosts(pageId, accessToken);
        
        // Get page info
        const pageInfo = await getFacebookPageInfo(pageId, accessToken);

        const response = {
            pageId,
            data: {
                info: pageInfo,
                insights: insights,
                posts: posts
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);

    } catch (error) {
        console.error('Facebook API error:', error);
        res.status(500).json({
            error: 'Failed to fetch Facebook data',
            message: error.message
        });
    }
});

/**
 * GET /api/social-media/yelp
 * Get Yelp business data
 */
router.get('/yelp', async (req, res) => {
    try {
        const { businessId, apiKey } = req.query;

        if (!businessId || !apiKey) {
            return res.status(400).json({
                error: 'Business ID and API key are required'
            });
        }

        // Get business info
        const businessInfo = await getYelpBusinessInfo(businessId, apiKey);
        
        // Get reviews
        const reviews = await getYelpReviews(businessId, apiKey);

        const response = {
            businessId,
            data: {
                business: businessInfo,
                reviews: reviews
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);

    } catch (error) {
        console.error('Yelp API error:', error);
        res.status(500).json({
            error: 'Failed to fetch Yelp data',
            message: error.message
        });
    }
});

/**
 * GET /api/social-media/google-my-business
 * Get Google My Business data
 */
router.get('/google-my-business', async (req, res) => {
    try {
        const { locationId, apiKey } = req.query;

        if (!locationId || !apiKey) {
            return res.status(400).json({
                error: 'Location ID and API key are required'
            });
        }

        // Get location insights
        const insights = await getGMBInsights(locationId, apiKey);
        
        // Get reviews
        const reviews = await getGMBReviews(locationId, apiKey);
        
        // Get posts
        const posts = await getGMBPosts(locationId, apiKey);

        const response = {
            locationId,
            data: {
                insights: insights,
                reviews: reviews,
                posts: posts
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);

    } catch (error) {
        console.error('Google My Business API error:', error);
        res.status(500).json({
            error: 'Failed to fetch Google My Business data',
            message: error.message
        });
    }
});

/**
 * Helper functions for Facebook API
 */
async function getFacebookInsights(pageId, accessToken) {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/insights`, {
            params: {
                metric: 'page_impressions,page_reach,page_engaged_users,page_post_engagements',
                period: 'day',
                since: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
                until: Math.floor(Date.now() / 1000),
                access_token: accessToken
            }
        });

        return response.data.data;
    } catch (error) {
        console.error('Facebook insights error:', error);
        return null;
    }
}

async function getFacebookPosts(pageId, accessToken) {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}/posts`, {
            params: {
                fields: 'message,created_time,likes.summary(true),comments.summary(true),shares',
                limit: 10,
                access_token: accessToken
            }
        });

        return response.data.data;
    } catch (error) {
        console.error('Facebook posts error:', error);
        return [];
    }
}

async function getFacebookPageInfo(pageId, accessToken) {
    try {
        const response = await axios.get(`https://graph.facebook.com/v18.0/${pageId}`, {
            params: {
                fields: 'name,about,phone,website,location,fan_count,rating_count,overall_star_rating',
                access_token: accessToken
            }
        });

        return response.data;
    } catch (error) {
        console.error('Facebook page info error:', error);
        return null;
    }
}

/**
 * Helper functions for Yelp API
 */
async function getYelpBusinessInfo(businessId, apiKey) {
    try {
        const response = await axios.get(`https://api.yelp.com/v3/businesses/${businessId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Yelp business info error:', error);
        return null;
    }
}

async function getYelpReviews(businessId, apiKey) {
    try {
        const response = await axios.get(`https://api.yelp.com/v3/businesses/${businessId}/reviews`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return response.data.reviews;
    } catch (error) {
        console.error('Yelp reviews error:', error);
        return [];
    }
}

/**
 * Helper functions for Google My Business API
 */
async function getGMBInsights(locationId, apiKey) {
    try {
        const response = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}/insights`, {
            params: {
                key: apiKey
            }
        });

        return response.data;
    } catch (error) {
        console.error('GMB insights error:', error);
        return null;
    }
}

async function getGMBReviews(locationId, apiKey) {
    try {
        const response = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}/reviews`, {
            params: {
                key: apiKey
            }
        });

        return response.data.reviews;
    } catch (error) {
        console.error('GMB reviews error:', error);
        return [];
    }
}

async function getGMBPosts(locationId, apiKey) {
    try {
        const response = await axios.get(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}/posts`, {
            params: {
                key: apiKey
            }
        });

        return response.data.posts;
    } catch (error) {
        console.error('GMB posts error:', error);
        return [];
    }
}

module.exports = router;
