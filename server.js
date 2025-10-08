const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// In-memory storage (replace with database in production)
const performanceData = [];
const errorLogs = [];
const pageSpeedCache = new Map();

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Performance Metrics Endpoint
app.post('/api/performance-metrics', (req, res) => {
    try {
        const { vitals, navigation, timestamp, url } = req.body;

        const metric = {
            id: Date.now() + Math.random(),
            timestamp: timestamp || Date.now(),
            url: url || req.headers.referer || 'unknown',
            vitals: {
                lcp: vitals?.lcp,
                fid: vitals?.fid,
                inp: vitals?.inp,
                cls: vitals?.cls,
                fcp: vitals?.fcp,
                ttfb: vitals?.ttfb
            },
            navigation: {
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
                loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
                transferSize: navigation?.transferSize,
                type: navigation?.type
            }
        };

        performanceData.push(metric);

        // Keep only last 1000 entries
        if (performanceData.length > 1000) {
            performanceData.shift();
        }

        console.log('📊 Performance metric recorded:', metric.url);

        res.json({ success: true, id: metric.id });
    } catch (error) {
        console.error('Error saving performance metrics:', error);
        res.status(500).json({ error: 'Failed to save metrics' });
    }
});

// Get performance metrics history
app.get('/api/performance-metrics', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const url = req.query.url;

    let filtered = performanceData;

    if (url) {
        filtered = performanceData.filter(m => m.url.includes(url));
    }

    const recent = filtered.slice(-limit);

    res.json({
        total: filtered.length,
        data: recent,
        averages: calculateAverages(recent)
    });
});

function calculateAverages(data) {
    if (data.length === 0) return null;

    const totals = data.reduce((acc, item) => {
        if (item.vitals.lcp) acc.lcp += item.vitals.lcp;
        if (item.vitals.fid) acc.fid += item.vitals.fid;
        if (item.vitals.cls) acc.cls += item.vitals.cls;
        acc.count++;
        return acc;
    }, { lcp: 0, fid: 0, cls: 0, count: 0 });

    return {
        lcp: (totals.lcp / totals.count).toFixed(2),
        fid: (totals.fid / totals.count).toFixed(2),
        cls: (totals.cls / totals.count).toFixed(4)
    };
}

// 2. Error Scanning Endpoint
app.post('/api/error-scan', async (req, res) => {
    try {
        const { urls, baseUrl } = req.body;

        if (!urls || !Array.isArray(urls)) {
            return res.status(400).json({ error: 'URLs array required' });
        }

        console.log(`🔍 Scanning ${urls.length} URLs for errors...`);

        const results = await Promise.all(
            urls.map(async (url) => {
                try {
                    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
                    const response = await fetch(fullUrl, {
                        method: 'HEAD',
                        timeout: 5000
                    });

                    return {
                        url: url,
                        statusCode: response.status,
                        statusText: response.statusText,
                        ok: response.ok,
                        timestamp: Date.now()
                    };
                } catch (error) {
                    return {
                        url: url,
                        statusCode: 0,
                        statusText: error.message,
                        ok: false,
                        error: true,
                        timestamp: Date.now()
                    };
                }
            })
        );

        const errors = results.filter(r => !r.ok);
        const error4xx = errors.filter(e => e.statusCode >= 400 && e.statusCode < 500);
        const error5xx = errors.filter(e => e.statusCode >= 500);

        // Store errors
        errors.forEach(err => {
            errorLogs.push({
                ...err,
                id: Date.now() + Math.random()
            });
        });

        // Keep only last 500 errors
        if (errorLogs.length > 500) {
            errorLogs.splice(0, errorLogs.length - 500);
        }

        console.log(`✅ Scan complete: ${errors.length} errors found`);

        res.json({
            total: results.length,
            errors: errors.length,
            error4xx: error4xx.length,
            error5xx: error5xx.length,
            results: results
        });
    } catch (error) {
        console.error('Error scanning URLs:', error);
        res.status(500).json({ error: 'Failed to scan URLs' });
    }
});

// Get error logs
app.get('/api/error-logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const recent = errorLogs.slice(-limit);

    res.json({
        total: errorLogs.length,
        errors: recent
    });
});

// 3. SSL/Security Check Endpoint
app.post('/api/ssl-check', async (req, res) => {
    try {
        const { domain } = req.body;

        if (!domain) {
            return res.status(400).json({ error: 'Domain required' });
        }

        console.log(`🔒 Checking SSL for ${domain}...`);

        const result = await new Promise((resolve, reject) => {
            const options = {
                hostname: domain,
                port: 443,
                method: 'GET',
                rejectUnauthorized: false
            };

            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate();

                if (cert && Object.keys(cert).length > 0) {
                    resolve({
                        valid: true,
                        issuer: cert.issuer?.O || 'Unknown',
                        subject: cert.subject?.CN || domain,
                        validFrom: cert.valid_from,
                        validTo: cert.valid_to,
                        daysRemaining: Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24)),
                        serialNumber: cert.serialNumber,
                        fingerprint: cert.fingerprint
                    });
                } else {
                    resolve({ valid: false, error: 'No certificate found' });
                }
            });

            req.on('error', (err) => {
                resolve({ valid: false, error: err.message });
            });

            req.end();
        });

        res.json(result);
    } catch (error) {
        console.error('SSL check error:', error);
        res.status(500).json({ error: 'Failed to check SSL' });
    }
});

