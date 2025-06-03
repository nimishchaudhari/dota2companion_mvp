import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { mockAuth } from '../../services/api'
import React from 'react'

// Mock the API
vi.mock('../../services/api', () => ({
  mockAuth: {
    checkAuth: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('initializes with no user when no auth data exists', async () => {
    vi.mocked(mockAuth.checkAuth).mockResolvedValueOnce({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })

  it('initializes with user when auth data exists', async () => {
    const mockUser = {
      steamId: '76561197960287930',
      personaName: 'Test User',
      avatarUrl: 'test-avatar.jpg'
    }

    vi.mocked(mockAuth.checkAuth).mockResolvedValueOnce({ 
      success: true, 
      user: mockUser 
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
  })

  it('logs in user successfully', async () => {
    vi.mocked(mockAuth.checkAuth).mockResolvedValueOnce({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const mockUser = {
      steamId: '76561197960287930',
      personaName: 'Test User',
      avatarUrl: 'test-avatar.jpg'
    }

    vi.mocked(mockAuth.login).mockResolvedValueOnce({
      success: true,
      user: mockUser
    })

    let loginResult: boolean = false
    await act(async () => {
      loginResult = await result.current.login('testuser')
    })

    expect(mockAuth.login).toHaveBeenCalledWith('testuser')
    expect(result.current.user).toEqual(mockUser)
    expect(loginResult).toBe(true)
  })

  it('handles login errors', async () => {
    vi.mocked(mockAuth.checkAuth).mockResolvedValueOnce({ success: false })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const loginError = new Error('Invalid credentials')
    vi.mocked(mockAuth.login).mockRejectedValueOnce(loginError)

    let loginResult: boolean = true
    await act(async () => {
      loginResult = await result.current.login('invaliduser')
    })

    expect(result.current.user).toBeNull()
    expect(loginResult).toBe(false)
  })

  it('logs out user successfully', async () => {
    const mockUser = {
      steamId: '76561197960287930',
      personaName: 'Test User',
      avatarUrl: 'test-avatar.jpg'
    }

    vi.mocked(mockAuth.checkAuth).mockResolvedValueOnce({ 
      success: true, 
      user: mockUser 
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    vi.mocked(mockAuth.logout).mockResolvedValueOnce({ success: true })

    await act(async () => {
      await result.current.logout()
    })

    expect(mockAuth.logout).toHaveBeenCalled()
    expect(result.current.user).toBeNull()
  })

  it('handles logout errors gracefully', async () => {
    const mockUser = {
      steamId: '76561197960287930',
      personaName: 'Test User',
      avatarUrl: 'test-avatar.jpg'
    }

    vi.mocked(mockAuth.checkAuth).mockResolvedValueOnce({ 
      success: true, 
      user: mockUser 
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    const logoutError = new Error('Logout failed')
    vi.mocked(mockAuth.logout).mockRejectedValueOnce(logoutError)

    await act(async () => {
      await result.current.logout()
    })

    // User should still be logged out even if logout API fails (as per implementation)
    expect(result.current.user).toBeNull()
  })

  it('throws error when useAuth is used outside provider', () => {
    // Silence console.error for this test
    const originalError = console.error
    console.error = vi.fn()

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow()

    console.error = originalError
  })

  it('handles checkAuth errors during initialization', async () => {
    const checkAuthError = new Error('Auth check failed')
    vi.mocked(mockAuth.checkAuth).mockRejectedValueOnce(checkAuthError)

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBeNull()
  })
})