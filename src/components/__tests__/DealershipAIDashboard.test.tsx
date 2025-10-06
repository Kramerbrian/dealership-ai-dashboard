import { render, screen } from '@testing-library/react'
import DealershipAIDashboard from '@/src/components/DealershipAIDashboard'

// Mock the recharts library
jest.mock('recharts', () => ({
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('DealershipAIDashboard', () => {
  it('renders the dashboard header', () => {
    render(<DealershipAIDashboard />)
    
    expect(screen.getByText('dealershipAI')).toBeInTheDocument()
    expect(screen.getByText('Algorithmic Trust Dashboard')).toBeInTheDocument()
  })

  it('displays the risk assessment tab by default', () => {
    render(<DealershipAIDashboard />)
    
    expect(screen.getByRole('tab', { name: /risk assessment/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows critical revenue risk alert', () => {
    render(<DealershipAIDashboard />)
    
    expect(screen.getByText('Critical Revenue Risk Detected')).toBeInTheDocument()
  })

  it('displays metric cards', () => {
    render(<DealershipAIDashboard />)
    
    expect(screen.getByText('Algorithmic Trust Score')).toBeInTheDocument()
    expect(screen.getByText('Revenue at Risk')).toBeInTheDocument()
    expect(screen.getByText('AI Visibility Score')).toBeInTheDocument()
  })
})