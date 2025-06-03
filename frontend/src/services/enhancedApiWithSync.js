// Enhanced API service with background sync and advanced caching
import axios from 'axios';

const OPENDOTA_API_URL = 'https://api.opendota.com/api';

// IndexedDB for offline storage
class OfflineStorage {
  constructor() {
    this.dbName = 'dota2-companion-db';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Heroes store
        if (!db.objectStoreNames.contains('heroes')) {
          const heroesStore = db.createObjectStore('heroes', { keyPath: 'id' });
          heroesStore.createIndex('name', 'name', { unique: false });
          heroesStore.createIndex('primary_attr', 'primary_attr', { unique: false });
        }
        
        // Players store
        if (!db.objectStoreNames.contains('players')) {
          const playersStore = db.createObjectStore('players', { keyPath: 'account_id' });
          playersStore.createIndex('personaname', 'personaname', { unique: false });
        }
        
        // Matches store
        if (!db.objectStoreNames.contains('matches')) {
          const matchesStore = db.createObjectStore('matches', { keyPath: 'match_id' });
          matchesStore.createIndex('start_time', 'start_time', { unique: false });
        }
        
        // Failed requests queue
        if (!db.objectStoreNames.contains('failed_requests')) {
          const failedStore = db.createObjectStore('failed_requests', { keyPath: 'id', autoIncrement: true });
          failedStore.createIndex('timestamp', 'timestamp', { unique: false });
          failedStore.createIndex('retry_count', 'retry_count', { unique: false });
        }
        
        // Cache metadata
        if (!db.objectStoreNames.contains('cache_metadata')) {
          const metaStore = db.createObjectStore('cache_metadata', { keyPath: 'key' });
          metaStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  async get(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Background sync queue
class BackgroundSyncQueue {
  constructor(storage) {
    this.storage = storage;
    this.retryDelay = 5000; // 5 seconds
    this.maxRetries = 3;
  }

  async addFailedRequest(requestData) {
    const failedRequest = {
      ...requestData,
      timestamp: Date.now(),
      retry_count: 0
    };
    
    await this.storage.put('failed_requests', failedRequest);
    console.log('Added failed request to sync queue:', requestData.url);
  }

  async processQueue() {
    if (!navigator.onLine) {
      console.log('Offline - skipping sync queue processing');
      return;
    }

    const failedRequests = await this.storage.getAll('failed_requests');
    
    for (const request of failedRequests) {
      if (request.retry_count >= this.maxRetries) {
        await this.storage.delete('failed_requests', request.id);
        console.log('Max retries reached for request:', request.url);
        continue;
      }

      try {
        const response = await fetch(request.url, {
          method: request.method || 'GET',
          headers: request.headers || {},
          body: request.body
        });

        if (response.ok) {
          // Success - process the response and remove from queue
          await this.storage.delete('failed_requests', request.id);
          console.log('Successfully retried request:', request.url);
          
          // If this was a GET request, cache the result
          if (!request.method || request.method === 'GET') {
            const data = await response.json();
            await this.cacheApiResponse(request.url, data);
          }
        } else {
          // Still failing - increment retry count
          request.retry_count++;
          await this.storage.put('failed_requests', request);
        }
      } catch (error) {
        // Still failing - increment retry count
        request.retry_count++;
        await this.storage.put('failed_requests', request);
        console.log('Retry failed for request:', request.url, error);
      }
    }
  }

  async cacheApiResponse(url, data) {
    if (url.includes('/heroStats')) {
      const heroes = data.map(hero => ({
        ...hero,
        cached_at: Date.now()
      }));
      
      for (const hero of heroes) {
        await this.storage.put('heroes', hero);
      }
    } else if (url.includes('/players/')) {
      await this.storage.put('players', { ...data, cached_at: Date.now() });
    } else if (url.includes('/matches/')) {
      await this.storage.put('matches', { ...data, cached_at: Date.now() });
    }
  }
}

// Cache manager with TTL
class CacheManager {
  constructor(storage) {
    this.storage = storage;
    this.ttl = {
      heroes: 60 * 60 * 1000, // 1 hour
      players: 30 * 60 * 1000, // 30 minutes
      matches: 24 * 60 * 60 * 1000, // 24 hours
      default: 15 * 60 * 1000 // 15 minutes
    };
  }

  async getCacheKey(url) {
    return btoa(url).replace(/[+/=]/g, '');
  }

  async isCacheValid(key, type = 'default') {
    const metadata = await this.storage.get('cache_metadata', key);
    if (!metadata) return false;
    
    const maxAge = this.ttl[type] || this.ttl.default;
    return Date.now() - metadata.timestamp < maxAge;
  }

  async setCacheMetadata(key, type = 'default') {
    await this.storage.put('cache_metadata', {
      key,
      type,
      timestamp: Date.now(),
      expiry: Date.now() + (this.ttl[type] || this.ttl.default)
    });
  }

  async cleanExpiredCache() {
    const metadata = await this.storage.getAll('cache_metadata');
    const now = Date.now();
    
    for (const meta of metadata) {
      if (now > meta.expiry) {
        await this.storage.delete('cache_metadata', meta.key);
      }
    }
  }
}

// Enhanced API class
class EnhancedApiService {
  constructor() {
    this.storage = new OfflineStorage();
    this.syncQueue = new BackgroundSyncQueue(this.storage);
    this.cacheManager = new CacheManager(this.storage);
    this.initialized = false;
    
    // Initialize on first use
    this.init();
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await this.storage.init();
      this.initialized = true;
      
      // Set up background sync
      this.startBackgroundSync();
      
      // Clean expired cache periodically
      setInterval(() => {
        this.cacheManager.cleanExpiredCache();
      }, 10 * 60 * 1000); // Every 10 minutes
      
      console.log('Enhanced API service initialized');
    } catch (error) {
      console.error('Failed to initialize enhanced API service:', error);
    }
  }

  startBackgroundSync() {
    // Process sync queue when online
    window.addEventListener('online', () => {
      console.log('Back online - processing sync queue');
      this.syncQueue.processQueue();
    });

    // Process queue periodically when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncQueue.processQueue();
      }
    }, 30000); // Every 30 seconds
  }

