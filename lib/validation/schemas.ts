/**
 * Validation Schemas
 * Centralized Zod schemas for input validation
 */

import { z } from 'zod';

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Domain validation
export const domainSchema = z
  .string()
  .min(1, 'Domain is required')
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    'Invalid domain format'
  );

// URL validation
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .or(z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain format'));

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Date range validation
export const dateRangeSchema = z.enum(['7d', '30d', '90d', '365d'], {
  errorMap: () => ({ message: 'Invalid date range. Use: 7d, 30d, 90d, or 365d' }),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).optional(),
});

// Dealership schemas
export const dealershipIdSchema = uuidSchema;
export const dealershipSlugSchema = z.string().min(1).max(100);

export const dealershipCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  domain: domainSchema,
  slug: z.string().min(1).max(100).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default('US'),
  }).optional(),
});

export const dealershipUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  domain: domainSchema.optional(),
  slug: z.string().min(1).max(100).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// AI Analysis schemas
export const aiAnalysisRequestSchema = z.object({
  domain: domainSchema,
  dealershipSize: z.enum(['small', 'medium', 'large']).optional(),
  marketType: z.enum(['urban', 'suburban', 'rural']).optional(),
  aiAdoption: z.enum(['low', 'medium', 'high']).optional(),
});

// Dashboard schemas
export const dashboardQuerySchema = z.object({
  dealerId: z.string().min(1),
  timeRange: dateRangeSchema.default('30d'),
  ...paginationSchema.shape,
});

// Analytics schemas
export const analyticsTrackSchema = z.object({
  event: z.string().min(1),
  properties: z.record(z.any()).optional(),
  userId: uuidSchema.optional(),
  sessionId: z.string().optional(),
});

// Automation task schemas
export const automationTaskCreateSchema = z.object({
  dealershipId: uuidSchema,
  kind: z.enum(['schema_fix', 'gbp_optimization', 'content_update', 'data_sync']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

export const automationTaskUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'executed', 'failed']).optional(),
  metadata: z.record(z.any()).optional(),
});

// User schemas
export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  preferences: z.record(z.any()).optional(),
  // Additional fields for backward compatibility
  company: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  domain: domainSchema.optional(),
  role: z.string().max(100).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
});

// Compliance schemas
export const complianceAuditRequestSchema = z.object({
  dealershipId: uuidSchema,
  auditType: z.enum(['full', 'quick', 'focused']).default('quick'),
  focusAreas: z.array(z.string()).optional(),
});

// Search/Filter schemas
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape,
});

// File upload schemas
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  size: z.number().int().max(10 * 1024 * 1024), // 10MB max
  mimetype: z.string().regex(/^(text\/|application\/(json|xml|csv)|image\/(png|jpeg|jpg|gif|webp)|application\/pdf)/),
});

// Webhook schemas
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().or(z.number()),
});

// Stripe schemas
export const stripeCheckoutCreateSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  domain: domainSchema,
  plan: z.enum(['professional', 'enterprise', 'free', 'pro']),
});

export const stripeSessionVerifySchema = z.object({
  session_id: z.string().min(1),
});

// Subscription schemas
export const subscriptionCreateSchema = z.object({
  plan: z.enum(['professional', 'enterprise']),
});

// Usage schemas
export const usageQuerySchema = z.object({
  feature: z.string().optional(),
});

export const usageTrackSchema = z.object({
  feature: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

// Analysis schemas
export const analyzeDomainSchema = z.object({
  domain: domainSchema,
});

export const analyzeRequestSchema = z.object({
  url: z.string().url().optional(),
  revenue: z.number().min(0).optional(),
  marketSize: z.enum(['small', 'medium', 'large']).optional(),
  competition: z.enum(['low', 'moderate', 'high']).optional(),
  visibility: z.number().min(0).max(100).optional(),
});

// Dashboard schemas
export const dashboardTimeRangeSchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional(),
});

export const dashboardWebsiteQuerySchema = z.object({
  domain: domainSchema.optional(),
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional(),
});

export const dashboardReviewsQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional(),
  source: z.string().optional(),
});

// AI Analysis schemas
export const aiAnalysisRequestSchema = z.object({
  domain: domainSchema,
  dealershipSize: z.enum(['small', 'medium', 'large']).optional(),
  marketType: z.enum(['urban', 'suburban', 'rural']).optional(),
  aiAdoption: z.enum(['low', 'medium', 'high']).optional(),
});

// Validation helper functions
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const result = validateAndSanitize(schema, body);
    
    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            message: 'Invalid request data',
            errors: result.error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = validateAndSanitize(schema, searchParams);
  
  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Invalid query parameters',
          errors: result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      ),
    };
  }
  
  return { success: true, data: result.data };
}

