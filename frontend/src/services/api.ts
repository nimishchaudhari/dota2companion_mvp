// Direct OpenDota API service - no backend needed!
import axios, { type AxiosResponse } from 'axios';
import type {
  Hero,
  PlayerSummary,
  MatchDetails,
  SearchResult,
  RecentMatch,
  DotaApiService,
  MockAuthService,
  AuthUser,
  AuthResponse,
  CacheEntry
} from '../types';

import { ApiException } from '../types';

const OPENDOTA_API_URL = 'https://api.opendota.com/api';

// Simple in-memory cache to reduce API calls
const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper function to handle API errors
const handleApiError = (error: any, defaultMessage: string): never => {
  console.error(`API Error: ${defaultMessage}`, error);
  
  if (error.response?.status === 404) {
    throw new ApiException('Resource not found', 404);
  }
  
  const message = error.response?.data?.message || error.message || defaultMessage;
  const status = error.response?.status;
  
  throw new ApiException(message, status);
};

export const api: DotaApiService = {
  // Get all heroes
  async getHeroes(): Promise<Hero[]> {
    const cacheKey = 'heroes';
    const cached = getCachedData<Hero[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<any[]> = await axios.get(`${OPENDOTA_API_URL}/heroStats`);
      const dotaCdnBase = 'https://cdn.cloudflare.steamstatic.com';
      
      const heroes: Hero[] = response.data.map((hero: any): Hero => ({
        id: hero.id,
        name: hero.name,
        localized_name: hero.localized_name,
        primary_attr: hero.primary_attr,
        attack_type: hero.attack_type,
        roles: hero.roles || [],
        img: `${dotaCdnBase}${hero.img}`,
        icon: `${dotaCdnBase}${hero.icon}`,
      }));
      
      setCachedData(cacheKey, heroes);
      return heroes;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch heroes');
    }
  },

  // Get player summary
  async getPlayerSummary(accountId: number): Promise<PlayerSummary> {
    const cacheKey = `player_${accountId}`;
    const cached = getCachedData<PlayerSummary>(cacheKey);
    if (cached) return cached;

    try {
      const [playerRes, wlRes, recentMatchesRes] = await Promise.all([
        axios.get(`${OPENDOTA_API_URL}/players/${accountId}`),
        axios.get(`${OPENDOTA_API_URL}/players/${accountId}/wl`),
        axios.get(`${OPENDOTA_API_URL}/players/${accountId}/recentMatches?limit=5`)
      ]);

      const summaryData: PlayerSummary = {
        profile: playerRes.data.profile,
        mmr_estimate: playerRes.data.mmr_estimate,
        winLoss: wlRes.data,
        recentMatches: recentMatchesRes.data.map((match: any): RecentMatch => ({
          match_id: match.match_id,
          hero_id: match.hero_id,
          player_slot: match.player_slot,
          radiant_win: match.radiant_win,
          duration: match.duration,
          game_mode: match.game_mode,
          kills: match.kills,
          deaths: match.deaths,
          assists: match.assists,
          start_time: match.start_time,
        })),
      };

      setCachedData(cacheKey, summaryData);
      return summaryData;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      if ((error as any).response?.status === 404) {
        throw new ApiException('Player not found or profile is private', 404);
      }
      return handleApiError(error, 'Failed to fetch player data');
    }
  },

  // Search players
  async searchPlayers(query: string): Promise<SearchResult> {
    try {
      // If query is a number (Steam ID or Dota 2 ID), try to fetch the player directly
      if (/^\d{5,}$/.test(query.trim())) {
        const playerRes = await axios.get(`${OPENDOTA_API_URL}/players/${query.trim()}`);
        if (playerRes.data?.profile) {
          return {
            players: [{
              steamId: playerRes.data.profile.account_id,
              personaName: playerRes.data.profile.personaname,
              avatar: playerRes.data.profile.avatarfull,
              ...playerRes.data.profile
            }]
          };
        } else {
          return { players: [] };
        }
      }

      // Otherwise, search by persona name
      const searchRes = await axios.get(`${OPENDOTA_API_URL}/search?q=${encodeURIComponent(query)}`);
      const players = (searchRes.data || []).map((p: any) => ({
        steamId: p.account_id,
        personaName: p.personaname,
        avatar: p.avatarfull,
        similarity: p.similarity
      }));
      
      return { players };
    } catch (error) {
      console.error('Error searching players:', error);
      if ((error as any).response?.status === 404) {
        return { players: [] };
      }
      return handleApiError(error, 'Failed to search for players');
    }
  },

  // Get match details
  async getMatchDetails(matchId: number): Promise<MatchDetails> {
    const cacheKey = `match_${matchId}`;
    const cached = getCachedData<MatchDetails>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${OPENDOTA_API_URL}/matches/${matchId}`);
      const matchData = response.data;

      const simplifiedData: MatchDetails = {
        match_id: matchData.match_id,
        barracks_status_dire: matchData.barracks_status_dire || 0,
        barracks_status_radiant: matchData.barracks_status_radiant || 0,
        cluster: matchData.cluster || 0,
        dire_score: matchData.dire_score || 0,
        duration: matchData.duration,
        engine: matchData.engine || 0,
        first_blood_time: matchData.first_blood_time || 0,
        game_mode: matchData.game_mode,
        human_players: matchData.human_players || 0,
        leagueid: matchData.leagueid || 0,
        lobby_type: matchData.lobby_type || 0,
        match_seq_num: matchData.match_seq_num || 0,
        negative_votes: matchData.negative_votes || 0,
        patch: matchData.patch || 0,
        positive_votes: matchData.positive_votes || 0,
        radiant_score: matchData.radiant_score || 0,
        radiant_win: matchData.radiant_win,
        start_time: matchData.start_time,
        tower_status_dire: matchData.tower_status_dire || 0,
        tower_status_radiant: matchData.tower_status_radiant || 0,
        version: matchData.version || 0,
        replay_salt: matchData.replay_salt || 0,
        series_id: matchData.series_id || 0,
        series_type: matchData.series_type || 0,
        players: matchData.players?.map((p: any) => ({
          account_id: p.account_id,
          player_slot: p.player_slot,
          team_number: p.player_slot < 128 ? 0 : 1,
          team_slot: (p.player_slot % 128) as 0 | 1 | 2 | 3 | 4,
          hero_id: p.hero_id,
          personaname: p.personaname || 'Anonymous',
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          assists: p.assists || 0,
        })) || []
      };

      setCachedData(cacheKey, simplifiedData);
      return simplifiedData;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        throw new ApiException('Match not found', 404);
      }
      return handleApiError(error, 'Failed to fetch match details');
    }
  }
};

// Mock authentication since we don't need real auth for this demo
export const mockAuth: MockAuthService = {
  user: null,
  
  async login(username: string): Promise<AuthResponse> {
    // Mock user data
    const mockUsers: Record<string, AuthUser> = {
      "testuser": {
        steamId: "76561197960287930",
        personaName: "POC Test User",
        avatarUrl: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg"
      }
    };
    
    if (mockUsers[username]) {
      this.user = mockUsers[username];
      localStorage.setItem('mockUser', JSON.stringify(this.user));
      return { success: true, user: this.user };
    } else {
      throw new ApiException('Invalid test user', 401);
    }
  },

  async logout(): Promise<{ success: boolean }> {
    this.user = null;
    localStorage.removeItem('mockUser');
    return { success: true };
  },

  async checkAuth(): Promise<AuthResponse> {
    const saved = localStorage.getItem('mockUser');
    if (saved) {
      try {
        this.user = JSON.parse(saved) as AuthUser;
        return { success: true, user: this.user };
      } catch {
        localStorage.removeItem('mockUser');
        return { success: false };
      }
    }
    return { success: false };
  }
};