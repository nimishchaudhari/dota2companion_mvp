// High-performance API service with multi-level caching and optimizations
import axios from 'axios';
import cacheManager from '../utils/cache';

const OPENDOTA_API_URL = 'https://api.opendota.com/api';

// Request deduplication
const activeRequests = new Map();

// Optimized API service
class OptimizedApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: OPENDOTA_API_URL,
      timeout: 10000,
      // Enable compression
      headers: {
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    // Request interceptor for deduplication
    this.axios.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: performance.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for performance monitoring
    this.axios.interceptors.response.use(
      (response) => {
        const duration = performance.now() - response.config.metadata.startTime;
        if (duration > 1000) {
          console.warn(`Slow API call: ${response.config.url} took ${duration.toFixed(2)}ms`);
        }
        return response;
      },
      (error) => Promise.reject(error)
    );
  }

  // Deduplicated request wrapper
  async deduplicatedRequest(url, options = {}) {
    const key = `${url}:${JSON.stringify(options)}`;
    
    if (activeRequests.has(key)) {
      return activeRequests.get(key);
    }

    const promise = this.axios.get(url, options)
      .finally(() => {
        activeRequests.delete(key);
      });

    activeRequests.set(key, promise);
    return promise;
  }

  // Optimized heroes fetching with smart caching
  async getHeroes(useCache = true) {
    const cacheKey = 'heroes:all';
    const TTL = 60 * 60 * 1000; // 1 hour (heroes don't change often)

    if (useCache) {
      const cached = await cacheManager.get(cacheKey, TTL);
      if (cached) return cached;
    }

    try {
      const response = await this.deduplicatedRequest('/heroStats');
      const dotaCdnBase = 'https://cdn.cloudflare.steamstatic.com';
      
      const heroes = response.data.map(hero => ({
        id: hero.id,
        name: hero.name,
        localized_name: hero.localized_name,
        primary_attr: hero.primary_attr,
        attack_type: hero.attack_type,
        roles: hero.roles || [],
        img: `${dotaCdnBase}${hero.img}`,
        icon: `${dotaCdnBase}${hero.icon}`,
        // Pre-calculate commonly used properties
        displayName: hero.localized_name || hero.name,
        searchTerms: `${hero.name} ${hero.localized_name} ${(hero.roles || []).join(' ')}`.toLowerCase()
      }));

      await cacheManager.set(cacheKey, heroes, 'heroes');
      return heroes;
    } catch (error) {
      console.error('Failed to fetch heroes:', error);
      // Try to return stale cache if available
      const staleCache = await cacheManager.get(cacheKey, TTL * 24); // 24 hour fallback
      if (staleCache) {
        console.warn('Returning stale heroes data');
        return staleCache;
      }
      throw error;
    }
  }

  // Optimized player summary with parallel requests
  async getPlayerSummary(accountId, useCache = true) {
    const cacheKey = `player:${accountId}:summary`;
    const TTL = 10 * 60 * 1000; // 10 minutes

    if (useCache) {
      const cached = await cacheManager.get(cacheKey, TTL);
      if (cached) return cached;
    }

    try {
      // Parallel requests for better performance
      const [playerRes, wlRes, recentMatchesRes] = await Promise.all([
        this.deduplicatedRequest(`/players/${accountId}`),
        this.deduplicatedRequest(`/players/${accountId}/wl`),
        this.deduplicatedRequest(`/players/${accountId}/recentMatches?limit=5`)
      ]);

      const summary = {
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
          // Pre-calculate win/loss
          won: (match.player_slot < 128) === match.radiant_win
        })),
        // Pre-calculate stats
        winRate: wlRes.data.win / (wlRes.data.win + wlRes.data.lose) * 100,
        totalGames: wlRes.data.win + wlRes.data.lose
      };

      await cacheManager.set(cacheKey, summary, 'players');
      return summary;
    } catch (error) {
      console.error('Failed to fetch player summary:', error);
      
      // Try stale cache
      const staleCache = await cacheManager.get(cacheKey, TTL * 12); // 2 hour fallback
      if (staleCache) {
        console.warn('Returning stale player data');
        return staleCache;
      }
      
      throw error;
    }
  }

  // Smart search with caching and debouncing
  async searchPlayers(query, useCache = true) {
    if (!query?.trim()) return { players: [] };

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `search:players:${normalizedQuery}`;
    const TTL = 30 * 60 * 1000; // 30 minutes

    if (useCache) {
      const cached = await cacheManager.get(cacheKey, TTL);
      if (cached) return cached;
    }

    try {
      let result;

      // Direct ID lookup for numeric queries
      if (/^\d{5,}$/.test(normalizedQuery)) {
        const playerRes = await this.deduplicatedRequest(`/players/${normalizedQuery}`);
        if (playerRes.data?.profile) {
          result = {
            players: [{
              steamId: playerRes.data.profile.account_id,
              personaName: playerRes.data.profile.personaname,
              avatar: playerRes.data.profile.avatarfull,
              ...playerRes.data.profile
            }]
          };
        } else {
          result = { players: [] };
        }
      } else {
        // Name search
        const searchRes = await this.deduplicatedRequest(`/search?q=${encodeURIComponent(normalizedQuery)}`);
        result = {
          players: (searchRes.data || []).map(p => ({
            steamId: p.account_id,
            personaName: p.personaname,
            avatar: p.avatarfull,
            similarity: p.similarity
          }))
        };
      }

      await cacheManager.set(cacheKey, result, 'search');
      return result;
    } catch (error) {
      console.error('Search failed:', error);
      return { players: [] };
    }
  }

  // Optimized match details with smart data processing
  async getMatchDetails(matchId, useCache = true) {
    const cacheKey = `match:${matchId}:details`;
    const TTL = 60 * 60 * 1000; // 1 hour (matches don't change)

    if (useCache) {
      const cached = await cacheManager.get(cacheKey, TTL);
      if (cached) return cached;
    }

    try {
      const response = await this.deduplicatedRequest(`/matches/${matchId}`);
      const matchData = response.data;

      // Process and optimize match data
      const optimizedData = {
        match_id: matchData.match_id,
        duration: matchData.duration,
        game_mode: matchData.game_mode,
        radiant_win: matchData.radiant_win,
        start_time: matchData.start_time,
        // Essential stats only
        dire_score: matchData.dire_score || 0,
        radiant_score: matchData.radiant_score || 0,
        first_blood_time: matchData.first_blood_time || 0,
        // Optimized player data
        players: (matchData.players || []).map(p => ({
          account_id: p.account_id,
          player_slot: p.player_slot,
          hero_id: p.hero_id,
          personaname: p.personaname || 'Anonymous',
          kills: p.kills || 0,
          deaths: p.deaths || 0,
          assists: p.assists || 0,
          // Pre-calculate useful properties
          team: p.player_slot < 128 ? 'radiant' : 'dire',
          won: (p.player_slot < 128) === matchData.radiant_win,
          kda: ((p.kills || 0) + (p.assists || 0)) / Math.max(p.deaths || 1, 1)
        })),
        // Pre-calculate match summary
        duration_formatted: this.formatDuration(matchData.duration),
        winner: matchData.radiant_win ? 'radiant' : 'dire'
      };

      await cacheManager.set(cacheKey, optimizedData, 'matches');
      return optimizedData;
    } catch (error) {
      console.error('Failed to fetch match details:', error);
      throw error;
    }
  }

  // Prefetch commonly needed data
  async prefetchCommonData() {
    try {
      // Prefetch heroes in background
      this.getHeroes().catch(err => 
        console.warn('Failed to prefetch heroes:', err)
      );
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  // Batch multiple requests efficiently
  async batchRequest(requests) {
    const promises = requests.map(req => {
      switch (req.type) {
        case 'hero':
          return this.getHeroes();
        case 'player':
          return this.getPlayerSummary(req.id);
        case 'match':
          return this.getMatchDetails(req.id);
        case 'search':
          return this.searchPlayers(req.query);
        default:
          return Promise.resolve(null);
      }
    });

    try {
      const results = await Promise.allSettled(promises);
      return results.map((result, index) => ({
        ...requests[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }

  // Utility methods
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Clear specific cache categories
  async clearCache(category = null) {
    if (category) {
      await cacheManager.clearCategory(category);
    } else {
      await cacheManager.clearCategory('heroes');
      await cacheManager.clearCategory('players');
      await cacheManager.clearCategory('matches');
      await cacheManager.clearCategory('search');
    }
  }

  // Get cache statistics for debugging
  async getCacheStats() {
    return await cacheManager.getStats();
  }
}

// Create and export singleton instance
const optimizedApi = new OptimizedApiService();

// Auto-prefetch on initialization
optimizedApi.prefetchCommonData();

export default optimizedApi;