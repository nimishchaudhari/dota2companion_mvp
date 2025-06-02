// IndexedDB wrapper for efficient client-side data storage
// Handles user profiles, favorites, and cached data

class IndexedDBService {
  constructor() {
    this.dbName = 'Dota2CompanionDB';
    this.dbVersion = 1;
    this.db = null;
    this.initialized = false;
    
    this.stores = {
      USER_PROFILES: 'userProfiles',
      HERO_FAVORITES: 'heroFavorites',
      ITEM_FAVORITES: 'itemFavorites',
      CUSTOM_BUILDS: 'customBuilds',
      MATCH_CACHE: 'matchCache',
      SETTINGS: 'settings'
    };
  }

  async initialize() {
    if (this.initialized && this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.initialized = true;
        console.log('IndexedDB initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('Upgrading IndexedDB schema');

        // User Profiles store
        if (!db.objectStoreNames.contains(this.stores.USER_PROFILES)) {
          const userStore = db.createObjectStore(this.stores.USER_PROFILES, {
            keyPath: 'user_id'
          });
          userStore.createIndex('steam_id', 'steam_id', { unique: true });
          userStore.createIndex('persona_name', 'persona_name', { unique: false });
        }

        // Hero Favorites store
        if (!db.objectStoreNames.contains(this.stores.HERO_FAVORITES)) {
          const heroStore = db.createObjectStore(this.stores.HERO_FAVORITES, {
            keyPath: 'id',
            autoIncrement: true
          });
          heroStore.createIndex('user_id', 'user_id', { unique: false });
          heroStore.createIndex('hero_id', 'hero_id', { unique: false });
          heroStore.createIndex('user_hero', ['user_id', 'hero_id'], { unique: true });
        }

        // Item Favorites store
        if (!db.objectStoreNames.contains(this.stores.ITEM_FAVORITES)) {
          const itemStore = db.createObjectStore(this.stores.ITEM_FAVORITES, {
            keyPath: 'id',
            autoIncrement: true
          });
          itemStore.createIndex('user_id', 'user_id', { unique: false });
          itemStore.createIndex('item_id', 'item_id', { unique: false });
          itemStore.createIndex('user_item', ['user_id', 'item_id'], { unique: true });
        }

        // Custom Builds store
        if (!db.objectStoreNames.contains(this.stores.CUSTOM_BUILDS)) {
          const buildStore = db.createObjectStore(this.stores.CUSTOM_BUILDS, {
            keyPath: 'build_id'
          });
          buildStore.createIndex('user_id', 'user_id', { unique: false });
          buildStore.createIndex('hero_id', 'hero_id', { unique: false });
          buildStore.createIndex('user_hero', ['user_id', 'hero_id'], { unique: false });
        }

        // Match Cache store
        if (!db.objectStoreNames.contains(this.stores.MATCH_CACHE)) {
          const matchStore = db.createObjectStore(this.stores.MATCH_CACHE, {
            keyPath: 'match_id'
          });
          matchStore.createIndex('user_id', 'user_id', { unique: false });
          matchStore.createIndex('cached_at', 'cached_at', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(this.stores.SETTINGS)) {
          db.createObjectStore(this.stores.SETTINGS, {
            keyPath: 'key'
          });
        }
      };
    });
  }

