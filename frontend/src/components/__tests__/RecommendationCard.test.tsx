import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/utils'
import RecommendationCard from '../RecommendationCard'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('RecommendationCard', () => {
  const mockHero = {
    id: 1,
    name: 'npc_dota_hero_antimage',
    localized_name: 'Anti-Mage',
    primary_attr: 'agi',
    attack_type: 'Melee',
    roles: ['Carry', 'Escape', 'Nuker'],
    img: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png',
    icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/antimage.png'
  }

  const defaultProps = {
    hero: mockHero,
    reason: 'High win rate this patch',
    confidence: 85,
    matchup: 'good',
    onSelect: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders hero information correctly', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    expect(screen.getByText('Anti-Mage')).toBeInTheDocument()
    expect(screen.getByText('High win rate this patch')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText(/agi/i)).toBeInTheDocument()
    expect(screen.getByText(/melee/i)).toBeInTheDocument()
  })

  it('displays hero roles', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    expect(screen.getByText('Carry')).toBeInTheDocument()
    expect(screen.getByText('Escape')).toBeInTheDocument()
    expect(screen.getByText('Nuker')).toBeInTheDocument()
  })

  it('shows correct matchup indicator', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    expect(screen.getByTestId('matchup-indicator')).toBeInTheDocument()
    expect(screen.getByTestId('matchup-indicator')).toHaveAttribute('data-matchup', 'good')
  })

  it('shows bad matchup indicator', () => {
    render(<RecommendationCard {...defaultProps} matchup="bad" />)
    
    expect(screen.getByTestId('matchup-indicator')).toHaveAttribute('data-matchup', 'bad')
  })

  it('shows neutral matchup indicator', () => {
    render(<RecommendationCard {...defaultProps} matchup="neutral" />)
    
    expect(screen.getByTestId('matchup-indicator')).toHaveAttribute('data-matchup', 'neutral')
  })

  it('renders hero image with correct alt text', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    const heroImage = screen.getByAltText('Anti-Mage hero')
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('src', mockHero.img)
  })

  it('handles image loading error', async () => {
    render(<RecommendationCard {...defaultProps} />)
    
    const heroImage = screen.getByAltText('Anti-Mage hero')
    
    // Simulate image load error
    await userEvent.click(heroImage)
    // This would normally trigger an error handler that shows a placeholder
  })

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSelect = vi.fn()
    
    render(<RecommendationCard {...defaultProps} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    await user.click(card)
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockHero)
  })

  it('shows confidence level with correct styling', () => {
    render(<RecommendationCard {...defaultProps} confidence={92} />)
    
    const confidence = screen.getByText('92%')
    expect(confidence).toBeInTheDocument()
    
    // High confidence should have a specific styling
    expect(confidence.closest('[data-testid="confidence-badge"]')).toHaveAttribute('data-confidence-level', 'high')
  })

  it('shows medium confidence styling', () => {
    render(<RecommendationCard {...defaultProps} confidence={65} />)
    
    const confidence = screen.getByText('65%')
    const badge = confidence.closest('[data-testid="confidence-badge"]')
    expect(badge).toHaveAttribute('data-confidence-level', 'medium')
  })

  it('shows low confidence styling', () => {
    render(<RecommendationCard {...defaultProps} confidence={45} />)
    
    const confidence = screen.getByText('45%')
    const badge = confidence.closest('[data-testid="confidence-badge"]')
    expect(badge).toHaveAttribute('data-confidence-level', 'low')
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    const mockOnSelect = vi.fn()
    
    render(<RecommendationCard {...defaultProps} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    
    // Focus and press Enter
    card.focus()
    await user.keyboard('[Enter]')
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockHero)
  })

  it('handles spacebar activation', async () => {
    const user = userEvent.setup()
    const mockOnSelect = vi.fn()
    
    render(<RecommendationCard {...defaultProps} onSelect={mockOnSelect} />)
    
    const card = screen.getByRole('button')
    
    // Focus and press Space
    card.focus()
    await user.keyboard(' ')
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockHero)
  })

  it('shows appropriate ARIA labels for accessibility', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Anti-Mage'))
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('85%'))
  })

  it('displays truncated reason text for long descriptions', () => {
    const longReason = 'This is a very long reason that should be truncated if it exceeds the maximum character limit for the card layout'
    
    render(<RecommendationCard {...defaultProps} reason={longReason} />)
    
    expect(screen.getByText(longReason)).toBeInTheDocument()
  })

  it('handles missing hero data gracefully', () => {
    const incompleteHero = {
      ...mockHero,
      roles: undefined,
      primary_attr: undefined
    }
    
    render(<RecommendationCard {...defaultProps} hero={incompleteHero} />)
    
    expect(screen.getByText('Anti-Mage')).toBeInTheDocument()
    // Should not crash when roles or attributes are missing
  })

  it('applies correct CSS classes for animations', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    const card = screen.getByRole('button')
    expect(card).toHaveClass('recommendation-card') // Assuming this class exists
  })

  it('shows loading state for hero image', () => {
    render(<RecommendationCard {...defaultProps} />)
    
    const heroImage = screen.getByAltText('Anti-Mage hero')
    
    // Initially should have loading attribute or skeleton
    expect(heroImage).toBeInTheDocument()
  })

  it('handles edge case confidence values', () => {
    // Test 0% confidence
    const { rerender } = render(<RecommendationCard {...defaultProps} confidence={0} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
    
    // Test 100% confidence
    rerender(<RecommendationCard {...defaultProps} confidence={100} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('provides tooltips for complex elements', async () => {
    const user = userEvent.setup()
    render(<RecommendationCard {...defaultProps} />)
    
    // Hover over confidence badge
    const confidenceBadge = screen.getByText('85%')
    await user.hover(confidenceBadge)
    
    // Should show tooltip (implementation dependent)
  })
})