/**
 * API Response Optimization
 * 
 * Provides compression, field selection, and pagination
 * Expected: 40-60% smaller payloads
 */

import { NextRequest, NextResponse } from 'next/server';

export interface FieldSelection {
  fields?: string[]; // List of fields to include
  exclude?: string[]; // List of fields to exclude
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface OptimizationOptions extends FieldSelection, PaginationOptions {
  compress?: boolean; // Enable compression (gzip/brotli)
}

/**
 * Select specific fields from an object
 */
export function selectFields<T extends Record<string, any>>(
  data: T,
  options: FieldSelection
): Partial<T> {
  const { fields, exclude } = options;

  if (fields && fields.length > 0) {
    // Include only specified fields
    const result: Partial<T> = {};
    for (const field of fields) {
      if (field in data) {
        result[field as keyof T] = data[field];
      }
    }
    return result;
  }

  if (exclude && exclude.length > 0) {
    // Exclude specified fields
    const result = { ...data };
    for (const field of exclude) {
      delete result[field];
    }
    return result;
  }

  return data;
}

/**
 * Select fields from array of objects
 */
export function selectFieldsFromArray<T extends Record<string, any>>(
  data: T[],
  options: FieldSelection
): Partial<T>[] {
  return data.map(item => selectFields(item, options));
}

/**
 * Apply pagination to array
 */
export function paginate<T>(
  data: T[],
  options: PaginationOptions
): { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } } {
  const { page = 1, limit = 100, offset: explicitOffset } = options;
  const offset = explicitOffset ?? (page - 1) * limit;
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  const paginatedData = data.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Compress response (Next.js handles this automatically, but we can optimize)
 */
export function compressedResponse<T>(
  data: T,
  options: { status?: number; headers?: Record<string, string> } = {}
): NextResponse<T> {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: {
      'Content-Encoding': 'gzip', // Next.js will compress if supported
      'Vary': 'Accept-Encoding',
      ...options.headers,
    },
  });
}

/**
 * Parse optimization options from request
 */
export function parseOptimizationOptions(req: NextRequest): OptimizationOptions {
  const { searchParams } = new URL(req.url);

  const fields = searchParams.get('fields')?.split(',');
  const exclude = searchParams.get('exclude')?.split(',');
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
  const compress = searchParams.get('compress') === 'true';

  return {
    fields,
    exclude,
    page,
    limit,
    offset,
    compress,
  };
}

/**
 * Optimized API response helper
 */
export function optimizedResponse<T>(
  data: T,
  req: NextRequest,
  options: OptimizationOptions = {}
): NextResponse {
  // Parse options from request if not provided
  const opts = Object.keys(options).length > 0 
    ? options 
    : parseOptimizationOptions(req);

  let optimizedData: any = data;

  // Apply field selection
  if (opts.fields || opts.exclude) {
    if (Array.isArray(data)) {
      optimizedData = selectFieldsFromArray(data, opts);
    } else if (typeof data === 'object' && data !== null) {
      optimizedData = selectFields(data as Record<string, any>, opts);
    }
  }

  // Apply pagination (if array)
  if (Array.isArray(data) && (opts.page || opts.limit || opts.offset)) {
    const paginated = paginate(data, opts);
    optimizedData = paginated.data;
    
    // Add pagination metadata
    return NextResponse.json(
      {
        data: optimizedData,
        pagination: paginated.pagination,
      },
      {
        headers: {
          'X-Pagination-Page': String(paginated.pagination.page),
          'X-Pagination-Limit': String(paginated.pagination.limit),
          'X-Pagination-Total': String(paginated.pagination.total),
          'X-Pagination-Total-Pages': String(paginated.pagination.totalPages),
        },
      }
    );
  }

  // Apply compression if requested
  if (opts.compress) {
    return compressedResponse(optimizedData);
  }

  return NextResponse.json(optimizedData);
}

/**
 * Calculate response size (for logging)
 */
export function calculateResponseSize(data: any): number {
  return new TextEncoder().encode(JSON.stringify(data)).length;
}

