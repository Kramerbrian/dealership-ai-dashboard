/**
 * Utility for making API calls that work both server-side and client-side
 */
export function getApiUrl(path: string): string {
  // Server-side: use absolute URL
  if (typeof window === 'undefined') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    return `${baseUrl}${path}`;
  }
  // Client-side: use relative URL
  return path;
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...options,
    cache: 'no-store',
  });
}

