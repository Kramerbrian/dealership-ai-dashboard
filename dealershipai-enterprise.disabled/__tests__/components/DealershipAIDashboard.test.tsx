import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DealershipAIDashboard from '@/components/DealershipAIDashboard'

// Mock the TRPC provider
jest.mock('@/lib/trpc-provider', () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  api: {
    dealership: {
      getAll: {
        useQuery: jest.fn(() => ({
          data: [
            {
              id: '1',
              name: 'Test Dealership',
              domain: 'test.com',
              city: 'Test City',
              state: 'TC',
              tier: 1,
              established_date: new Date('2020-01-01'),
            },
          ],
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}))

describe('DealershipAIDashboard', () => {
  const mockUser = {
    firstName: 'Demo',
    emailAddresses: [{ emailAddress: 'demo@dealershipai.com' }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the dashboard with correct title', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('DealershipAI')).toBeInTheDocument()
    expect(screen.getByText('Algorithmic Trust Dashboard')).toBeInTheDocument()
  })

  it('displays the dealership information', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('Premium Auto Dealership')).toBeInTheDocument()
    expect(screen.getByText('Cape Coral, FL')).toBeInTheDocument()
    expect(screen.getByText('Welcome, Demo')).toBeInTheDocument()
  })

  it('shows the scoring cards', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('SEO Score')).toBeInTheDocument()
    expect(screen.getByText('AEO Score')).toBeInTheDocument()
    expect(screen.getByText('GEO Score')).toBeInTheDocument()
    expect(screen.getByText('E-E-A-T Analysis')).toBeInTheDocument()
  })

  it('displays the correct scores', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('87')).toBeInTheDocument() // SEO Score
    expect(screen.getByText('72')).toBeInTheDocument() // AEO Score
    expect(screen.getByText('65')).toBeInTheDocument() // GEO Score
  })

  it('shows E-E-A-T breakdown', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('Experience: 78')).toBeInTheDocument()
    expect(screen.getByText('Expertise: 82')).toBeInTheDocument()
    expect(screen.getByText('Authority: 75')).toBeInTheDocument()
    expect(screen.getByText('Trust: 88')).toBeInTheDocument()
  })

  it('has working tab navigation', async () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    const aiHealthTab = screen.getByText('🤖 AI Health')
    fireEvent.click(aiHealthTab)
    
    await waitFor(() => {
      expect(aiHealthTab).toHaveStyle('background: #2196F3')
    })
  })

  it('shows quick action buttons', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.getByText('Generate Report')).toBeInTheDocument()
    expect(screen.getByText('Start Optimization')).toBeInTheDocument()
  })

  it('displays the correct plan tier', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('PRO PLAN')).toBeInTheDocument()
  })

  it('shows live status indicator', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={true} />)
    
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('handles loading state correctly', () => {
    render(<DealershipAIDashboard user={mockUser} isLoaded={false} />)
    
    // Should still render the basic structure even when loading
    expect(screen.getByText('DealershipAI')).toBeInTheDocument()
  })
})
