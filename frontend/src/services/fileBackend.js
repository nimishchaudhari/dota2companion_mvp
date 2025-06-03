// Hybrid file-based backend service
// Combines static file loading with client-side storage (IndexedDB + LocalStorage)

import { dbService } from './storage/indexedDB.js';
import { localStorageService } from './storage/localStorage.js';
import { recommendationEngine } from './engine/recommendations.js';

class FileBackendService {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
    this.dataPath = '/data';
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await dbService.initialize();
      this.initialized = true;
      // FileBackend service initialized
    } catch (error) {
      console.error('Failed to initialize FileBackend service:', error);
      throw error;
    }
  }

  // Static data loading methods
  async loadStaticData(category, file) {
    const cacheKey = `${category}/${file}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.dataPath}/${category}/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${cacheKey}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading static data ${cacheKey}:`, error);
      throw error;
    }
  }

  // Hero-related methods
  async getHeroRecommendations(filters = {}) {
    await this.initialize();
    
    try {
      const data = await this.loadStaticData('heroes', 'recommendations.json');
      const userProfile = await this.getCurrentUserProfile();
      
      return recommendationEngine.filterRecommendations(
        data.recommendations,
        filters,
        userProfile
      );
    } catch (error) {
      console.error('Error getting hero recommendations:', error);
      throw error;
    }
  }

  async getHeroByRole(role) {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.role_based[role] || [];
  }

  async getBeginnerFriendlyHeroes() {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.beginner_friendly || [];
  }

  async getMetaHeroes() {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.meta_picks || [];
  }

  async getHeroCounters(heroId) {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.counter_picks[heroId] || { counters: [], countered_by: [] };
  }

  async getHeroSynergies(heroId) {
    const recommendations = await this.getHeroRecommendations();
    return recommendations.synergies.strong_combos.filter(combo =>
      combo.heroes.some(hero => hero.hero_id === parseInt(heroId))
    );
  }

  // Item and build methods
  async getItemBuilds(heroId = null, situation = null) {
    await this.initialize();
    
    try {
      const data = await this.loadStaticData('items', 'builds.json');
      
      if (heroId) {
        return data.builds.hero_builds[heroId] || null;
      }
      
      if (situation) {
        return data.builds.situation_builds[situation] || null;
      }
      
      return data.builds;
    } catch (error) {
      console.error('Error getting item builds:', error);
      throw error;
    }
  }

  async getItemsByCategory(category) {
    const data = await this.loadStaticData('items', 'builds.json');
    return data.builds.item_categories[category] || [];
  }

  // Meta analysis methods
  async getMetaAnalysis() {
    await this.initialize();
    
    try {
      const data = await this.loadStaticData('meta', 'analysis.json');
      return data.analysis;
    } catch (error) {
      console.error('Error getting meta analysis:', error);
      throw error;
    }
  }

  async getHeroTiers() {
    const meta = await this.getMetaAnalysis();
    return meta.hero_tiers;
  }

  async getPatchChanges(patch = null) {
    const meta = await this.getMetaAnalysis();
    return patch ? meta.patch_changes[patch] : meta.patch_changes;
  }

  async getTrends() {
    const meta = await this.getMetaAnalysis();
    return meta.trends;
  }

  async getMetaInsights() {
    const meta = await this.getMetaAnalysis();
    return meta.meta_insights;
  }

  // User profile management
  async getCurrentUserProfile() {
    await this.initialize();
    
    try {
      // First check IndexedDB
      let profile = await dbService.getUserProfile();
      
      if (!profile) {
        // Fallback to localStorage
        profile = localStorageService.getUserProfile();
        
        if (profile) {
          // Migrate to IndexedDB
          await dbService.saveUserProfile(profile);
        }
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async saveUserProfile(profile) {
    await this.initialize();
    
    try {
      // Save to both IndexedDB and localStorage for redundancy
      await dbService.saveUserProfile(profile);
      localStorageService.saveUserProfile(profile);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async createUserProfile(steamId, personaName, preferences = {}) {
    await this.initialize();
    
    const schema = await this.loadStaticData('users', 'schema.json');
    const defaultPrefs = schema.schema.preferences;
    
    const profile = {
      user_id: `user_${Date.now()}`,
      steam_id: steamId,
      persona_name: personaName,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      preferences: { ...defaultPrefs, ...preferences },
      favorite_heroes: [],
      favorite_items: [],
      match_history_cache: [],
      custom_builds: {},
      notes: {}
    };
    
    await this.saveUserProfile(profile);
    return profile;
  }

  async updateUserProfile(updates) {
    await this.initialize();
    
    const currentProfile = await this.getCurrentUserProfile();
    if (!currentProfile) {
      throw new Error('No user profile found');
    }
    
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      last_updated: new Date().toISOString()
    };
    
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  // Favorites management
  async addFavoriteHero(heroId, heroName, role, notes = '') {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('User profile required');
    }
    
    const favorite = {
      hero_id: heroId,
      hero_name: heroName,
      role: role,
      added_at: new Date().toISOString(),
      notes: notes
    };
    
    // Check if already exists
    const existingIndex = profile.favorite_heroes.findIndex(h => h.hero_id === heroId);
    if (existingIndex >= 0) {
      profile.favorite_heroes[existingIndex] = favorite;
    } else {
      // Limit to 10 favorites
      if (profile.favorite_heroes.length >= 10) {
        profile.favorite_heroes.shift(); // Remove oldest
      }
      profile.favorite_heroes.push(favorite);
    }
    
    await this.updateUserProfile({ favorite_heroes: profile.favorite_heroes });
    return favorite;
  }

  async removeFavoriteHero(heroId) {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('User profile required');
    }
    
    profile.favorite_heroes = profile.favorite_heroes.filter(h => h.hero_id !== heroId);
    await this.updateUserProfile({ favorite_heroes: profile.favorite_heroes });
    
    return { success: true };
  }

  async getFavoriteHeroes() {
    const profile = await this.getCurrentUserProfile();
    return profile?.favorite_heroes || [];
  }

  async addFavoriteItem(itemId, itemName, category, notes = '') {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('User profile required');
    }
    
    const favorite = {
      item_id: itemId,
      item_name: itemName,
      category: category,
      added_at: new Date().toISOString(),
      notes: notes
    };
    
    // Check if already exists
    const existingIndex = profile.favorite_items.findIndex(i => i.item_id === itemId);
    if (existingIndex >= 0) {
      profile.favorite_items[existingIndex] = favorite;
    } else {
      // Limit to 20 favorites
      if (profile.favorite_items.length >= 20) {
        profile.favorite_items.shift(); // Remove oldest
      }
      profile.favorite_items.push(favorite);
    }
    
    await this.updateUserProfile({ favorite_items: profile.favorite_items });
    return favorite;
  }

  async removeFavoriteItem(itemId) {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('User profile required');
    }
    
    profile.favorite_items = profile.favorite_items.filter(i => i.item_id !== itemId);
    await this.updateUserProfile({ favorite_items: profile.favorite_items });
    
    return { success: true };
  }

  async getFavoriteItems() {
    const profile = await this.getCurrentUserProfile();
    return profile?.favorite_items || [];
  }

  // Custom builds management
  async saveCustomBuild(heroId, buildData) {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('User profile required');
    }
    
    const buildId = buildData.build_id || `build_${Date.now()}`;
    const build = {
      ...buildData,
      build_id: buildId,
      hero_id: heroId,
      created_at: buildData.created_at || new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    if (!profile.custom_builds) {
      profile.custom_builds = {};
    }
    
    profile.custom_builds[buildId] = build;
    await this.updateUserProfile({ custom_builds: profile.custom_builds });
    
    return build;
  }

  async getCustomBuilds(heroId = null) {
    const profile = await this.getCurrentUserProfile();
    if (!profile?.custom_builds) {
      return [];
    }
    
    const builds = Object.values(profile.custom_builds);
    return heroId ? builds.filter(b => b.hero_id === heroId) : builds;
  }

  async deleteCustomBuild(buildId) {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile?.custom_builds) {
      return { success: true };
    }
    
    delete profile.custom_builds[buildId];
    await this.updateUserProfile({ custom_builds: profile.custom_builds });
    
    return { success: true };
  }

  // Match history cache
  async cacheMatchData(matchData) {
    await this.initialize();
    
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      return;
    }
    
    const cacheEntry = {
      match_id: matchData.match_id,
      hero_id: matchData.hero_id,
      result: matchData.result,
      duration: matchData.duration,
      kda: matchData.kda,
      items: matchData.items,
      cached_at: new Date().toISOString()
    };
    
    if (!profile.match_history_cache) {
      profile.match_history_cache = [];
    }
    
    // Remove existing entry if exists
    profile.match_history_cache = profile.match_history_cache.filter(
      m => m.match_id !== matchData.match_id
    );
    
    // Add new entry
    profile.match_history_cache.unshift(cacheEntry);
    
    // Limit to 50 entries
    if (profile.match_history_cache.length > 50) {
      profile.match_history_cache = profile.match_history_cache.slice(0, 50);
    }
    
    await this.updateUserProfile({ match_history_cache: profile.match_history_cache });
  }

  async getCachedMatches(limit = 10) {
    const profile = await this.getCurrentUserProfile();
    const matches = profile?.match_history_cache || [];
    return matches.slice(0, limit);
  }

  // Data synchronization
  async syncData() {
    await this.initialize();
    
    try {
      // Clear cache to force fresh data load
      this.cache.clear();
      
      // Reload static data
      await Promise.all([
        this.loadStaticData('heroes', 'recommendations.json'),
        this.loadStaticData('items', 'builds.json'),
        this.loadStaticData('meta', 'analysis.json'),
        this.loadStaticData('users', 'schema.json')
      ]);
      
      // Data sync completed
      return { success: true };
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  // Utility methods
  async exportUserData() {
    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }
    
    return {
      profile,
      exported_at: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async importUserData(userData) {
    await this.initialize();
    
    if (!userData.profile) {
      throw new Error('Invalid user data format');
    }
    
    await this.saveUserProfile(userData.profile);
    return { success: true };
  }

  // Health check
  async healthCheck() {
    try {
      await this.initialize();
      
      // Test static data loading
      await this.loadStaticData('heroes', 'recommendations.json');
      
      // Test storage services
      await dbService.healthCheck();
      const lsHealth = localStorageService.healthCheck();
      
      return {
        status: 'healthy',
        services: {
          static_data: 'ok',
          indexeddb: 'ok',
          localstorage: lsHealth ? 'ok' : 'error'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const fileBackend = new FileBackendService();

// Default export for convenience
export default fileBackend;