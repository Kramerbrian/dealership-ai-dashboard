import { render, screen } from '@testing-library/react'
import { TierGate } from '@/components/TierGate'
import { useUser } from '@clerk/nextjs'

// Mock the useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}))

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe('TierGate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when user has required tier', () => {
    mockUseUser.mockReturnValue({
      user: {
        publicMetadata: { tier: 'PRO' }
      },
      isLoaded: true,
      isSignedIn: true,
    } as any)

    render(
      <TierGate requiredTier="PRO" feature="Test Feature">
        <div data-testid="protected-content">Protected Content</div>
      </TierGate>
    )

    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('renders upgrade modal when user lacks required tier', () => {
    mockUseUser.mockReturnValue({
      user: {
        publicMetadata: { tier: 'FREE' }
      },
      isLoaded: true,
      isSignedIn: true,
    } as any)

    render(
      <TierGate requiredTier="PRO" feature="Test Feature">
        <div data-testid="protected-content">Protected Content</div>
      </TierGate>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByText('Upgrade to PRO')).toBeInTheDocument()
    expect(screen.getByText('Test Feature')).toBeInTheDocument()
  })

  it('renders upgrade modal for ENTERPRISE tier requirement', () => {
    mockUseUser.mockReturnValue({
      user: {
        publicMetadata: { tier: 'PRO' }
      },
      isLoaded: true,
      isSignedIn: true,
    } as any)

    render(
      <TierGate requiredTier="ENTERPRISE" feature="Mystery Shop">
        <div data-testid="protected-content">Protected Content</div>
      </TierGate>
    )

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByText('Upgrade to ENTERPRISE')).toBeInTheDocument()
    expect(screen.getByText('Mystery Shop')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false,
    } as any)

    render(
      <TierGate requiredTier="PRO" feature="Test Feature">
        <div data-testid="protected-content">Protected Content</div>
      </TierGate>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles signed out state', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false,
    } as any)

    render(
      <TierGate requiredTier="PRO" feature="Test Feature">
        <div data-testid="protected-content">Protected Content</div>
      </TierGate>
    )

    expect(screen.getByText('Please sign in to access this feature')).toBeInTheDocument()
  })
})
