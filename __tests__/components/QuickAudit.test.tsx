// QuickAudit Component Tests
// DealershipAI - React component testing

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickAudit from '@/components/landing/QuickAudit';

// Mock fetch globally
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('QuickAudit Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render input and submit button', () => {
    render(<QuickAudit />);
    
    expect(screen.getByPlaceholderText(/your dealership website/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('should validate domain format', async () => {
    const user = userEvent.setup();
    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'not-a-url');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid website/i)).toBeInTheDocument();
    });
  });

  it('should display loading state during analysis', async () => {
    const user = userEvent.setup();
    
    // Mock delayed response
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ 
        ok: true, 
        json: async () => ({ 
          scores: { 
            ai_visibility: 72,
            zero_click: 65,
            ugc_health: 88,
            geo_trust: 91,
            sgp_integrity: 79
          }
        })
      }), 100))
    );

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should display results after successful analysis', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scores: {
          ai_visibility: 72,
          zero_click: 65,
          ugc_health: 88,
          geo_trust: 91,
          sgp_integrity: 79
        },
        performance: {
          processing_time_ms: 1250
        }
      })
    });

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
      expect(screen.getByText(/ai visibility/i)).toBeInTheDocument();
      expect(screen.getByText('65')).toBeInTheDocument();
      expect(screen.getByText(/zero click/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should handle 429 rate limit errors', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' })
    });

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('should show score breakdown on hover', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scores: {
          ai_visibility: 72,
          zero_click: 65,
          ugc_health: 88,
          geo_trust: 91,
          sgp_integrity: 79
        }
      })
    });

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    await waitFor(() => {
      const scoreCard = screen.getByText('72');
      expect(scoreCard).toBeInTheDocument();
    });

    // Hover over score to see breakdown
    const scoreElement = screen.getByText('72');
    await user.hover(scoreElement);
    
    await waitFor(() => {
      expect(screen.getByText(/breakdown/i)).toBeInTheDocument();
    });
  });

  it('should allow retry after error', async () => {
    const user = userEvent.setup();
    
    // First request fails
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    // Second request succeeds
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scores: {
          ai_visibility: 72,
          zero_click: 65,
          ugc_health: 88,
          geo_trust: 91,
          sgp_integrity: 79
        }
      })
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
    });
  });

  it('should clear results when new domain is entered', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scores: {
          ai_visibility: 72,
          zero_click: 65,
          ugc_health: 88,
          geo_trust: 91,
          sgp_integrity: 79
        }
      })
    });

    render(<QuickAudit />);
    
    const input = screen.getByPlaceholderText(/your dealership website/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    await user.type(input, 'https://example-dealer.com');
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('72')).toBeInTheDocument();
    });

    // Clear input and type new domain
    await user.clear(input);
    await user.type(input, 'https://new-dealer.com');
    
    // Results should be cleared
    expect(screen.queryByText('72')).not.toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<QuickAudit />);
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button');
    
    expect(input).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-label');
    
    // Check for proper form structure
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });
});
