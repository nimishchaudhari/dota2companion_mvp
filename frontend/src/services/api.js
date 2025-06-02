// Direct OpenDota API service - no backend needed!
import axios from 'axios';

const OPENDOTA_API_URL = 'https://api.opendota.com/api';

// Simple in-memory cache to reduce API calls
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const api = {
  // Get all heroes
  async getHeroes() {
    const cacheKey = 'heroes';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${OPENDOTA_API_URL}/heroStats`);
      const dotaCdnBase = 'https://cdn.cloudflare.steamstatic.com';
      
      const heroes = response.data.map(hero => ({
        id: hero.id,
        name: hero.name,
        localized_name: hero.localized_name,
        primary_attr: hero.primary_attr,
        attack_type: hero.attack_type,
        roles: hero.roles,
        img: `${dotaCdnBase}${hero.img}`,
        icon: `${dotaCdnBase}${hero.icon}`,
      }));
      
      setCachedData(cacheKey, heroes);
      return heroes;
    } catch (error) {
      console.error('Error fetching heroes:', error);
      throw new Error('Failed to fetch heroes');
    }
  },

  // Get player summary
  async getPlayerSummary(accountId) {
    const cacheKey = `player_${accountId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [playerRes, wlRes, recentMatchesRes] = await Promise.all([
        axios.get(`${OPENDOTA_API_URL}/players/${accountId}`),
        axios.get(`${OPENDOTA_API_URL}/players/${accountId}/wl`),
        axios.get(`${OPENDOTA_API_URL}/players/${accountId}/recentMatches?limit=5`)
      ]);

      const summaryData = {
        profile: playerRes.data.profile,
        mmr_estimate: playerRes.data.mmr_estimate,
        winLoss: wlRes.data,
        recentMatches: recentMatchesRes.data.map(match => ({
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
      console.error('Error fetching player summary:', error);
      if (error.response?.status === 404) {
        throw new Error('Player not found or profile is private');
      }
      throw new Error('Failed to fetch player data');
    }
  },

  // Search players
  async searchPlayers(query) {
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
      const players = (searchRes.data || []).map(p => ({
        steamId: p.account_id,
        personaName: p.personaname,
        avatar: p.avatarfull,
        similarity: p.similarity
      }));
      
      return { players };
    } catch (error) {
      console.error('Error searching players:', error);
      if (error.response?.status === 404) {
        return { players: [] };
      }
      throw new Error('Failed to search for players');
    }
  },

  // Get match details
  async getMatchDetails(matchId) {
    const cacheKey = `match_${matchId}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${OPENDOTA_API_URL}/matches/${matchId}`);
      const matchData = response.data;

      const simplifiedData = {
        match_id: matchData.match_id,
        radiant_win: matchData.radiant_win,
        duration: matchData.duration,
        radiant_score: matchData.radiant_score,
        dire_score: matchData.dire_score,
        start_time: matchData.start_time,
        game_mode: matchData.game_mode,
        players: matchData.players?.map(p => ({
          account_id: p.account_id,
          player_slot: p.player_slot,
          hero_id: p.hero_id,
          personaname: p.personaname || 'Anonymous',
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
        })) || []
      };

      setCachedData(cacheKey, simplifiedData);
      return simplifiedData;
    } catch (error) {
      console.error('Error fetching match details:', error);
      if (error.response?.status === 404) {
        throw new Error('Match not found');
      }
      throw new Error('Failed to fetch match details');
    }
  }
};

// Mock authentication since we don't need real auth for this demo
export const mockAuth = {
  user: null,
  
  async login(username) {
    // Mock user data
    const mockUsers = {
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
      throw new Error('Invalid test user');
    }
  },

  async logout() {
    this.user = null;
    localStorage.removeItem('mockUser');
    return { success: true };
  },

  async checkAuth() {
    const saved = localStorage.getItem('mockUser');
    if (saved) {
      this.user = JSON.parse(saved);
      return { success: true, user: this.user };
    }
    return { success: false };
  }
};