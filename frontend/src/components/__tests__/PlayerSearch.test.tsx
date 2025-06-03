import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/utils'
import PlayerSearch from '../PlayerSearch'
import * as enhancedApiWithSync from '../../services/enhancedApiWithSync'

// Mock the enhanced API
vi.mock('../../services/enhancedApiWithSync', () => ({
  enhancedApi: {
    searchPlayers: vi.fn(),
  },
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('PlayerSearch', () => {
  const mockSearchPlayers = vi.mocked(enhancedApiWithSync.enhancedApi.searchPlayers)
  const mockOnResult = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input and button', () => {
    render(<PlayerSearch onResult={mockOnResult} />)
    
    expect(screen.getByPlaceholderText(/search by steam id/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('shows error for empty search', async () => {
    const user = userEvent.setup()
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const button = screen.getByRole('button', { name: /search/i })
    await user.click(button)
    
    expect(screen.getByText(/please enter a steam id/i)).toBeInTheDocument()
  })

  it('performs search when form is submitted', async () => {
    const user = userEvent.setup()
    const mockPlayers = [
      {
        steamId: '76561197960287930',
        personaName: 'Test Player',
        avatar: 'test-avatar.jpg'
      }
    ]
    
    mockSearchPlayers.mockResolvedValueOnce({ players: mockPlayers })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    expect(mockSearchPlayers).toHaveBeenCalledWith('testplayer')
    
    await waitFor(() => {
      expect(mockOnResult).toHaveBeenCalledWith(mockPlayers)
    })
  })

  it('shows loading state during search', async () => {
    const user = userEvent.setup()
    let resolveSearch: (value: any) => void
    const searchPromise = new Promise((resolve) => {
      resolveSearch = resolve
    })
    
    mockSearchPlayers.mockReturnValueOnce(searchPromise)
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    // Check loading state
    expect(screen.getByText(/searching/i)).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(input).toBeDisabled()
    
    // Resolve the promise
    resolveSearch!({ players: [] })
    
    await waitFor(() => {
      expect(screen.queryByText(/searching/i)).not.toBeInTheDocument()
    })
  })

  it('displays error when no players found', async () => {
    const user = userEvent.setup()
    mockSearchPlayers.mockResolvedValueOnce({ players: [] })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'notfound')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/no players found/i)).toBeInTheDocument()
    })
  })

  it('displays error from API response', async () => {
    const user = userEvent.setup()
    mockSearchPlayers.mockResolvedValueOnce({ error: 'API Error occurred' })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/api error occurred/i)).toBeInTheDocument()
    })
  })

  it('handles API exceptions', async () => {
    const user = userEvent.setup()
    mockSearchPlayers.mockRejectedValueOnce(new Error('Network error'))
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/an error occurred while searching/i)).toBeInTheDocument()
    })
  })

  it('shows single player result', async () => {
    const user = userEvent.setup()
    const mockPlayer = {
      steamId: '76561197960287930',
      personaName: 'Test Player',
      avatar: 'test-avatar.jpg'
    }
    
    mockSearchPlayers.mockResolvedValueOnce({ players: [mockPlayer] })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/player found/i)).toBeInTheDocument()
      expect(screen.getByText('Test Player')).toBeInTheDocument()
      expect(screen.getByText(/steam id: 76561197960287930/i)).toBeInTheDocument()
    })
  })

  it('shows multiple player results', async () => {
    const user = userEvent.setup()
    const mockPlayers = [
      {
        steamId: '76561197960287930',
        personaName: 'Test Player 1',
        avatar: 'test-avatar1.jpg'
      },
      {
        steamId: '76561197960287931',
        personaName: 'Test Player 2',
        avatar: 'test-avatar2.jpg'
      }
    ]
    
    mockSearchPlayers.mockResolvedValueOnce({ players: mockPlayers })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/multiple players found/i)).toBeInTheDocument()
      expect(screen.getByText('Test Player 1')).toBeInTheDocument()
      expect(screen.getByText('Test Player 2')).toBeInTheDocument()
    })
  })

  it('navigates to player profile when player is selected', async () => {
    const user = userEvent.setup()
    const mockPlayer = {
      steamId: '76561197960287930',
      personaName: 'Test Player',
      avatar: 'test-avatar.jpg'
    }
    
    mockSearchPlayers.mockResolvedValueOnce({ players: [mockPlayer] })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument()
    })
    
    // Click on the player result
    const playerButton = screen.getByRole('button', { name: /test player/i })
    await user.click(playerButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/player/76561197960287930')
  })

  it('clears results and query after selecting a player', async () => {
    const user = userEvent.setup()
    const mockPlayer = {
      steamId: '76561197960287930',
      personaName: 'Test Player',
      avatar: 'test-avatar.jpg'
    }
    
    mockSearchPlayers.mockResolvedValueOnce({ players: [mockPlayer] })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i) as HTMLInputElement
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument()
    })
    
    // Click on the player result
    const playerButton = screen.getByRole('button', { name: /test player/i })
    await user.click(playerButton)
    
    // Check that results are cleared
    expect(screen.queryByText('Test Player')).not.toBeInTheDocument()
    expect(input.value).toBe('')
  })

  it('can search using Enter key', async () => {
    const user = userEvent.setup()
    const mockPlayers = [
      {
        steamId: '76561197960287930',
        personaName: 'Test Player',
        avatar: 'test-avatar.jpg'
      }
    ]
    
    mockSearchPlayers.mockResolvedValueOnce({ players: mockPlayers })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    
    await user.type(input, 'testplayer')
    await user.keyboard('[Enter]')
    
    expect(mockSearchPlayers).toHaveBeenCalledWith('testplayer')
  })

  it('handles multiple players selection from dropdown', async () => {
    const user = userEvent.setup()
    const mockPlayers = [
      {
        steamId: '76561197960287930',
        personaName: 'Test Player 1',
        avatar: 'test-avatar1.jpg'
      },
      {
        steamId: '76561197960287931',
        personaName: 'Test Player 2',
        avatar: 'test-avatar2.jpg'
      }
    ]
    
    mockSearchPlayers.mockResolvedValueOnce({ players: mockPlayers })
    
    render(<PlayerSearch onResult={mockOnResult} />)
    
    const input = screen.getByPlaceholderText(/search by steam id/i)
    const button = screen.getByRole('button', { name: /search/i })
    
    await user.type(input, 'testplayer')
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Test Player 2')).toBeInTheDocument()
    })
    
    // Click on the second player
    const playerButton = screen.getByRole('button', { name: /test player 2/i })
    await user.click(playerButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/player/76561197960287931')
  })
})