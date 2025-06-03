import { http, HttpResponse } from 'msw'
import { mockApiResponses } from '../utils'

const OPENDOTA_API_URL = 'https://api.opendota.com/api'

export const handlers = [
  // Heroes
  http.get(`${OPENDOTA_API_URL}/heroStats`, () => {
    return HttpResponse.json(mockApiResponses.heroes)
  }),

  // Player search by ID
  http.get(`${OPENDOTA_API_URL}/players/:playerId`, ({ params }) => {
    const { playerId } = params
    if (playerId === '87287966') {
      return HttpResponse.json({
        profile: mockApiResponses.playerSummary.profile,
        mmr_estimate: mockApiResponses.playerSummary.mmr_estimate,
      })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Player search by name
  http.get(`${OPENDOTA_API_URL}/search`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    if (query === 'testplayer') {
      return HttpResponse.json([{
        account_id: 87287966,
        personaname: 'Test Player',
        avatarfull: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg',
        similarity: 1.0
      }])
    }
    
    if (query === 'notfound') {
      return HttpResponse.json([])
    }
    
    return HttpResponse.json([mockApiResponses.searchPlayers.players[0]])
  }),

  // Player win/loss
  http.get(`${OPENDOTA_API_URL}/players/:playerId/wl`, () => {
    return HttpResponse.json(mockApiResponses.playerSummary.winLoss)
  }),

  // Player recent matches
  http.get(`${OPENDOTA_API_URL}/players/:playerId/recentMatches`, () => {
    return HttpResponse.json(mockApiResponses.playerSummary.recentMatches)
  }),

  // Match details
  http.get(`${OPENDOTA_API_URL}/matches/:matchId`, ({ params }) => {
    const { matchId } = params
    if (matchId === '7899876543') {
      return HttpResponse.json(mockApiResponses.match)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  // Error scenarios
  http.get(`${OPENDOTA_API_URL}/error-test`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  // Rate limited
  http.get(`${OPENDOTA_API_URL}/rate-limit-test`, () => {
    return new HttpResponse(null, { status: 429 })
  })
]

// Handlers for error testing
export const errorHandlers = [
  http.get(`${OPENDOTA_API_URL}/heroStats`, () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get(`${OPENDOTA_API_URL}/players/:playerId`, () => {
    return new HttpResponse(null, { status: 404 })
  }),

  http.get(`${OPENDOTA_API_URL}/search`, () => {
    return new HttpResponse(null, { status: 500 })
  })
]