  async makeRequest(url, options = {}) {
    const cacheKey = await this.cacheManager.getCacheKey(url);
    
    try {
      // Try network first
      const response = await axios.get(url, options);
      
      // Cache successful response
      await this.syncQueue.cacheApiResponse(url, response.data);
      await this.cacheManager.setCacheMetadata(cacheKey, this.getCacheType(url));
      
      return response.data;
    } catch (error) {
      console.log('Network request failed, checking cache:', url);
      
      // If offline or network failed, add to sync queue
      if (!navigator.onLine || error.code === 'NETWORK_ERROR') {
        await this.syncQueue.addFailedRequest({
          url,
          method: 'GET',
          headers: options.headers
        });
      }
      
      // Try to return cached data
      return await this.getCachedData(url);
    }
  }

  getCacheType(url) {
    if (url.includes('/heroStats')) return 'heroes';
    if (url.includes('/players/')) return 'players';
    if (url.includes('/matches/')) return 'matches';
    return 'default';
  }

  async getCachedData(url) {
    if (url.includes('/heroStats')) {
      const heroes = await this.storage.getAll('heroes');
      return heroes.length > 0 ? heroes : null;
    } else if (url.includes('/players/')) {
      const accountId = url.split('/players/')[1].split('/')[0];
      return await this.storage.get('players', parseInt(accountId));
    } else if (url.includes('/matches/')) {
      const matchId = url.split('/matches/')[1];
      return await this.storage.get('matches', parseInt(matchId));
    }
    
    return null;
  }

  // API methods
  async getHeroes() {
    const url = `${OPENDOTA_API_URL}/heroStats`;
    const data = await this.makeRequest(url);
    
    if (!data) {
      throw new Error('No hero data available offline');
    }
    
    const dotaCdnBase = 'https://cdn.cloudflare.steamstatic.com';
    
    return data.map(hero => ({
      id: hero.id,
      name: hero.name,
      localized_name: hero.localized_name,
      primary_attr: hero.primary_attr,
      attack_type: hero.attack_type,
      roles: hero.roles,
      img: `${dotaCdnBase}${hero.img}`,
      icon: `${dotaCdnBase}${hero.icon}`,
      cached: !!hero.cached_at
    }));
  }

