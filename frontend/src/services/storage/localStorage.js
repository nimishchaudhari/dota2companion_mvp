// LocalStorage wrapper for simple key-value storage and fallback support
// Provides backup storage when IndexedDB is not available

class LocalStorageService {
  constructor() {
    this.prefix = 'dota2companion_';
    this.isAvailable = this.checkAvailability();
    
    this.keys = {
      USER_PROFILE: 'user_profile',
      HERO_FAVORITES: 'hero_favorites',
      ITEM_FAVORITES: 'item_favorites',
      CUSTOM_BUILDS: 'custom_builds',
      MATCH_CACHE: 'match_cache',
      SETTINGS: 'settings',
      LAST_SYNC: 'last_sync'
    };
  }

  checkAvailability() {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('LocalStorage not available:', error);
      return false;
    }
  }

  getPrefixedKey(key) {
    return `${this.prefix}${key}`;
  }

  setItem(key, value) {
    if (!this.isAvailable) {
      throw new Error('LocalStorage not available');
    }

    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: '1.0.0'
      });
      
      localStorage.setItem(this.getPrefixedKey(key), serialized);
      return true;
    } catch (error) {
      console.error('LocalStorage setItem failed:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(this.getPrefixedKey(key), serialized);
          return true;
        } catch (retryError) {
          throw new Error('LocalStorage quota exceeded');
        }
      }
      throw error;
    }
  }

  getItem(key, defaultValue = null) {
    if (!this.isAvailable) {
      return defaultValue;
    }

    try {
      const stored = localStorage.getItem(this.getPrefixedKey(key));
      if (!stored) {
        return defaultValue;
      }

      const parsed = JSON.parse(stored);
      return parsed.data !== undefined ? parsed.data : defaultValue;
    } catch (error) {
      console.error('LocalStorage getItem failed:', error);
      return defaultValue;
    }
  }

  removeItem(key) {
    if (!this.isAvailable) {
      return false;
    }

    try {
      localStorage.removeItem(this.getPrefixedKey(key));
      return true;
    } catch (error) {
      console.error('LocalStorage removeItem failed:', error);
      return false;
    }
  }

  // User Profile methods
  saveUserProfile(profile) {
    return this.setItem(this.keys.USER_PROFILE, profile);
  }

  getUserProfile() {
    return this.getItem(this.keys.USER_PROFILE);
  }

  deleteUserProfile() {
    return this.removeItem(this.keys.USER_PROFILE);
  }

  // Hero Favorites methods
  saveHeroFavorites(favorites) {
    return this.setItem(this.keys.HERO_FAVORITES, favorites);
  }

  getHeroFavorites() {
    return this.getItem(this.keys.HERO_FAVORITES, []);
  }

  addHeroFavorite(heroData) {
    const favorites = this.getHeroFavorites();
    
    // Check if already exists
    const existingIndex = favorites.findIndex(h => h.hero_id === heroData.hero_id);
    
    const favorite = {
      hero_id: heroData.hero_id,
      hero_name: heroData.hero_name,
      role: heroData.role,
      notes: heroData.notes || '',
      added_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      favorites[existingIndex] = favorite;
    } else {
      // Limit to 10 favorites
      if (favorites.length >= 10) {
        favorites.shift(); // Remove oldest
      }
      favorites.push(favorite);
    }

    this.saveHeroFavorites(favorites);
    return favorite;
  }

  removeHeroFavorite(heroId) {
    const favorites = this.getHeroFavorites();
    const filtered = favorites.filter(h => h.hero_id !== heroId);
    this.saveHeroFavorites(filtered);
    return true;
  }

  // Item Favorites methods
  saveItemFavorites(favorites) {
    return this.setItem(this.keys.ITEM_FAVORITES, favorites);
  }

  getItemFavorites() {
    return this.getItem(this.keys.ITEM_FAVORITES, []);
  }

  addItemFavorite(itemData) {
    const favorites = this.getItemFavorites();
    
    // Check if already exists
    const existingIndex = favorites.findIndex(i => i.item_id === itemData.item_id);
    
    const favorite = {
      item_id: itemData.item_id,
      item_name: itemData.item_name,
      category: itemData.category,
      notes: itemData.notes || '',
      added_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      favorites[existingIndex] = favorite;
    } else {
      // Limit to 20 favorites
      if (favorites.length >= 20) {
        favorites.shift(); // Remove oldest
      }
      favorites.push(favorite);
    }

    this.saveItemFavorites(favorites);
    return favorite;
  }

  removeItemFavorite(itemId) {
    const favorites = this.getItemFavorites();
    const filtered = favorites.filter(i => i.item_id !== itemId);
    this.saveItemFavorites(filtered);
    return true;
  }

  // Custom Builds methods
  saveCustomBuilds(builds) {
    return this.setItem(this.keys.CUSTOM_BUILDS, builds);
  }

  getCustomBuilds() {
    return this.getItem(this.keys.CUSTOM_BUILDS, {});
  }

  saveCustomBuild(build) {
    const builds = this.getCustomBuilds();
    builds[build.build_id] = {
      ...build,
      last_updated: new Date().toISOString()
    };
    this.saveCustomBuilds(builds);
    return build;
  }

  deleteCustomBuild(buildId) {
    const builds = this.getCustomBuilds();
    delete builds[buildId];
    this.saveCustomBuilds(builds);
    return true;
  }

  getCustomBuildsByHero(heroId) {
    const builds = this.getCustomBuilds();
    return Object.values(builds).filter(build => build.hero_id === heroId);
  }

  // Match Cache methods
  saveMatchCache(matches) {
    return this.setItem(this.keys.MATCH_CACHE, matches);
  }

  getMatchCache() {
    return this.getItem(this.keys.MATCH_CACHE, []);
  }

  cacheMatch(matchData) {
    const cache = this.getMatchCache();
    
    // Remove existing entry if exists
    const filtered = cache.filter(m => m.match_id !== matchData.match_id);
    
    // Add new entry at beginning
    const newEntry = {
      ...matchData,
      cached_at: new Date().toISOString()
    };
    
    filtered.unshift(newEntry);
    
    // Limit to 50 entries
    if (filtered.length > 50) {
      filtered.splice(50);
    }
    
    this.saveMatchCache(filtered);
    return newEntry;
  }

  getCachedMatches(limit = 10) {
    const cache = this.getMatchCache();
    return cache.slice(0, limit);
  }

  clearMatchCache() {
    return this.removeItem(this.keys.MATCH_CACHE);
  }

  // Settings methods
  saveSettings(settings) {
    return this.setItem(this.keys.SETTINGS, settings);
  }

  getSettings() {
    return this.getItem(this.keys.SETTINGS, {});
  }

  saveSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = {
      value,
      updated_at: new Date().toISOString()
    };
    this.saveSettings(settings);
    return true;
  }

  getSetting(key, defaultValue = null) {
    const settings = this.getSettings();
    return settings[key] ? settings[key].value : defaultValue;
  }

  deleteSetting(key) {
    const settings = this.getSettings();
    delete settings[key];
    this.saveSettings(settings);
    return true;
  }

  // Sync tracking
  updateLastSync() {
    return this.setItem(this.keys.LAST_SYNC, new Date().toISOString());
  }

  getLastSync() {
    return this.getItem(this.keys.LAST_SYNC);
  }

  // Utility methods
  getAllKeys() {
    if (!this.isAvailable) {
      return [];
    }

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  getStorageInfo() {
    if (!this.isAvailable) {
      return { available: false };
    }

    try {
      const keys = this.getAllKeys();
      let totalSize = 0;
      
      keys.forEach(key => {
        const value = localStorage.getItem(this.getPrefixedKey(key));
        if (value) {
          totalSize += value.length;
        }
      });

      return {
        available: true,
        keyCount: keys.length,
        totalSize: totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
        keys: keys
      };
    } catch (error) {
      return {
        available: true,
        error: error.message
      };
    }
  }

  cleanup() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      // Remove old match cache entries
      const matches = this.getMatchCache();
      if (matches.length > 25) {
        const trimmed = matches.slice(0, 25);
        this.saveMatchCache(trimmed);
      }

      // Clean up old settings
      const settings = this.getSettings();
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      let cleaned = false;
      Object.keys(settings).forEach(key => {
        const setting = settings[key];
        if (setting.updated_at && new Date(setting.updated_at).getTime() < oneWeekAgo) {
          delete settings[key];
          cleaned = true;
        }
      });

      if (cleaned) {
        this.saveSettings(settings);
      }

      console.log('LocalStorage cleanup completed');
      return true;
    } catch (error) {
      console.error('LocalStorage cleanup failed:', error);
      return false;
    }
  }

  clearAll() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        this.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Failed to clear all LocalStorage data:', error);
      return false;
    }
  }

  exportData() {
    if (!this.isAvailable) {
      throw new Error('LocalStorage not available');
    }

    const data = {
      profile: this.getUserProfile(),
      heroFavorites: this.getHeroFavorites(),
      itemFavorites: this.getItemFavorites(),
      customBuilds: this.getCustomBuilds(),
      matchCache: this.getMatchCache(),
      settings: this.getSettings(),
      exported_at: new Date().toISOString(),
      storage_info: this.getStorageInfo(),
      version: '1.0.0'
    };

    return data;
  }

  importData(data) {
    if (!this.isAvailable) {
      throw new Error('LocalStorage not available');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    try {
      if (data.profile) {
        this.saveUserProfile(data.profile);
      }

      if (data.heroFavorites) {
        this.saveHeroFavorites(data.heroFavorites);
      }

      if (data.itemFavorites) {
        this.saveItemFavorites(data.itemFavorites);
      }

      if (data.customBuilds) {
        this.saveCustomBuilds(data.customBuilds);
      }

      if (data.matchCache) {
        this.saveMatchCache(data.matchCache);
      }

      if (data.settings) {
        this.saveSettings(data.settings);
      }

      this.updateLastSync();
      return { success: true };
    } catch (error) {
      console.error('LocalStorage import failed:', error);
      throw error;
    }
  }

  healthCheck() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      // Test basic operations
      const testKey = 'health_check_test';
      const testValue = { test: Date.now() };
      
      this.setItem(testKey, testValue);
      const retrieved = this.getItem(testKey);
      this.removeItem(testKey);

      return retrieved && retrieved.test === testValue.test;
    } catch (error) {
      console.error('LocalStorage health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

// Default export
export default localStorageService;