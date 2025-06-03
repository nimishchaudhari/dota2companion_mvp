import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '../theme'
import { AuthProvider } from '../contexts/AuthContext'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ChakraProvider value={theme}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data factories
export const createMockHero = (overrides = {}) => ({
  id: 1,
  name: 'npc_dota_hero_antimage',
  localized_name: 'Anti-Mage',
  primary_attr: 'agi',
  attack_type: 'Melee',
  roles: ['Carry', 'Escape', 'Nuker'],
  img: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/antimage.png',
  icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/antimage.png',
  ...overrides
})

export const createMockPlayer = (overrides = {}) => ({
  steamId: '76561197960287930',
  personaName: 'Test Player',
  avatar: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg',
  similarity: 1.0,
  ...overrides
})

export const createMockPlayerSummary = (overrides = {}) => ({
  profile: {
    account_id: 87287966,
    personaname: 'Test Player',
    avatarfull: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg',
    profileurl: 'https://steamcommunity.com/profiles/76561197960287930/',
    plus: false,
  },
  mmr_estimate: {
    estimate: 3500
  },
  winLoss: {
    win: 150,
    lose: 140
  },
  recentMatches: [
    {
      match_id: 7899876543,
      hero_id: 1,
      player_slot: 0,
      radiant_win: true,
      duration: 2400,
      game_mode: 1,
      kills: 15,
      deaths: 3,
      assists: 10,
      start_time: 1640995200,
    }
  ],
  ...overrides
})

export const createMockMatch = (overrides = {}) => ({
  match_id: 7899876543,
  barracks_status_dire: 0,
  barracks_status_radiant: 0,
  cluster: 121,
  dire_score: 25,
  duration: 2400,
  engine: 1,
  first_blood_time: 120,
  game_mode: 1,
  human_players: 10,
  leagueid: 0,
  lobby_type: 0,
  match_seq_num: 6543219876,
  negative_votes: 0,
  patch: 34,
  positive_votes: 0,
  radiant_score: 35,
  radiant_win: true,
  start_time: 1640995200,
  tower_status_dire: 0,
  tower_status_radiant: 0,
  version: 34,
  replay_salt: 123456789,
  series_id: 0,
  series_type: 0,
  players: Array.from({ length: 10 }, (_, i) => ({
    account_id: 87287966 + i,
    player_slot: i,
    team_number: i < 5 ? 0 : 1,
    team_slot: (i % 5) as 0 | 1 | 2 | 3 | 4,
    hero_id: i + 1,
    personaname: `Player ${i + 1}`,
    kills: Math.floor(Math.random() * 20),
    deaths: Math.floor(Math.random() * 10),
    assists: Math.floor(Math.random() * 15),
  })),
  ...overrides
})

// Mock API responses
export const mockApiResponses = {
  heroes: [createMockHero()],
  searchPlayers: { players: [createMockPlayer()] },
  playerSummary: createMockPlayerSummary(),
  match: createMockMatch(),
}

// Helper for testing async components
export const waitForLoadingToFinish = () => 
  new Promise((resolve) => setTimeout(resolve, 0))

// Helper for testing error states
export const mockApiError = (status = 500, message = 'API Error') => {
  const error = new Error(message)
  ;(error as any).response = { status, data: { message } }
  return error
}