  async executeTransaction(storeName, mode, operation) {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      transaction.oncomplete = () => {
        // Transaction completed successfully
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error}`));
      };

      try {
        const request = operation(store);
        
        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error(`Operation failed: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // User Profile methods
  async saveUserProfile(profile) {
    return this.executeTransaction(
      this.stores.USER_PROFILES,
      'readwrite',
      (store) => store.put(profile)
    );
  }

  async getUserProfile(userId = null) {
    if (userId) {
      return this.executeTransaction(
        this.stores.USER_PROFILES,
        'readonly',
        (store) => store.get(userId)
      );
    }

    // Get the first/current user profile
    return this.executeTransaction(
      this.stores.USER_PROFILES,
      'readonly',
      (store) => {
        const request = store.getAll();
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const profiles = request.result;
            resolve(profiles.length > 0 ? profiles[0] : null);
          };
        });
      }
    );
  }

  async deleteUserProfile(userId) {
    return this.executeTransaction(
      this.stores.USER_PROFILES,
      'readwrite',
      (store) => store.delete(userId)
    );
  }

  // Hero Favorites methods
  async addHeroFavorite(userId, heroData) {
    const favorite = {
      user_id: userId,
      hero_id: heroData.hero_id,
      hero_name: heroData.hero_name,
      role: heroData.role,
      notes: heroData.notes || '',
      added_at: new Date().toISOString()
    };

    return this.executeTransaction(
      this.stores.HERO_FAVORITES,
      'readwrite',
      (store) => store.put(favorite)
    );
  }

  async getHeroFavorites(userId) {
    return this.executeTransaction(
      this.stores.HERO_FAVORITES,
      'readonly',
      (store) => {
        const index = store.index('user_id');
        return index.getAll(userId);
      }
    );
  }

  async removeHeroFavorite(userId, heroId) {
    return this.executeTransaction(
      this.stores.HERO_FAVORITES,
      'readwrite',
      (store) => {
        const index = store.index('user_hero');
        const request = index.get([userId, heroId]);
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const favorite = request.result;
            if (favorite) {
              const deleteRequest = store.delete(favorite.id);
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => reject(deleteRequest.error);
            } else {
              resolve(false);
            }
          };
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  // Item Favorites methods
  async addItemFavorite(userId, itemData) {
    const favorite = {
      user_id: userId,
      item_id: itemData.item_id,
      item_name: itemData.item_name,
      category: itemData.category,
      notes: itemData.notes || '',
      added_at: new Date().toISOString()
    };

    return this.executeTransaction(
      this.stores.ITEM_FAVORITES,
      'readwrite',
      (store) => store.put(favorite)
    );
  }

  async getItemFavorites(userId) {
    return this.executeTransaction(
      this.stores.ITEM_FAVORITES,
      'readonly',
      (store) => {
        const index = store.index('user_id');
        return index.getAll(userId);
      }
    );
  }

  async removeItemFavorite(userId, itemId) {
    return this.executeTransaction(
      this.stores.ITEM_FAVORITES,
      'readwrite',
      (store) => {
        const index = store.index('user_item');
        const request = index.get([userId, itemId]);
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const favorite = request.result;
            if (favorite) {
              const deleteRequest = store.delete(favorite.id);
              deleteRequest.onsuccess = () => resolve(true);
              deleteRequest.onerror = () => reject(deleteRequest.error);
            } else {
              resolve(false);
            }
          };
          request.onerror = () => reject(request.error);
        });
      }
    );
  }

  // Custom Builds methods
  async saveCustomBuild(build) {
    return this.executeTransaction(
      this.stores.CUSTOM_BUILDS,
      'readwrite',
      (store) => store.put(build)
    );
  }

  async getCustomBuilds(userId, heroId = null) {
    return this.executeTransaction(
      this.stores.CUSTOM_BUILDS,
      'readonly',
      (store) => {
        if (heroId) {
          const index = store.index('user_hero');
          return index.getAll([userId, heroId]);
        } else {
          const index = store.index('user_id');
          return index.getAll(userId);
        }
      }
    );
  }

  async deleteCustomBuild(buildId) {
    return this.executeTransaction(
      this.stores.CUSTOM_BUILDS,
      'readwrite',
      (store) => store.delete(buildId)
    );
  }

  // Match Cache methods
  async cacheMatch(userId, matchData) {
    const cacheEntry = {
      ...matchData,
      user_id: userId,
      cached_at: new Date().toISOString()
    };

    return this.executeTransaction(
      this.stores.MATCH_CACHE,
      'readwrite',
      (store) => store.put(cacheEntry)
    );
  }

  async getCachedMatches(userId, limit = 50) {
    return this.executeTransaction(
      this.stores.MATCH_CACHE,
      'readonly',
      (store) => {
        const index = store.index('user_id');
        const request = index.getAll(userId);
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            const matches = request.result;
            // Sort by cached_at descending and limit
            matches.sort((a, b) => new Date(b.cached_at) - new Date(a.cached_at));
            resolve(matches.slice(0, limit));
          };
        });
      }
    );
  }

  async clearOldMatches(userId, keepCount = 50) {
    const matches = await this.getCachedMatches(userId, 1000); // Get more than we need
    
    if (matches.length <= keepCount) {
      return; // Nothing to clean up
    }

    const toDelete = matches.slice(keepCount);
    
    return this.executeTransaction(
      this.stores.MATCH_CACHE,
      'readwrite',
      (store) => {
        const deletePromises = toDelete.map(match => 
          new Promise((resolve) => {
            const request = store.delete(match.match_id);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve(); // Continue even if delete fails
          })
        );
        
        return Promise.all(deletePromises);
      }
    );
  }

  // Settings methods
  async saveSetting(key, value) {
    const setting = { key, value, updated_at: new Date().toISOString() };
    
    return this.executeTransaction(
      this.stores.SETTINGS,
      'readwrite',
      (store) => store.put(setting)
    );
  }

  async getSetting(key, defaultValue = null) {
    const setting = await this.executeTransaction(
      this.stores.SETTINGS,
      'readonly',
      (store) => store.get(key)
    );
    
    return setting ? setting.value : defaultValue;
  }

  async deleteSetting(key) {
    return this.executeTransaction(
      this.stores.SETTINGS,
      'readwrite',
      (store) => store.delete(key)
    );
  }

  // Utility methods
  async clearAllData() {
    const stores = Object.values(this.stores);
    
    return Promise.all(
      stores.map(storeName =>
        this.executeTransaction(
          storeName,
          'readwrite',
          (store) => store.clear()
        )
      )
    );
  }

  async exportData(userId) {
    const [profile, heroFavorites, itemFavorites, customBuilds, cachedMatches] = await Promise.all([
      this.getUserProfile(userId),
      this.getHeroFavorites(userId),
      this.getItemFavorites(userId),
      this.getCustomBuilds(userId),
      this.getCachedMatches(userId)
    ]);

    return {
      profile,
      heroFavorites,
      itemFavorites,
      customBuilds,
      cachedMatches,
      exported_at: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async importData(data) {
    if (!data.profile) {
      throw new Error('Invalid data format: missing profile');
    }

    // Import profile
    await this.saveUserProfile(data.profile);

    // Import favorites and builds
    if (data.heroFavorites) {
      for (const favorite of data.heroFavorites) {
        await this.addHeroFavorite(data.profile.user_id, favorite);
      }
    }

    if (data.itemFavorites) {
      for (const favorite of data.itemFavorites) {
        await this.addItemFavorite(data.profile.user_id, favorite);
      }
    }

    if (data.customBuilds) {
      for (const build of data.customBuilds) {
        await this.saveCustomBuild(build);
      }
    }

    if (data.cachedMatches) {
      for (const match of data.cachedMatches) {
        await this.cacheMatch(data.profile.user_id, match);
      }
    }

    return { success: true };
  }

  async healthCheck() {
    try {
      if (!this.db) {
        await this.initialize();
      }

      // Test basic operations
      const testKey = 'health_check_test';
      await this.saveSetting(testKey, Date.now());
      await this.getSetting(testKey);
      await this.deleteSetting(testKey);

      return { status: 'healthy' };
    } catch (error) {
      throw new Error(`IndexedDB health check failed: ${error.message}`);
    }
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

// Export singleton instance
export const dbService = new IndexedDBService();

// Default export
export default dbService;