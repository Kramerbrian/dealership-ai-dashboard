const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

/**
 * GET /api/google-analytics
 * Get Google Analytics data for a dealership
 */
router.get('/', async (req, res) => {
    try {
        const { propertyId, startDate, endDate } = req.query;

        if (!propertyId) {
            return res.status(400).json({
                error: 'Property ID is required'
            });
        }

        // Initialize Google Analytics
        const analytics = google.analyticsreporting({
            version: 'v4',
            auth: new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_ANALYTICS_KEY_FILE,
                scopes: ['https://www.googleapis.com/auth/analytics.readonly']
            })
        });

        // Set date range
        const dateRange = {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today'
        };

        // Get basic metrics
        const basicMetrics = await getBasicMetrics(analytics, propertyId, dateRange);
        
        // Get traffic sources
        const trafficSources = await getTrafficSources(analytics, propertyId, dateRange);
        
        // Get top pages
        const topPages = await getTopPages(analytics, propertyId, dateRange);
        
        // Get device data
        const deviceData = await getDeviceData(analytics, propertyId, dateRange);
        
        // Get conversion data
        const conversionData = await getConversionData(analytics, propertyId, dateRange);

        const response = {
            propertyId,
            dateRange,
            data: {
                basic: basicMetrics,
                traffic: trafficSources,
                pages: topPages,
                devices: deviceData,
                conversions: conversionData
            },
            timestamp: new Date().toISOString()
        };

        res.json(response);

    } catch (error) {
        console.error('Google Analytics error:', error);
        res.status(500).json({
            error: 'Failed to fetch Google Analytics data',
            message: error.message
        });
    }
});

/**
 * Get basic metrics (sessions, users, pageviews, etc.)
 */
async function getBasicMetrics(analytics, propertyId, dateRange) {
    const request = {
        reportRequests: [{
            viewId: propertyId,
            dateRanges: [dateRange],
            metrics: [
                { expression: 'ga:sessions' },
                { expression: 'ga:users' },
                { expression: 'ga:pageviews' },
                { expression: 'ga:bounceRate' },
                { expression: 'ga:avgSessionDuration' },
                { expression: 'ga:goalCompletionsAll' }
            ]
        }]
    };

    const response = await analytics.reports.batchGet({ requestBody: request });
    const report = response.data.reports[0];
    const metrics = report.data.rows[0].metrics[0].values;

    return {
        sessions: parseInt(metrics[0]),
        users: parseInt(metrics[1]),
        pageviews: parseInt(metrics[2]),
        bounceRate: parseFloat(metrics[3]),
        avgSessionDuration: parseFloat(metrics[4]),
        goalCompletions: parseInt(metrics[5])
    };
}

/**
 * Get traffic sources
 */
async function getTrafficSources(analytics, propertyId, dateRange) {
    const request = {
        reportRequests: [{
            viewId: propertyId,
            dateRanges: [dateRange],
            dimensions: [{ name: 'ga:source' }, { name: 'ga:medium' }],
            metrics: [
                { expression: 'ga:sessions' },
                { expression: 'ga:users' },
                { expression: 'ga:bounceRate' }
            ],
            orderBys: [{ fieldName: 'ga:sessions', sortOrder: 'DESCENDING' }],
            pageSize: 10
        }]
    };

    const response = await analytics.reports.batchGet({ requestBody: request });
    const report = response.data.reports[0];
    
    return report.data.rows.map(row => ({
        source: row.dimensions[0],
        medium: row.dimensions[1],
        sessions: parseInt(row.metrics[0].values[0]),
        users: parseInt(row.metrics[0].values[1]),
        bounceRate: parseFloat(row.metrics[0].values[2])
    }));
}

/**
 * Get top pages
 */
async function getTopPages(analytics, propertyId, dateRange) {
    const request = {
        reportRequests: [{
            viewId: propertyId,
            dateRanges: [dateRange],
            dimensions: [{ name: 'ga:pagePath' }, { name: 'ga:pageTitle' }],
            metrics: [
                { expression: 'ga:pageviews' },
                { expression: 'ga:uniquePageviews' },
                { expression: 'ga:avgTimeOnPage' },
                { expression: 'ga:bounceRate' }
            ],
            orderBys: [{ fieldName: 'ga:pageviews', sortOrder: 'DESCENDING' }],
            pageSize: 10
        }]
    };

    const response = await analytics.reports.batchGet({ requestBody: request });
    const report = response.data.reports[0];
    
    return report.data.rows.map(row => ({
        path: row.dimensions[0],
        title: row.dimensions[1],
        pageviews: parseInt(row.metrics[0].values[0]),
        uniquePageviews: parseInt(row.metrics[0].values[1]),
        avgTimeOnPage: parseFloat(row.metrics[0].values[2]),
        bounceRate: parseFloat(row.metrics[0].values[3])
    }));
}

/**
 * Get device data
 */
async function getDeviceData(analytics, propertyId, dateRange) {
    const request = {
        reportRequests: [{
            viewId: propertyId,
            dateRanges: [dateRange],
            dimensions: [{ name: 'ga:deviceCategory' }],
            metrics: [
                { expression: 'ga:sessions' },
                { expression: 'ga:users' },
                { expression: 'ga:bounceRate' }
            ]
        }]
    };

    const response = await analytics.reports.batchGet({ requestBody: request });
    const report = response.data.reports[0];
    
    return report.data.rows.map(row => ({
        device: row.dimensions[0],
        sessions: parseInt(row.metrics[0].values[0]),
        users: parseInt(row.metrics[0].values[1]),
        bounceRate: parseFloat(row.metrics[0].values[2])
    }));
}

/**
 * Get conversion data
 */
async function getConversionData(analytics, propertyId, dateRange) {
    const request = {
        reportRequests: [{
            viewId: propertyId,
            dateRanges: [dateRange],
            metrics: [
                { expression: 'ga:goalCompletionsAll' },
                { expression: 'ga:goalValueAll' },
                { expression: 'ga:goalConversionRateAll' }
            ]
        }]
    };

    const response = await analytics.reports.batchGet({ requestBody: request });
    const report = response.data.reports[0];
    const metrics = report.data.rows[0].metrics[0].values;

    return {
        completions: parseInt(metrics[0]),
        value: parseFloat(metrics[1]),
        conversionRate: parseFloat(metrics[2])
    };
}

module.exports = router;
