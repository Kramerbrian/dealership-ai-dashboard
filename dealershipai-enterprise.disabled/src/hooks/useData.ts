import useSWR, { SWRConfiguration } from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.info = await res.json()
    error.status = res.status
    throw error
  }
  return res.json()
}

// Real-time configuration for critical data
const realtimeConfig: SWRConfiguration = {
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 10000, // 10 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

// Standard configuration for less critical data
const standardConfig: SWRConfiguration = {
  refreshInterval: 60000, // 1 minute
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 30000, // 30 seconds
  errorRetryCount: 2,
  errorRetryInterval: 10000,
}

export function useAIHealth() {
  const { data, error, isLoading, mutate } = useSWR('/api/ai-health', fetcher, realtimeConfig)
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

export function useWebsite() {
  const { data, error, isLoading, mutate } = useSWR('/api/website', fetcher, standardConfig)
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

export function useSchema() {
  const { data, error, isLoading, mutate } = useSWR('/api/schema', fetcher, standardConfig)
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

export function useReviews() {
  const { data, error, isLoading, mutate } = useSWR('/api/reviews', fetcher, realtimeConfig)
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

export function useWarRoom() {
  const { data, error, isLoading, mutate } = useSWR('/api/war-room', fetcher, realtimeConfig)
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR('/api/settings', fetcher, standardConfig)
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

// Dealer-scoped hooks with tenant isolation
export function useDealerAIHealth(dealerId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    dealerId ? `/api/dealers/${dealerId}/ai-health` : null, 
    fetcher, 
    realtimeConfig
  )
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

export function useDealerWebsite(dealerId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    dealerId ? `/api/dealers/${dealerId}/website` : null, 
    fetcher, 
    standardConfig
  )
  return { 
    data, 
    error, 
    isLoading, 
    mutate,
    isError: !!error,
    refresh: () => mutate()
  }
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  key: string,
  fetcher: (url: string) => Promise<T>,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, config)
  
  const optimisticUpdate = async (newData: T, revalidate = true) => {
    // Optimistically update the UI
    mutate(newData, false)
    
    if (revalidate) {
      // Revalidate in the background
      mutate()
    }
  }
  
  return {
    data,
    error,
    isLoading,
    mutate,
    optimisticUpdate,
    isError: !!error
  }
}
