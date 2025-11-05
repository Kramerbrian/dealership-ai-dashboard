/**
 * API Route Template
 * Copy this template when creating new API routes or migrating existing ones
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { /* yourSchema */ } from '@/lib/validation/schemas';
import { validateRequestBody, validateQueryParams } from '@/lib/validation/schemas';
import { cachedResponse, errorResponse, noCacheResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

// ============================================
// TEMPLATE 1: GET Route with Query Validation
// ============================================
export const GET = createApiRoute(
  {
    endpoint: '/api/your-endpoint',
    requireAuth: true, // Set to false for public endpoints
    validateQuery: undefined, // Optional: validate query params (replace with yourQuerySchema)
    rateLimit: true, // Rate limiting enabled
    performanceMonitoring: true, // Performance tracking enabled
  },
  async (req, auth) => {
    // auth is guaranteed to be non-null if requireAuth is true
    // auth is null if requireAuth is false
    
    try {
      // If you need validated query params (even though wrapper validates)
      const queryValidation = validateQueryParams(req, /* yourQuerySchema */);
      if (!queryValidation.success) {
        return queryValidation.response;
      }
      
      const { /* destructure validated params */ } = queryValidation.data;
      
      // Your business logic here
      const data = await fetchData(/* params */);
      
      // Return cached response for GET routes
      return cachedResponse(
        data,
        300, // 5 min cache
        600, // 10 min stale
        [CACHE_TAGS.YOUR_TAG] // Optional cache tags
      );
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/your-endpoint',
        userId: auth?.userId,
      });
    }
  }
);

// ============================================
// TEMPLATE 2: POST Route with Body Validation
// ============================================
export const POST = createApiRoute(
  {
    endpoint: '/api/your-endpoint',
    requireAuth: true,
    validateBody: undefined, // Validates request body (replace with yourBodySchema)
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      // Body validation handled by wrapper, but access validated data
      const bodyValidation = await validateRequestBody(req, /* yourBodySchema */);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }
      
      const { /* destructure validated body */ } = bodyValidation.data;
      
      // Your business logic here
      const result = await createData(/* validated data */, auth.userId);
      
      // POST routes typically don't cache
      return noCacheResponse(
        { success: true, data: result },
        201 // Created status
      );
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/your-endpoint',
        userId: auth.userId,
      });
    }
  }
);

// ============================================
// TEMPLATE 3: PUT/PATCH Route for Updates
// ============================================
export const PUT = createApiRoute(
  {
    endpoint: '/api/your-endpoint',
    requireAuth: true,
    validateBody: undefined, // Replace with yourUpdateSchema
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      const bodyValidation = await validateRequestBody(req, /* yourUpdateSchema */);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }
      
      const { /* destructure */ } = bodyValidation.data;
      
      // Update logic
      const updated = await updateData(/* data */, auth.userId);
      
      return NextResponse.json({
        success: true,
        data: updated,
      });
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/your-endpoint',
        userId: auth.userId,
      });
    }
  }
);

// ============================================
// TEMPLATE 4: DELETE Route
// ============================================
export const DELETE = createApiRoute(
  {
    endpoint: '/api/your-endpoint',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      // Get ID from URL params (for dynamic routes)
      const id = req.nextUrl.pathname.split('/').pop();
      
      // Validate ID if needed
      // const idValidation = uuidSchema.safeParse(id);
      // if (!idValidation.success) { ... }
      
      // Delete logic
      await deleteData(id, auth.userId);
      
      return NextResponse.json({
        success: true,
        message: 'Deleted successfully',
      });
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/your-endpoint',
        userId: auth.userId,
      });
    }
  }
);

// ============================================
// TEMPLATE 5: Public Endpoint (No Auth)
// ============================================
export const GET = createApiRoute(
  {
    endpoint: '/api/public-endpoint',
    requireAuth: false, // Public endpoint
    rateLimit: true, // Still rate limited (prevents abuse)
    performanceMonitoring: true,
  },
  async (req, auth) => {
    // auth is null for public endpoints
    
    try {
      // Public data
      const data = await fetchPublicData();
      
      return cachedResponse(data, 60, 300); // Shorter cache for public data
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/public-endpoint',
      });
    }
  }
);

