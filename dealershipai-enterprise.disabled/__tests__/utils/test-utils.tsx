import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { TRPCProvider } from '@/lib/trpc-provider'

// Mock tRPC client for testing
const mockTRPCClient = {
  dealership: {
    getAll: {
      useQuery: jest.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    create: {
      useMutation: jest.fn(() => ({
        mutate: jest.fn(),
        isLoading: false,
        error: null,
      })),
    },
  },
  analytics: {
    getMetrics: {
      useQuery: jest.fn(() => ({
        data: {},
        isLoading: false,
        error: null,
      })),
    },
  },
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TRPCProvider>
      {children}
    </TRPCProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock user data
export const mockUser = {
  id: 'test-user-1',
  email: 'test@dealershipai.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'dealership_admin',
  tenantId: 'test-tenant-1',
  tenant: {
    id: 'test-tenant-1',
    name: 'Test Dealership',
    type: 'dealership',
    subscriptionTier: 'tier_1',
    subscriptionStatus: 'active',
    mrr: 499,
  },
}

// Mock dealership data
export const mockDealership = {
  id: '1',
  name: 'Test Dealership',
  domain: 'test.com',
  city: 'Test City',
  state: 'TC',
  tier: 1,
  established_date: new Date('2020-01-01'),
}

// Mock scoring data
export const mockScores = {
  seo: {
    score: 87,
    organicRankings: 85,
    brandedSearch: 90,
    backlinkAuthority: 80,
    contentIndexation: 85,
    localPackPresence: 90,
  },
  aeo: {
    score: 72,
    citationFrequency: 75,
    sourceAuthority: 70,
    answerCompleteness: 80,
    multiPlatformPresence: 65,
    sentimentQuality: 70,
  },
  geo: {
    score: 65,
    aiOverviewPresence: 60,
    featuredSnippetRate: 70,
    knowledgePanelCompleteness: 65,
    zeroClickDominance: 60,
    entityRecognition: 70,
  },
  eeat: {
    experience: 78,
    expertise: 82,
    authority: 75,
    trust: 88,
    confidence: 0.85,
  },
  overall: 75,
  last_updated: new Date(),
}

// Helper functions
export const createMockTRPCResponse = (data: any, isLoading = false, error = null) => ({
  data,
  isLoading,
  error,
})

export const createMockMutation = (isLoading = false, error = null) => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading,
  error,
  isSuccess: !error && !isLoading,
  isError: !!error,
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { mockTRPCClient }
