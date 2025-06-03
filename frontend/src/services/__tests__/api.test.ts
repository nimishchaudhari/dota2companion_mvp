import { describe, it, expect, vi } from 'vitest'
import { api, mockAuth } from '../api'
import { server } from '../../test/mocks/server'
import { errorHandlers } from '../../test/mocks/handlers'
import { ApiException } from '../../types'

describe('API Service', () => {
  describe('getHeroes', () => {
    it('should fetch heroes successfully', async () => {
      const heroes = await api.getHeroes()
      
      expect(heroes).toBeDefined()
      expect(Array.isArray(heroes)).toBe(true)
      expect(heroes.length).toBeGreaterThan(0)
      
      const hero = heroes[0]
      expect(hero).toHaveProperty('id')
      expect(hero).toHaveProperty('name')
      expect(hero).toHaveProperty('localized_name')
      expect(hero).toHaveProperty('primary_attr')
      expect(hero).toHaveProperty('attack_type')
      expect(hero).toHaveProperty('roles')
      expect(hero).toHaveProperty('img')
      expect(hero).toHaveProperty('icon')
    })

    it('should cache heroes data', async () => {
      // First call
      const heroes1 = await api.getHeroes()
      
      // Second call should return cached data
      const heroes2 = await api.getHeroes()
      
      expect(heroes1).toEqual(heroes2)
    })

    it('should handle API errors', async () => {
      server.use(...errorHandlers)
      
      await expect(api.getHeroes()).rejects.toThrow(ApiException)
    })
  })

  describe('searchPlayers', () => {
    it('should search players by name', async () => {
      const result = await api.searchPlayers('testplayer')
      
      expect(result).toHaveProperty('players')
      expect(Array.isArray(result.players)).toBe(true)
      expect(result.players.length).toBeGreaterThan(0)
      
      const player = result.players[0]
      expect(player).toHaveProperty('steamId')
      expect(player).toHaveProperty('personaName')
      expect(player).toHaveProperty('avatar')
    })

    it('should search players by Steam ID', async () => {
      const result = await api.searchPlayers('87287966')
      
      expect(result).toHaveProperty('players')
      expect(result.players.length).toBeGreaterThan(0)
    })

    it('should return empty results for unknown players', async () => {
      const result = await api.searchPlayers('notfound')
      
      expect(result).toHaveProperty('players')
      expect(result.players).toHaveLength(0)
    })

    it('should handle search errors gracefully', async () => {
      server.use(...errorHandlers)
      
      await expect(api.searchPlayers('test')).rejects.toThrow(ApiException)
    })
  })

  describe('getPlayerSummary', () => {
    it('should fetch player summary successfully', async () => {
      const summary = await api.getPlayerSummary(87287966)
      
      expect(summary).toHaveProperty('profile')
      expect(summary).toHaveProperty('mmr_estimate')
      expect(summary).toHaveProperty('winLoss')
      expect(summary).toHaveProperty('recentMatches')
      
      expect(summary.profile).toHaveProperty('account_id')
      expect(summary.profile).toHaveProperty('personaname')
      expect(summary.profile).toHaveProperty('avatarfull')
      
      expect(summary.winLoss).toHaveProperty('win')
      expect(summary.winLoss).toHaveProperty('lose')
      
      expect(Array.isArray(summary.recentMatches)).toBe(true)
    })

    it('should cache player summary data', async () => {
      const summary1 = await api.getPlayerSummary(87287966)
      const summary2 = await api.getPlayerSummary(87287966)
      
      expect(summary1).toEqual(summary2)
    })

    it('should throw ApiException for invalid player ID', async () => {
      await expect(api.getPlayerSummary(999999999))
        .rejects.toThrow(ApiException)
    })

    it('should handle player not found with proper message', async () => {
      try {
        await api.getPlayerSummary(999999999)
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException)
        expect((error as ApiException).status).toBe(404)
        expect((error as ApiException).message).toContain('not found')
      }
    })
  })

  describe('getMatchDetails', () => {
    it('should fetch match details successfully', async () => {
      const match = await api.getMatchDetails(7899876543)
      
      expect(match).toHaveProperty('match_id')
      expect(match).toHaveProperty('duration')
      expect(match).toHaveProperty('game_mode')
      expect(match).toHaveProperty('radiant_win')
      expect(match).toHaveProperty('start_time')
      expect(match).toHaveProperty('players')
      
      expect(Array.isArray(match.players)).toBe(true)
      expect(match.players.length).toBe(10)
      
      const player = match.players[0]
      expect(player).toHaveProperty('account_id')
      expect(player).toHaveProperty('hero_id')
      expect(player).toHaveProperty('kills')
      expect(player).toHaveProperty('deaths')
      expect(player).toHaveProperty('assists')
    })

    it('should cache match details', async () => {
      const match1 = await api.getMatchDetails(7899876543)
      const match2 = await api.getMatchDetails(7899876543)
      
      expect(match1).toEqual(match2)
    })

    it('should throw ApiException for invalid match ID', async () => {
      await expect(api.getMatchDetails(999999999))
        .rejects.toThrow(ApiException)
    })
  })

  describe('Cache functionality', () => {
    it('should respect cache duration', async () => {
      // Mock Date.now to test cache expiration
      const originalDateNow = Date.now
      let mockTime = 1000000000000
      
      vi.spyOn(Date, 'now').mockImplementation(() => mockTime)
      
      try {
        // First call
        const heroes1 = await api.getHeroes()
        
        // Advance time beyond cache duration (5 minutes = 300000ms)
        mockTime += 400000
        
        // This should trigger a new API call
        const heroes2 = await api.getHeroes()
        
        expect(heroes1).toEqual(heroes2) // Data should be the same
      } finally {
        vi.restoreAllMocks()
      }
    })
  })
})

