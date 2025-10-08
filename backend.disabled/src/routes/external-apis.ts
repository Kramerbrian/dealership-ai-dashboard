import { Router } from 'express';
import axios from 'axios';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  extractUserContext, 
  requirePermission, 
  enforceTenantAccess 
} from '../middleware/rbac';
import { config } from '../config/config';

const router = Router();

// Apply RBAC middleware to all routes
router.use(extractUserContext);
router.use(enforceTenantAccess);

// Google Analytics Data API Proxy
router.post('/analytics', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { propertyId, startDate, endDate, metrics, dimensions } = req.body;
      
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      const response = await axios.post(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          dateRanges: [
            {
              startDate: startDate || '7daysAgo',
              endDate: endDate || 'today'
            }
          ],
          metrics: metrics || [
            { name: 'sessions' },
            { name: 'users' },
            { name: 'pageviews' },
            { name: 'bounceRate' }
          ],
          dimensions: dimensions || [
            { name: 'date' },
            { name: 'deviceCategory' }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(response.data);
    } catch (error: any) {
      console.error('Google Analytics API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch analytics data',
        details: error.response?.data || error.message
      });
    }
  })
);

// Google PageSpeed Insights API Proxy
router.get('/pagespeed', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { url, strategy = 'mobile' } = req.query;
      
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      const response = await axios.get(
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
        {
          params: {
            url: url as string,
            key: config.google.pagespeedApiKey,
            strategy: strategy as string,
            category: ['PERFORMANCE', 'ACCESSIBILITY', 'SEO', 'BEST_PRACTICES']
          }
        }
      );
      
      res.json(response.data);
    } catch (error: any) {
      console.error('PageSpeed API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch PageSpeed data',
        details: error.response?.data || error.message
      });
    }
  })
);

// Google Business Profile API Proxy
router.get('/business-profile', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { accountId, locationId } = req.query;
      
      if (!accountId || !locationId) {
        return res.status(400).json({ error: 'Account ID and Location ID are required' });
      }

      const response = await axios.get(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations/${locationId}`,
        {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(response.data);
    } catch (error: any) {
      console.error('Google Business Profile API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch business profile data',
        details: error.response?.data || error.message
      });
    }
  })
);

// SEMrush API Proxy
router.get('/semrush', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { domain, type = 'domain_ranks' } = req.query;
      
      if (!domain) {
        return res.status(400).json({ error: 'Domain parameter is required' });
      }

      const response = await axios.get(
        'https://api.semrush.com/',
        {
          params: {
            type: type as string,
            key: config.seo.semrushApiKey,
            domain: domain as string,
            database: 'us',
            export_columns: 'Rk,Or,Ot,Oc,Ad,At,Ac,Ab,Af,Ag,Ah,Ai,Aj,Ak,Al,Am,An,Ao,Ap,Aq,Ar,As,At,Au,Av,Aw,Ax,Ay,Az'
          }
        }
      );
      
      res.json(response.data);
    } catch (error: any) {
      console.error('SEMrush API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch SEMrush data',
        details: error.response?.data || error.message
      });
    }
  })
);

// Yelp API Proxy
router.get('/yelp', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { businessId, term, location } = req.query;
      
      let url = 'https://api.yelp.com/v3/businesses';
      
      if (businessId) {
        url += `/${businessId}`;
      } else if (term && location) {
        url += '/search';
      } else {
        return res.status(400).json({ error: 'Either businessId or term+location are required' });
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${config.reviews.yelpApiKey}`,
          'Content-Type': 'application/json'
        },
        params: businessId ? {} : {
          term: term as string,
          location: location as string,
          limit: 20
        }
      });
      
      res.json(response.data);
    } catch (error: any) {
      console.error('Yelp API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch Yelp data',
        details: error.response?.data || error.message
      });
    }
  })
);

// OpenAI API Proxy for AI Citation Analysis
router.post('/ai-citations', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { businessName, location, analysisType = 'citations' } = req.body;
      
      if (!businessName || !location) {
        return res.status(400).json({ error: 'Business name and location are required' });
      }

      const prompt = analysisType === 'citations' 
        ? `Analyze AI platform citations for "${businessName}" in ${location}. Provide insights on local SEO visibility, citation consistency, and recommendations for improvement.`
        : `Analyze the online presence and reputation for "${businessName}" in ${location}. Focus on review sentiment, local search visibility, and competitive positioning.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in local SEO and automotive dealership marketing. Provide detailed, actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${config.ai.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json({
        analysis: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      });
    } catch (error: any) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to generate AI analysis',
        details: error.response?.data || error.message
      });
    }
  })
);

// Google Search Console API Proxy (Free alternative to SEMrush)
router.get('/search-console', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { siteUrl, startDate, endDate } = req.query;
      
      if (!siteUrl) {
        return res.status(400).json({ error: 'Site URL is required' });
      }

      const response = await axios.post(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl as string)}/searchAnalytics/query`,
        {
          startDate: startDate || '2024-01-01',
          endDate: endDate || new Date().toISOString().split('T')[0],
          dimensions: ['query', 'page', 'device'],
          rowLimit: 1000,
          startRow: 0
        },
        {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization?.replace('Bearer ', '')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      res.json(response.data);
    } catch (error: any) {
      console.error('Google Search Console API Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to fetch Search Console data',
        details: error.response?.data || error.message
      });
    }
  })
);

// Batch API endpoint for multiple data sources
router.post('/batch-analysis', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    try {
      const { dealershipUrl, businessName, location } = req.body;
      
      if (!dealershipUrl || !businessName || !location) {
        return res.status(400).json({ 
          error: 'Dealership URL, business name, and location are required' 
        });
      }

      const results: any = {
        timestamp: new Date().toISOString(),
        dealership: { url: dealershipUrl, name: businessName, location }
      };

      // Run all analyses in parallel
      const promises: Promise<any>[] = [];

      // PageSpeed analysis
      promises.push(
        axios.get(`/api/external-apis/pagespeed?url=${encodeURIComponent(dealershipUrl)}`, {
          headers: req.headers
        }).then(r => ({ pagespeed: r.data })).catch(e => ({ pagespeed: { error: e.message } }))
      );

      // SEMrush analysis (if API key available)
      if (config.seo.semrushApiKey) {
        const domain = new URL(dealershipUrl).hostname;
        promises.push(
          axios.get(`/api/external-apis/semrush?domain=${domain}`, {
            headers: req.headers
          }).then(r => ({ semrush: r.data })).catch(e => ({ semrush: { error: e.message } }))
        );
      }

      // Yelp analysis
      promises.push(
        axios.get(`/api/external-apis/yelp?term=${encodeURIComponent(businessName)}&location=${encodeURIComponent(location)}`, {
          headers: req.headers
        }).then(r => ({ yelp: r.data })).catch(e => ({ yelp: { error: e.message } }))
      );

      // AI citation analysis
      promises.push(
        axios.post('/api/external-apis/ai-citations', {
          businessName,
          location,
          analysisType: 'citations'
        }, {
          headers: req.headers
        }).then(r => ({ aiAnalysis: r.data })).catch(e => ({ aiAnalysis: { error: e.message } }))
      );

      const batchResults = await Promise.all(promises);
      
      // Merge results
      batchResults.forEach(result => {
        Object.assign(results, result);
      });

      res.json(results);
    } catch (error: any) {
      console.error('Batch Analysis Error:', error.message);
      res.status(500).json({ 
        error: 'Failed to complete batch analysis',
        details: error.message
      });
    }
  })
);

export default router;
