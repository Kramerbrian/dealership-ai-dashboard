import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TRPCProvider } from '@/lib/trpc-provider'
import DealershipAIDashboard from '@/components/DealershipAIDashboard'

// Mock tRPC with realistic data
const mockTRPCClient = {
  dealership: {
    getAll: {
      useQuery: jest.fn(() => ({
        data: [
          {
            id: '1',
            name: 'Premium Auto Dealership',
            domain: 'premiumauto.com',
            city: 'Cape Coral',
            state: 'FL',
            tier: 1,
            established_date: new Date('2018-01-01'),
          },
        ],
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
}

// Mock the TRPC provider
jest.mock('@/lib/trpc-provider', () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
  api: mockTRPCClient,
}))

describe('Dashboard Integration', () => {
  const mockUser = {
    firstName: 'Demo',
    emailAddresses: [{ emailAddress: 'demo@dealershipai.com' }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders complete dashboard with all sections', () => {
    render(
      <TRPCProvider>
        <DealershipAIDashboard user={mockUser} isLoaded={true} />
      </TRPCProvider>
    )
    
    // Check main sections
    expect(screen.getByText('DealershipAI')).toBeInTheDocument()
    expect(screen.getByText('Premium Auto Dealership')).toBeInTheDocument()
    expect(screen.getByText('Cape Coral, FL')).toBeInTheDocument()
    
    // Check scoring cards
    expect(screen.getByText('SEO Score')).toBeInTheDocument()
    expect(screen.getByText('AEO Score')).toBeInTheDocument()
    expect(screen.getByText('GEO Score')).toBeInTheDocument()
    
    // Check navigation tabs
    expect(screen.getByText('📊 Overview')).toBeInTheDocument()
    expect(screen.getByText('🤖 AI Health')).toBeInTheDocument()
    expect(screen.getByText('🌐 Website')).toBeInTheDocument()
    expect(screen.getByText('🔍 Schema')).toBeInTheDocument()
    expect(screen.getByText('⭐ Reviews')).toBeInTheDocument()
    expect(screen.getByText('⚔️ War Room')).toBeInTheDocument()
    expect(screen.getByText('⚙️ Settings')).toBeInTheDocument()
  })

  it('handles tab switching correctly', async () => {
    render(
      <TRPCProvider>
        <DealershipAIDashboard user={mockUser} isLoaded={true} />
      </TRPCProvider>
    )
    
    const aiHealthTab = screen.getByText('🤖 AI Health')
    const websiteTab = screen.getByText('🌐 Website')
    
    // Click AI Health tab
    fireEvent.click(aiHealthTab)
    await waitFor(() => {
      expect(aiHealthTab).toHaveStyle('background: #2196F3')
    })
    
    // Click Website tab
    fireEvent.click(websiteTab)
    await waitFor(() => {
      expect(websiteTab).toHaveStyle('background: #2196F3')
    })
  })

  it('displays correct scoring data', () => {
    render(
      <TRPCProvider>
        <DealershipAIDashboard user={mockUser} isLoaded={true} />
      </TRPCProvider>
    )
    
    // Check score values
    expect(screen.getByText('87')).toBeInTheDocument() // SEO
    expect(screen.getByText('72')).toBeInTheDocument() // AEO
    expect(screen.getByText('65')).toBeInTheDocument() // GEO
    
    // Check E-E-A-T scores
    expect(screen.getByText('Experience: 78')).toBeInTheDocument()
    expect(screen.getByText('Expertise: 82')).toBeInTheDocument()
    expect(screen.getByText('Authority: 75')).toBeInTheDocument()
    expect(screen.getByText('Trust: 88')).toBeInTheDocument()
  })

  it('shows action buttons and handles interactions', () => {
    render(
      <TRPCProvider>
        <DealershipAIDashboard user={mockUser} isLoaded={true} />
      </TRPCProvider>
    )
    
    // Check action buttons
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.getByText('Generate Report')).toBeInTheDocument()
    expect(screen.getByText('Start Optimization')).toBeInTheDocument()
    
    // Check import buttons
    expect(screen.getByText('Import from URL')).toBeInTheDocument()
    expect(screen.getByText('Import from GBP')).toBeInTheDocument()
    expect(screen.getByText('E-E-A-T Analysis')).toBeInTheDocument()
  })

  it('displays user information correctly', () => {
    render(
      <TRPCProvider>
        <DealershipAIDashboard user={mockUser} isLoaded={true} />
      </TRPCProvider>
    )
    
    expect(screen.getByText('Welcome, Demo')).toBeInTheDocument()
    expect(screen.getByText('PRO PLAN')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('handles loading state gracefully', () => {
    render(
      <TRPCProvider>
        <DealershipAIDashboard user={mockUser} isLoaded={false} />
      </TRPCProvider>
    )
    
    // Should still show basic structure
    expect(screen.getByText('DealershipAI')).toBeInTheDocument()
  })
})
