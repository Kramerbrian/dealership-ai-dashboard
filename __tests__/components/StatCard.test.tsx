import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/ui/StatCard'
import { TrendingUp } from 'lucide-react'

describe('StatCard', () => {
  const mockIcon = <TrendingUp className="h-6 w-6" />
  
  it('renders with basic props', () => {
    render(
      <StatCard
        icon={mockIcon}
        value="85"
        label="AI Visibility Score"
      />
    )
    
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('AI Visibility Score')).toBeInTheDocument()
  })

  it('renders with trend indicator', () => {
    render(
      <StatCard
        icon={mockIcon}
        value="85"
        label="AI Visibility Score"
        trend={{
          value: 12,
          direction: 'up'
        }}
      />
    )
    
    expect(screen.getByText('+12')).toBeInTheDocument()
  })

  it('applies correct color classes', () => {
    const { container } = render(
      <StatCard
        icon={mockIcon}
        value="85"
        label="AI Visibility Score"
        color="green"
      />
    )
    
    expect(container.firstChild).toHaveClass('bg-white')
  })

  it('handles different trend directions', () => {
    const { rerender } = render(
      <StatCard
        icon={mockIcon}
        value="85"
        label="AI Visibility Score"
        trend={{
          value: 5,
          direction: 'down'
        }}
      />
    )
    
    expect(screen.getByText('-5')).toBeInTheDocument()
    
    rerender(
      <StatCard
        icon={mockIcon}
        value="85"
        label="AI Visibility Score"
        trend={{
          value: 0,
          direction: 'neutral'
        }}
      />
    )
    
    expect(screen.getByText('+0')).toBeInTheDocument()
  })
})
