// ETag Helpers
// DealershipAI - Efficient HTTP Caching with ETag Support

import crypto from "crypto";

/**
 * Generate ETag for any object
 * Creates a SHA1 hash of the JSON stringified object, base64 encoded
 */
export const etagOf = (o: unknown): string => {
  const jsonString = JSON.stringify(o, null, 0); // No formatting for consistent hashing
  const hash = crypto.createHash("sha1").update(jsonString).digest("base64");
  return `"${hash}"`;
};

/**
 * Create ETag-aware HTTP response
 * Returns 304 Not Modified if client has current version, otherwise returns data with ETag
 */
export function withETag(req: Request, data: unknown): Response {
  const etag = etagOf(data);
  const ifNoneMatch = req.headers.get("if-none-match");
  
  // If client has current version, return 304 Not Modified
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, { 
      status: 304, 
      headers: { 
        ETag: etag,
        "cache-control": "no-store" // Prevent caching of 304 responses
      } 
    });
  }
  
  // Return data with ETag for future conditional requests
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 
      "content-type": "application/json", 
      ETag: etag, 
      "cache-control": "no-store" // Prevent caching, rely on ETag for efficiency
    }
  });
}

/**
 * Create ETag-aware response with custom headers
 */
export function withETagAndHeaders(
  req: Request, 
  data: unknown, 
  additionalHeaders: Record<string, string> = {}
): Response {
  const etag = etagOf(data);
  const ifNoneMatch = req.headers.get("if-none-match");
  
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new Response(null, { 
      status: 304, 
      headers: { 
        ETag: etag,
        "cache-control": "no-store",
        ...additionalHeaders
      } 
    });
  }
  
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { 
      "content-type": "application/json", 
      ETag: etag, 
      "cache-control": "no-store",
      ...additionalHeaders
    }
  });
}

/**
 * Check if request has valid ETag for given data
 * Useful for conditional operations (PUT, PATCH, DELETE)
 */
export function hasValidETag(req: Request, data: unknown): boolean {
  const etag = etagOf(data);
  const ifMatch = req.headers.get("if-match");
  return ifMatch === etag;
}

/**
 * Create ETag for database row or query result
 * Handles common database response formats
 */
export function etagOfDbResult(result: any): string {
  // Handle different database response formats
  if (Array.isArray(result)) {
    return etagOf(result);
  }
  
  if (result && typeof result === 'object') {
    // Handle Drizzle/Prisma style results
    if (result.rows) {
      return etagOf(result.rows);
    }
    if (result.data) {
      return etagOf(result.data);
    }
    return etagOf(result);
  }
  
  return etagOf(result);
}

/**
 * Create conditional response for database operations
 * Returns 412 Precondition Failed if ETag doesn't match
 */
export function withConditionalETag(
  req: Request, 
  data: unknown, 
  operation: () => Response
): Response {
  const ifMatch = req.headers.get("if-match");
  
  if (ifMatch && !hasValidETag(req, data)) {
    return new Response(
      JSON.stringify({ error: "Precondition failed", message: "Resource has been modified" }), 
      { 
        status: 412, 
        headers: { "content-type": "application/json" } 
      }
    );
  }
  
  return operation();
}

/**
 * Utility to add ETag headers to existing response
 */
export function addETagHeaders(response: Response, data: unknown): Response {
  const etag = etagOf(data);
  const headers = new Headers(response.headers);
  headers.set("ETag", etag);
  headers.set("cache-control", "no-store");
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