// 4. PageSpeed API Proxy/Cache Endpoint
app.get('/api/pagespeed/:url', async (req, res) => {
    try {
        const url = decodeURIComponent(req.params.url);
        const strategy = req.query.strategy || 'mobile';
        const cacheKey = `${url}-${strategy}`;

        // Check cache (5 minute expiry)
        const cached = pageSpeedCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            console.log('📦 Returning cached PageSpeed data for:', url);
            return res.json({ ...cached.data, cached: true });
        }

        console.log(`🚀 Fetching PageSpeed data for ${url} (${strategy})...`);

        const apiKey = process.env.PAGESPEED_API_KEY || 'AIzaSyBVvR8Q_VqMVHCbvQGqG7LqVW0m8h6QDIY';
        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`PageSpeed API error: ${response.status}`);
        }

        const data = await response.json();

        const result = {
            score: Math.round(data.lighthouseResult.categories.performance.score * 100),
            metrics: {
                fcp: data.lighthouseResult.audits['first-contentful-paint']?.displayValue || 'N/A',
                lcp: data.lighthouseResult.audits['largest-contentful-paint']?.displayValue || 'N/A',
                cls: data.lighthouseResult.audits['cumulative-layout-shift']?.displayValue || 'N/A',
                tbt: data.lighthouseResult.audits['total-blocking-time']?.displayValue || 'N/A',
                si: data.lighthouseResult.audits['speed-index']?.displayValue || 'N/A',
                tti: data.lighthouseResult.audits['interactive']?.displayValue || 'N/A'
            },
            opportunities: Object.keys(data.lighthouseResult.audits)
                .filter(key => data.lighthouseResult.audits[key].details?.type === 'opportunity')
                .map(key => ({
                    id: key,
                    title: data.lighthouseResult.audits[key].title,
                    description: data.lighthouseResult.audits[key].description,
                    score: data.lighthouseResult.audits[key].score
                }))
        };

        // Cache the result
        pageSpeedCache.set(cacheKey, { data: result, timestamp: Date.now() });

        res.json(result);
    } catch (error) {
        console.error('PageSpeed error:', error);
        res.status(500).json({ error: 'Failed to fetch PageSpeed data' });
    }
});

// 5. Security Headers Check
app.get('/api/security-headers/:url', async (req, res) => {
    try {
        const url = decodeURIComponent(req.params.url);

        console.log(`🔐 Checking security headers for ${url}...`);

        const response = await fetch(url, { method: 'HEAD' });
        const headers = Object.fromEntries(response.headers);

        const securityHeaders = {
            'strict-transport-security': headers['strict-transport-security'],
            'content-security-policy': headers['content-security-policy'],
            'x-frame-options': headers['x-frame-options'],
            'x-content-type-options': headers['x-content-type-options'],
            'referrer-policy': headers['referrer-policy'],
            'permissions-policy': headers['permissions-policy']
        };

        const score = Object.values(securityHeaders).filter(v => v).length;
        const grade = score >= 5 ? 'A+' : score >= 4 ? 'A' : score >= 3 ? 'B' : score >= 2 ? 'C' : 'F';

        res.json({
            grade,
            score,
            maxScore: 6,
            headers: securityHeaders,
            recommendations: generateSecurityRecommendations(securityHeaders)
        });
    } catch (error) {
        console.error('Security headers check error:', error);
        res.status(500).json({ error: 'Failed to check security headers' });
    }
});

function generateSecurityRecommendations(headers) {
    const recommendations = [];

    if (!headers['strict-transport-security']) {
        recommendations.push('Add HSTS header for HTTPS enforcement');
    }
    if (!headers['content-security-policy']) {
        recommendations.push('Implement Content Security Policy');
    }
    if (!headers['x-frame-options']) {
        recommendations.push('Add X-Frame-Options to prevent clickjacking');
    }
    if (!headers['x-content-type-options']) {
        recommendations.push('Add X-Content-Type-Options: nosniff');
    }
    if (!headers['referrer-policy']) {
        recommendations.push('Set Referrer-Policy header');
    }
    if (!headers['permissions-policy']) {
        recommendations.push('Configure Permissions-Policy header');
    }

    return recommendations;
}

// ==========================================
// STATIC FILE SERVING
// ==========================================

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-old.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now(),
        metrics: {
            performanceData: performanceData.length,
            errorLogs: errorLogs.length,
            cacheSize: pageSpeedCache.size
        }
    });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
    console.log(`🚀 DealershipAI Dashboard API Server running`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🔌 API Endpoints:`);
    console.log(`   POST /api/performance-metrics - Store performance data`);
    console.log(`   GET  /api/performance-metrics - Get performance history`);
    console.log(`   POST /api/error-scan - Scan URLs for errors`);
    console.log(`   GET  /api/error-logs - Get error history`);
    console.log(`   POST /api/ssl-check - Check SSL certificate`);
    console.log(`   GET  /api/pagespeed/:url - Get PageSpeed Insights`);
    console.log(`   GET  /api/security-headers/:url - Check security headers`);
    console.log(`   GET  /health - Health check`);
    console.log('');
    console.log('💡 Ready to receive real-time performance metrics!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