  async getPlayerSummary(accountId) {
    // Demo player data for immediate testing
    const demoPlayerData = {
      "76561197960287930": {
        profile: {
          account_id: 76561197960287930,
          personaname: "Arteezy",
          avatarfull: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg",
          profileurl: "https://steamcommunity.com/id/arteezy/",
          last_login: "2024-01-15T12:30:00Z"
        },
        mmr_estimate: { estimate: 8500 },
        winLoss: { win: 2847, lose: 2156 },
        recentMatches: [
          {
            match_id: 7654321001,
            hero_id: 1,
            player_slot: 0,
            radiant_win: true,
            duration: 2847,
            game_mode: 22,
            kills: 12,
            deaths: 3,
            assists: 8,
            start_time: 1704110400
          },
          {
            match_id: 7654321002,
            hero_id: 8,
            player_slot: 1,
            radiant_win: false,
            duration: 3156,
            game_mode: 22,
            kills: 8,
            deaths: 5,
            assists: 12,
            start_time: 1704024000
          }
        ],
        isDemo: true
      },
      "76561197991735941": {
        profile: {
          account_id: 76561197991735941,
          personaname: "Dendi",
          avatarfull: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/26/26fd5938edc5d5bd0f9b85c0a51da7b6d96f9bb9_full.jpg",
          profileurl: "https://steamcommunity.com/id/dendi/",
          last_login: "2024-01-14T10:15:00Z"
        },
        mmr_estimate: { estimate: 7200 },
        winLoss: { win: 3241, lose: 2897 },
        recentMatches: [
          {
            match_id: 7654321003,
            hero_id: 74,
            player_slot: 128,
            radiant_win: true,
            duration: 2534,
            game_mode: 22,
            kills: 15,
            deaths: 2,
            assists: 10,
            start_time: 1703937600
          }
        ],
        isDemo: true
      },
      "76561197971311380": {
        profile: {
          account_id: 76561197971311380,
          personaname: "AdmiralBulldog",
          avatarfull: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/8a/8ae2c5e2c1aa2fdf72af98a3bde0c90fd88b4fca_full.jpg",
          profileurl: "https://steamcommunity.com/id/admiralbulldog/",
          last_login: "2024-01-13T16:45:00Z"
        },
        mmr_estimate: { estimate: 7800 },
        winLoss: { win: 2156, lose: 1843 },
        recentMatches: [
          {
            match_id: 7654321004,
            hero_id: 38,
            player_slot: 132,
            radiant_win: false,
            duration: 3421,
            game_mode: 22,
            kills: 6,
            deaths: 8,
            assists: 14,
            start_time: 1703851200
          }
        ],
        isDemo: true
      }
    };

    // Check if this is a demo player first
    if (demoPlayerData[accountId]) {
      console.log('Returning demo player data for:', accountId);
      return demoPlayerData[accountId];
    }

    const baseUrl = `${OPENDOTA_API_URL}/players/${accountId}`;
    
    try {
      // Try real API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const [playerRes, wlRes, recentMatchesRes] = await Promise.allSettled([
        fetch(baseUrl, { signal: controller.signal }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/wl`, { signal: controller.signal }).then(r => r.ok ? r.json() : null),
        fetch(`${baseUrl}/recentMatches?limit=5`, { signal: controller.signal }).then(r => r.ok ? r.json() : null)
      ]);
      
      clearTimeout(timeoutId);

      const player = playerRes.status === 'fulfilled' ? playerRes.value : null;
      const wl = wlRes.status === 'fulfilled' ? wlRes.value : { win: 0, lose: 0 };
      const matches = recentMatchesRes.status === 'fulfilled' ? recentMatchesRes.value : [];

      if (player?.profile) {
        return {
          profile: player.profile,
          mmr_estimate: player.mmr_estimate || { estimate: null },
          winLoss: wl,
          recentMatches: (matches || []).map(match => ({
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
          cached: false
        };
      } else {
        // Return a generic demo player if real API fails
        return {
          profile: {
            account_id: accountId,
            personaname: "Demo Player",
            avatarfull: "/placeholder-hero.svg",
            profileurl: "#",
            last_login: new Date().toISOString()
          },
          mmr_estimate: { estimate: 3500 },
          winLoss: { win: 150, lose: 120 },
          recentMatches: [
            {
              match_id: Date.now(),
              hero_id: 1,
              player_slot: 0,
              radiant_win: true,
              duration: 2400,
              game_mode: 22,
              kills: 8,
              deaths: 4,
              assists: 6,
              start_time: Math.floor(Date.now() / 1000) - 3600
            }
          ],
          isDemo: true,
          message: "Demo player data (API unavailable)"
        };
      }
    } catch (error) {
      console.error('Error fetching player summary:', error);
      
      // Return demo data as fallback
      return {
        profile: {
          account_id: accountId,
          personaname: "Demo Player",
          avatarfull: "/placeholder-hero.svg",
          profileurl: "#",
          last_login: new Date().toISOString()
        },
        mmr_estimate: { estimate: 3500 },
        winLoss: { win: 150, lose: 120 },
        recentMatches: [
          {
            match_id: Date.now(),
            hero_id: 1,
            player_slot: 0,
            radiant_win: true,
            duration: 2400,
            game_mode: 22,
            kills: 8,
            deaths: 4,
            assists: 6,
            start_time: Math.floor(Date.now() / 1000) - 3600
          }
        ],
        isDemo: true,
        message: "Demo player data"
      };
    }
  }

  async searchPlayers(query) {
    // Demo players for immediate testing
    const demoPlayers = [
      {
        steamId: "76561197960287930",
        personaName: "Arteezy",
        avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/df/df778904318914107338066888cf9389f6972978_full.jpg",
        isDemo: true
      },
      {
        steamId: "76561197991735941", 
        personaName: "Dendi",
        avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/26/26fd5938edc5d5bd0f9b85c0a51da7b6d96f9bb9_full.jpg",
        isDemo: true
      },
      {
        steamId: "76561197971311380",
        personaName: "AdmiralBulldog",
        avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/8a/8ae2c5e2c1aa2fdf72af98a3bde0c90fd88b4fca_full.jpg",
        isDemo: true
      },
      {
        steamId: "76561197992027213",
        personaName: "Miracle-",
        avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/45/451c22ce7ac4e1a6e9e7acc21dfcadc7f80b2f12_full.jpg",
        isDemo: true
      },
      {
        steamId: "76561197961357299",
        personaName: "Invoker Guy",
        avatar: "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/11/11e2c8b6c5d9ffa59b2e9b7c13c88b2c42f2c75e_full.jpg",
        isDemo: true
      }
    ];

    try {
      // First try real API with shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      // If query is a number (Steam ID or Dota 2 ID), try to fetch the player directly
      if (/^\d{5,}$/.test(query.trim())) {
        try {
          const response = await fetch(`${OPENDOTA_API_URL}/players/${query.trim()}`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const playerData = await response.json();
            if (playerData?.profile) {
              return {
                players: [{
                  steamId: playerData.profile.account_id,
                  personaName: playerData.profile.personaname,
                  avatar: playerData.profile.avatarfull,
                  isDemo: false
                }]
              };
            }
          }
        } catch (apiError) {
          console.log('API request failed, using demo data');
        }
      } else {
        // Try search API
        try {
          const response = await fetch(`${OPENDOTA_API_URL}/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const searchData = await response.json();
            if (searchData && searchData.length > 0) {
              const players = searchData.slice(0, 5).map(p => ({
                steamId: p.account_id,
                personaName: p.personaname,
                avatar: p.avatarfull,
                similarity: p.similarity,
                isDemo: false
              }));
              return { players };
            }
          }
        } catch (apiError) {
          console.log('API search failed, using demo data');
        }
      }
      
