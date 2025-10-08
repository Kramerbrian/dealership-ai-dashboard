// Simple in-memory cache for development
// In production, use Redis or similar
const cache = new Map<string, { value: any; expires: number }>();

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      cache.delete(key);
      return null;
    }
    
    return cached.value as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttl: number = 86400 // 24 hours in seconds
): Promise<void> {
  try {
    const expires = Date.now() + (ttl * 1000);
    cache.set(key, { value, expires });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    cache.delete(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expires) {
      cache.delete(key);
    }
  }
}, 60000); // Clean up every minute