describe('Mock Auth Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('should login with valid test user', async () => {
      const response = await mockAuth.login('testuser')
      
      expect(response.success).toBe(true)
      expect(response.user).toBeDefined()
      expect(response.user?.steamId).toBe('76561197960287930')
      expect(response.user?.personaName).toBe('POC Test User')
      expect(mockAuth.user).toEqual(response.user)
    })

    it('should throw error for invalid user', async () => {
      await expect(mockAuth.login('invaliduser'))
        .rejects.toThrow(ApiException)
    })

    it('should save user to localStorage on login', async () => {
      await mockAuth.login('testuser')
      
      const saved = localStorage.getItem('mockUser')
      expect(saved).toBeTruthy()
      
      const parsedUser = JSON.parse(saved!)
      expect(parsedUser.steamId).toBe('76561197960287930')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      // First login
      await mockAuth.login('testuser')
      expect(mockAuth.user).toBeTruthy()
      
      // Then logout
      const response = await mockAuth.logout()
      
      expect(response.success).toBe(true)
      expect(mockAuth.user).toBeNull()
      expect(localStorage.getItem('mockUser')).toBeNull()
    })
  })

  describe('checkAuth', () => {
    it('should restore user from localStorage', async () => {
      // Set user in localStorage
      const mockUser = {
        steamId: '76561197960287930',
        personaName: 'POC Test User',
        avatarUrl: 'test-avatar.jpg'
      }
      localStorage.setItem('mockUser', JSON.stringify(mockUser))
      
      const response = await mockAuth.checkAuth()
      
      expect(response.success).toBe(true)
      expect(response.user).toEqual(mockUser)
      expect(mockAuth.user).toEqual(mockUser)
    })

    it('should return false for no saved user', async () => {
      const response = await mockAuth.checkAuth()
      
      expect(response.success).toBe(false)
      expect(response.user).toBeUndefined()
    })

    it('should handle invalid JSON in localStorage', async () => {
      localStorage.setItem('mockUser', 'invalid-json')
      
      const response = await mockAuth.checkAuth()
      
      expect(response.success).toBe(false)
      expect(localStorage.getItem('mockUser')).toBeNull()
    })
  })
})