      // Fallback to demo data with smart filtering
      const filteredDemo = demoPlayers.filter(player => 
        player.personaName.toLowerCase().includes(query.toLowerCase()) ||
        player.steamId.includes(query)
      );
      
      // If no matches, return a few random demo players
      const playersToReturn = filteredDemo.length > 0 ? filteredDemo : demoPlayers.slice(0, 3);
      
      return { 
        players: playersToReturn,
        isDemo: true,
        message: "Showing demo players (API unavailable)"
      };
      
    } catch (error) {
      console.error('Search completely failed, returning demo data:', error);
      
      // Return demo data as ultimate fallback
      return { 
        players: demoPlayers.slice(0, 3),
        isDemo: true,
        message: "Showing demo players"
      };
    }
  }

  async getMatchDetails(matchId) {
    const data = await this.makeRequest(`${OPENDOTA_API_URL}/matches/${matchId}`);
    
    if (!data) {
      throw new Error('Match not found');
    }

    return {
      match_id: data.match_id,
      radiant_win: data.radiant_win,
      duration: data.duration,
      radiant_score: data.radiant_score,
      dire_score: data.dire_score,
      start_time: data.start_time,
      game_mode: data.game_mode,
      players: data.players?.map(p => ({
        account_id: p.account_id,
        player_slot: p.player_slot,
        hero_id: p.hero_id,
        personaname: p.personaname || 'Anonymous',
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
      })) || [],
      cached: !!data.cached_at
    };
  }

  // Offline data management
  async getOfflineHeroes() {
    return await this.storage.getAll('heroes');
  }

  async getOfflineStats() {
    const heroes = await this.storage.getAll('heroes');
    const players = await this.storage.getAll('players');
    const matches = await this.storage.getAll('matches');
    const failedRequests = await this.storage.getAll('failed_requests');
    
    return {
      heroes: heroes.length,
      players: players.length,
      matches: matches.length,
      pendingSync: failedRequests.length,
      isOnline: navigator.onLine
    };
  }

  async clearOfflineData() {
    const stores = ['heroes', 'players', 'matches', 'failed_requests', 'cache_metadata'];
    for (const store of stores) {
      const items = await this.storage.getAll(store);
      for (const item of items) {
        await this.storage.delete(store, item.id || item.account_id || item.match_id || item.key);
      }
    }
  }
}

// Create singleton instance
export const enhancedApi = new EnhancedApiService();

// Mock authentication (unchanged)
export const mockAuth = {
  user: null,
  
  async login(username) {
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