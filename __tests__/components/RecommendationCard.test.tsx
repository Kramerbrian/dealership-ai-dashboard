import { render, screen, fireEvent } from '@testing-library/react'
import { RecommendationCard } from '@/components/ui/RecommendationCard'

const mockRecommendation = {
  id: 'test-1',
  title: 'Add LocalBusiness Schema Markup',
  description: 'Missing critical schema.org markup for better AI visibility',
  impact: 12,
  revenue: 3600,
  time: 15,
  priority: 'critical' as const,
  effort: 'easy' as const,
  status: 'pending' as const,
  automated: false,
}

describe('RecommendationCard', () => {
  it('renders recommendation with all props', () => {
    render(<RecommendationCard {...mockRecommendation} />)
    
    expect(screen.getByText('Add LocalBusiness Schema Markup')).toBeInTheDocument()
    expect(screen.getByText('Missing critical schema.org markup for better AI visibility')).toBeInTheDocument()
    expect(screen.getByText('+12 pts')).toBeInTheDocument()
    expect(screen.getByText('$3,600/mo')).toBeInTheDocument()
    expect(screen.getByText('15 min')).toBeInTheDocument()
    expect(screen.getByText('critical')).toBeInTheDocument()
    expect(screen.getByText('easy effort')).toBeInTheDocument()
  })

  it('shows completed status when completed', () => {
    render(
      <RecommendationCard 
        {...mockRecommendation} 
        status="completed"
      />
    )
    
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.queryByText('Fix Now')).not.toBeInTheDocument()
  })

  it('calls onComplete when Fix Now is clicked', () => {
    const mockOnComplete = jest.fn()
    render(
      <RecommendationCard 
        {...mockRecommendation} 
        onComplete={mockOnComplete}
      />
    )
    
    fireEvent.click(screen.getByText('Fix Now'))
    expect(mockOnComplete).toHaveBeenCalledWith('test-1')
  })

  it('calls onLearn when Learn is clicked', () => {
    const mockOnLearn = jest.fn()
    render(
      <RecommendationCard 
        {...mockRecommendation} 
        onLearn={mockOnLearn}
      />
    )
    
    fireEvent.click(screen.getByText('Learn'))
    expect(mockOnLearn).toHaveBeenCalledWith('test-1')
  })

  it('shows automated badge when automated', () => {
    render(
      <RecommendationCard 
        {...mockRecommendation} 
        automated={true}
      />
    )
    
    expect(screen.getByText('Automated')).toBeInTheDocument()
  })

  it('applies correct priority colors', () => {
    const { container } = render(
      <RecommendationCard 
        {...mockRecommendation} 
        priority="critical"
      />
    )
    
    const criticalBadge = screen.getByText('critical')
    expect(criticalBadge).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('applies correct effort colors', () => {
    const { container } = render(
      <RecommendationCard 
        {...mockRecommendation} 
        effort="easy"
      />
    )
    
    const effortBadge = screen.getByText('easy effort')
    expect(effortBadge).toHaveClass('bg-green-100', 'text-green-800')
  })
})
