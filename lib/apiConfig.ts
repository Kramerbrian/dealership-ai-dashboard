// DealershipAI GPT API Configuration
export const DAI_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gpt.dealershipai.com'

export const DAI_API_KEY =
  process.env.NEXT_PUBLIC_DAI_API_KEY ||
  process.env.DAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  ''

// Legacy API base URL (for internal APIs)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://dealership-ai-dashboard.vercel.app/api'
    : 'http://localhost:3000/api')

export const ORCHESTRATOR_TOKEN = process.env.NEXT_PUBLIC_ORCHESTRATOR_TOKEN || ''

export function getApiBase() {
  return API_BASE_URL
}

/**
 * Build DealershipAI GPT API URL with query parameter authentication
 * ChatGPT Actions/Plugins require api_key as query parameter, not header
 */
export function buildDAIApiUrl(endpoint: string, params?: Record<string, string>): string {
  const baseUrl = DAI_API_BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  const url = new URL(`${baseUrl}${endpointPath}`)
  
  // Add API key as query parameter
  if (DAI_API_KEY) {
    url.searchParams.set('api_key', DAI_API_KEY)
  }
  
  // Add additional params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  
  return url.toString()
}

/**
 * Fetch from DealershipAI GPT API with query parameter auth
 */
export async function fetchDAIApi<T>(
  endpoint: string,
  params?: Record<string, string>,
  options?: RequestInit
): Promise<T> {
  const url = buildDAIApiUrl(endpoint, params)
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
  }
  
  return response.json()
}
