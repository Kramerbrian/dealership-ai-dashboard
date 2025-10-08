import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { googleAuthService } from '../services/googleAuth';
import { extractUserContext, requirePermission } from '../middleware/rbac';

const router = Router();

// Apply user context extraction to all routes
router.use(extractUserContext);

/**
 * Initiate Google OAuth flow
 * GET /api/oauth/google/auth
 */
router.get('/google/auth', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const userContext = req.userContext!;
    const state = Buffer.from(JSON.stringify({ 
      userId: userContext.user.id,
      tenantId: userContext.tenant?.id 
    })).toString('base64');
    
    const authUrl = googleAuthService.getAuthUrl(state);
    res.json({ authUrl });
  })
);

/**
 * Handle Google OAuth callback
 * GET /api/oauth/google/callback
 */
router.get('/google/callback', 
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;
    
    if (error) {
      return res.status(400).json({ 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }
    
    if (!code) {
      return res.status(400).json({ 
        error: 'Authorization code is required' 
      });
    }
    
    try {
      // Decode state to get user context
      let userContext;
      if (state) {
        try {
          userContext = JSON.parse(Buffer.from(state as string, 'base64').toString());
        } catch {
          return res.status(400).json({ error: 'Invalid state parameter' });
        }
      }
      
      // Exchange code for tokens
      const tokenResponse = await googleAuthService.exchangeCodeForToken(code as string);
      
      // Get user info
      const userInfo = await googleAuthService.getUserInfo(tokenResponse.access_token);
      
      // Store tokens securely (in production, store in database)
      // For now, we'll return them to the frontend to store
      const response = {
        success: true,
        tokens: {
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          expires_in: tokenResponse.expires_in,
          token_type: tokenResponse.token_type
        },
        user: userInfo,
        userContext
      };
      
      // In production, redirect to frontend with tokens
      // For development, return JSON
      if (process.env.NODE_ENV === 'development') {
        res.json(response);
      } else {
        // Redirect to frontend with tokens in URL params (not recommended for production)
        const redirectUrl = new URL('/oauth/success', process.env.FRONTEND_URL || 'http://localhost:3000');
        redirectUrl.searchParams.set('tokens', JSON.stringify(response.tokens));
        res.redirect(redirectUrl.toString());
      }
      
    } catch (error: any) {
      console.error('OAuth callback error:', error.message);
      res.status(500).json({ 
        error: 'Failed to complete OAuth flow', 
        details: error.message 
      });
    }
  })
);

/**
 * Refresh Google access token
 * POST /api/oauth/google/refresh
 */
router.post('/google/refresh', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    
    try {
      const tokenResponse = await googleAuthService.refreshAccessToken(refresh_token);
      res.json({
        success: true,
        tokens: {
          access_token: tokenResponse.access_token,
          expires_in: tokenResponse.expires_in,
          token_type: tokenResponse.token_type
        }
      });
    } catch (error: any) {
      console.error('Token refresh error:', error.message);
      res.status(500).json({ 
        error: 'Failed to refresh token', 
        details: error.message 
      });
    }
  })
);

/**
 * Get Google Analytics properties
 * GET /api/oauth/google/analytics-properties
 */
router.get('/google/analytics-properties', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { access_token } = req.headers;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    try {
      const properties = await googleAuthService.getAnalyticsProperties(access_token as string);
      res.json({ properties });
    } catch (error: any) {
      console.error('Analytics properties error:', error.message);
      res.status(500).json({ 
        error: 'Failed to get Analytics properties', 
        details: error.message 
      });
    }
  })
);

/**
 * Get Google Business Profile accounts
 * GET /api/oauth/google/business-accounts
 */
router.get('/google/business-accounts', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { access_token } = req.headers;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    try {
      const accounts = await googleAuthService.getBusinessAccounts(access_token as string);
      res.json({ accounts });
    } catch (error: any) {
      console.error('Business accounts error:', error.message);
      res.status(500).json({ 
        error: 'Failed to get Business accounts', 
        details: error.message 
      });
    }
  })
);

/**
 * Get Google Search Console sites
 * GET /api/oauth/google/search-console-sites
 */
router.get('/google/search-console-sites', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { access_token } = req.headers;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    try {
      const sites = await googleAuthService.getSearchConsoleSites(access_token as string);
      res.json({ sites });
    } catch (error: any) {
      console.error('Search Console sites error:', error.message);
      res.status(500).json({ 
        error: 'Failed to get Search Console sites', 
        details: error.message 
      });
    }
  })
);

/**
 * Validate Google access token
 * GET /api/oauth/google/validate
 */
router.get('/google/validate', 
  requirePermission('can_view_analytics'),
  asyncHandler(async (req, res) => {
    const { access_token } = req.headers;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    try {
      const userInfo = await googleAuthService.getUserInfo(access_token as string);
      const isExpired = googleAuthService.isTokenExpired(access_token as string);
      
      res.json({
        valid: !isExpired,
        expired: isExpired,
        user: userInfo
      });
    } catch (error: any) {
      console.error('Token validation error:', error.message);
      res.status(401).json({ 
        error: 'Invalid or expired token', 
        details: error.message 
      });
    }
  })
);

export default router;
