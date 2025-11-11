import { z } from "zod";

// Metrics event schema
export const MetricsEvent = z.object({
  variantId: z.string().min(1),
  productId: z.string().optional(),
  impressions: z.number().int().nonnegative().optional(),
  clicks: z.number().int().nonnegative().optional(),
  conversions: z.number().int().nonnegative().optional(),
  revenue: z.number().nonnegative().optional(),
  causalId: z.string().max(64).optional(),
});

export const MetricsBatch = z.array(MetricsEvent).max(5000);

// SEO variant schema
export const SeoVariant = z.object({
  id: z.string().min(1),
  tenantId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  url: z.string().url(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Prior schema
export const Prior = z.object({
  variantId: z.string().min(1),
  tenantId: z.string().uuid(),
  alpha: z.number().positive(),
  beta: z.number().positive(),
  updatedAt: z.date().default(() => new Date()),
});

// Allocation request schema
export const AllocationRequest = z.object({
  variantIds: z.array(z.string()).min(1).max(100),
  traffic: z.number().positive().max(10000),
  tenantId: z.string().uuid(),
});

// Webhook signature validation
export const WebhookSignature = z.object({
  signature: z.string().min(1),
  timestamp: z.string().min(1),
  body: z.string().min(1),
});

// API response schemas
export const ApiResponse = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponse = ApiResponse.extend({
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }).optional(),
});

// Error response schema
export const ErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
});

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

// Type exports
export type MetricsEventType = z.infer<typeof MetricsEvent>;
export type MetricsBatchType = z.infer<typeof MetricsBatch>;
export type SeoVariantType = z.infer<typeof SeoVariant>;
export type PriorType = z.infer<typeof Prior>;
export type AllocationRequestType = z.infer<typeof AllocationRequest>;
export type WebhookSignatureType = z.infer<typeof WebhookSignature>;
export type ApiResponseType = z.infer<typeof ApiResponse>;
export type PaginatedResponseType = z.infer<typeof PaginatedResponse>;
export type ErrorResponseType = z.infer<typeof ErrorResponse>;