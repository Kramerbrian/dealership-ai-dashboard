import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ExecutiveSummary } from '@/components/dashboard/executive-summary'
import { FivePillars } from '@/components/dashboard/five-pillars'
import { CompetitiveIntelligence } from '@/components/dashboard/competitive-intelligence'
import { QuickWins } from '@/components/dashboard/quick-wins'
import { MysteryShop } from '@/components/dashboard/mystery-shop'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  UserButton: () => <div data-testid="user-button">User Button</div>,
  useUser: () => ({ user: { id: 'test-user' } })
}))

// Mock TierGate
jest.mock('@/components/TierGate', () => ({
  TierGate: ({ children, requiredTier }: any) => {
    if (requiredTier === 'PRO' || requiredTier === 'ENTERPRISE') {
      return <div data-testid="tier-gate">{children}</div>
    }
    return children
  }
}))

describe('Dashboard Components', () => {
  describe('ExecutiveSummary', () => {
    it('renders executive summary with key metrics', () => {
      render(<ExecutiveSummary />)
      
      expect(screen.getByText('Overall AI Visibility Score')).toBeInTheDocument()
      expect(screen.getByText('Market Position')).toBeInTheDocument()
      expect(screen.getByText('Monthly Opportunity')).toBeInTheDocument()
      expect(screen.getByText('Active Competitors')).toBeInTheDocument()
    })

    it('displays 5 pillars breakdown', () => {
      render(<ExecutiveSummary />)
      
      expect(screen.getByText('5 Pillars Deep Dive')).toBeInTheDocument()
      expect(screen.getByText('AI Visibility')).toBeInTheDocument()
      expect(screen.getByText('Zero-Click Shield')).toBeInTheDocument()
      expect(screen.getByText('UGC Health')).toBeInTheDocument()
    })

    it('shows trust monitor section', () => {
      render(<ExecutiveSummary />)
      
      expect(screen.getByText('Trust Monitor')).toBeInTheDocument()
      expect(screen.getByText('Google Business Profile')).toBeInTheDocument()
      expect(screen.getByText('Schema Markup')).toBeInTheDocument()
    })
  })

  describe('FivePillars', () => {
    it('renders all 5 pillars with scores', () => {
      render(<FivePillars />)
      
      expect(screen.getByText('AI Visibility')).toBeInTheDocument()
      expect(screen.getByText('Zero-Click Shield')).toBeInTheDocument()
      expect(screen.getByText('UGC Health')).toBeInTheDocument()
      expect(screen.getByText('Geo Trust')).toBeInTheDocument()
      expect(screen.getByText('SGP Integrity')).toBeInTheDocument()
    })

    it('opens detailed view when pillar is clicked', async () => {
      render(<FivePillars />)
      
      const aiVisibilityCard = screen.getByText('AI Visibility').closest('[class*="cursor-pointer"]')
      fireEvent.click(aiVisibilityCard!)
      
      await waitFor(() => {
        expect(screen.getByText('AI Visibility Deep Dive')).toBeInTheDocument()
      })
    })
  })

  describe('CompetitiveIntelligence', () => {
    it('renders competitive intelligence with tier gate', () => {
      render(<CompetitiveIntelligence />)
      
      expect(screen.getByTestId('tier-gate')).toBeInTheDocument()
      expect(screen.getByText('Competitive Intelligence War Room')).toBeInTheDocument()
    })

    it('shows market position metrics', () => {
      render(<CompetitiveIntelligence />)
      
      expect(screen.getByText('Your Market Position')).toBeInTheDocument()
      expect(screen.getByText('Market Rank')).toBeInTheDocument()
      expect(screen.getByText('QAI Score')).toBeInTheDocument()
    })
  })

  describe('QuickWins', () => {
    it('renders quick wins with tier gate', () => {
      render(<QuickWins />)
      
      expect(screen.getByTestId('tier-gate')).toBeInTheDocument()
      expect(screen.getByText('Quick Wins & Smart Recommendations')).toBeInTheDocument()
    })

    it('shows potential impact summary', () => {
      render(<QuickWins />)
      
      expect(screen.getByText('Potential Impact')).toBeInTheDocument()
      expect(screen.getByText('QAI Score Points')).toBeInTheDocument()
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
    })

    it('filters recommendations correctly', () => {
      render(<QuickWins />)
      
      const criticalButton = screen.getByText('Critical')
      fireEvent.click(criticalButton)
      
      // Should show only critical recommendations
      expect(screen.getByText('Add LocalBusiness Schema Markup')).toBeInTheDocument()
    })
  })

  describe('MysteryShop', () => {
    it('renders mystery shop with enterprise tier gate', () => {
      render(<MysteryShop />)
      
      expect(screen.getByTestId('tier-gate')).toBeInTheDocument()
      expect(screen.getByText('Mystery Shop Automation')).toBeInTheDocument()
    })

    it('shows performance overview', () => {
      render(<MysteryShop />)
      
      expect(screen.getByText('Performance Overview')).toBeInTheDocument()
      expect(screen.getByText('Average Score')).toBeInTheDocument()
      expect(screen.getByText('Tests Completed')).toBeInTheDocument()
    })

    it('opens schedule modal when button is clicked', async () => {
      render(<MysteryShop />)
      
      const emailButton = screen.getByText('Email Inquiry')
      fireEvent.click(emailButton)
      
      await waitFor(() => {
        expect(screen.getByText('Schedule Mystery Shop Test')).toBeInTheDocument()
      })
    })
  })
})
