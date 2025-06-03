// Multi-level cache system with LRU and compression
import { openDB } from 'idb';

// LRU Cache implementation
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Compression utilities
const compress = (data) => {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
};

const decompress = (compressedData) => {
  try {
    return JSON.parse(compressedData);
  } catch {
    return null;
  }
};

// Multi-level cache manager
class CacheManager {
  constructor() {
    this.memoryCache = new LRUCache(50); // Fast access, small size
    this.sessionCache = new LRUCache(200); // Medium access, medium size
    this.dbCache = null; // Large, persistent
    this.initDB();
  }

  async initDB() {
    try {
      this.dbCache = await openDB('DotaCompanionCache', 1, {
        upgrade(db) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('category', 'category');
        },
      });
    } catch (error) {
      console.warn('Failed to initialize IndexedDB cache:', error);
    }
  }

  // Generate cache key with category and TTL info
  generateKey(category, identifier, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${category}:${identifier}${paramString ? `:${paramString}` : ''}`;
  }

  // Check if cache entry is expired
  isExpired(entry, ttl) {
    if (!entry || !entry.timestamp) return true;
    return Date.now() - entry.timestamp > ttl;
  }

  // Level 1: Memory cache (fastest)
  async getFromMemory(key) {
    return this.memoryCache.get(key);
  }

  setInMemory(key, data, category = 'default') {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      category
    });
  }

  // Level 2: Session storage cache
  async getFromSession(key) {
    const cached = this.sessionCache.get(key);
    if (cached) {
      // Promote to memory cache if frequently accessed
      this.setInMemory(key, cached.data, cached.category);
      return cached;
    }

    try {
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) {
        const entry = decompress(sessionData);
        if (entry) {
          this.sessionCache.set(key, entry);
          return entry;
        }
      }
    } catch (error) {
      console.warn('Session cache read error:', error);
    }
    return null;
  }

  setInSession(key, data, category = 'default') {
    const entry = {
      data,
      timestamp: Date.now(),
      category
    };
    
    this.sessionCache.set(key, entry);
    
    try {
      sessionStorage.setItem(key, compress(entry));
    } catch (error) {
      console.warn('Session cache write error:', error);
      // Clear some session storage if full
      this.clearOldSessionEntries();
    }
  }

  // Level 3: IndexedDB cache (persistent, largest)
  async getFromDB(key) {
    if (!this.dbCache) return null;

    try {
      const entry = await this.dbCache.get('cache', key);
      if (entry) {
        // Promote to higher levels
        this.setInSession(key, entry.data, entry.category);
        this.setInMemory(key, entry.data, entry.category);
        return entry;
      }
    } catch (error) {
      console.warn('DB cache read error:', error);
    }
    return null;
  }

  async setInDB(key, data, category = 'default') {
    if (!this.dbCache) return;

    try {
      await this.dbCache.put('cache', {
        key,
        data: compress(data),
        timestamp: Date.now(),
        category,
        size: JSON.stringify(data).length
      });
    } catch (error) {
      console.warn('DB cache write error:', error);
      // Clean old entries if storage is full
      await this.cleanDBCache();
    }
  }

  // Multi-level get (tries all levels)
  async get(key, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    // Try memory first
    const memoryEntry = await this.getFromMemory(key);
    if (memoryEntry && !this.isExpired(memoryEntry, ttl)) {
      return memoryEntry.data;
    }

    // Try session storage
    const sessionEntry = await this.getFromSession(key);
    if (sessionEntry && !this.isExpired(sessionEntry, ttl)) {
      return sessionEntry.data;
    }

    // Try IndexedDB
    const dbEntry = await this.getFromDB(key);
    if (dbEntry && !this.isExpired(dbEntry, ttl)) {
      const decompressed = decompress(dbEntry.data);
      return decompressed;
    }

    return null;
  }

  // Multi-level set (stores in all levels)
  async set(key, data, category = 'default') {
    this.setInMemory(key, data, category);
    this.setInSession(key, data, category);
    await this.setInDB(key, data, category);
  }

  // Cache with automatic key generation
  async cacheApiCall(category, identifier, apiCall, params = {}, ttl = 5 * 60 * 1000) {
    const key = this.generateKey(category, identifier, params);
    
    // Try to get from cache first
    const cached = await this.get(key, ttl);
    if (cached) {
      return cached;
    }

    // Call API and cache result
    try {
      const result = await apiCall();
      await this.set(key, result, category);
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Cleanup methods
  clearOldSessionEntries() {
    try {
      const keys = Object.keys(sessionStorage);
      const entries = keys.map(key => {
        try {
          const data = decompress(sessionStorage.getItem(key));
          return { key, timestamp: data?.timestamp || 0 };
        } catch {
          return { key, timestamp: 0 };
        }
      }).sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest 25% of entries
      const toRemove = Math.floor(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        sessionStorage.removeItem(entries[i].key);
      }
    } catch (error) {
      console.warn('Failed to clean session storage:', error);
    }
  }

  async cleanDBCache() {
    if (!this.dbCache) return;

    try {
      const tx = this.dbCache.transaction('cache', 'readwrite');
      const store = tx.objectStore('cache');
      const index = store.index('timestamp');
      
      // Get all entries sorted by timestamp
      const entries = await index.getAll();
      
      // Remove oldest 25% of entries
      const toRemove = Math.floor(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        await store.delete(entries[i].key);
      }
      
      await tx.done;
    } catch (error) {
      console.warn('Failed to clean DB cache:', error);
    }
  }

  // Clear cache by category
  async clearCategory(category) {
    // Clear memory
    for (const [key, value] of this.memoryCache.cache) {
      if (value.category === category) {
        this.memoryCache.delete(key);
      }
    }

    // Clear session
    for (const [key, value] of this.sessionCache.cache) {
      if (value.category === category) {
        this.sessionCache.delete(key);
        try {
          sessionStorage.removeItem(key);
        } catch { /* ignore */ }
      }
    }

    // Clear DB
    if (this.dbCache) {
      try {
        const tx = this.dbCache.transaction('cache', 'readwrite');
        const store = tx.objectStore('cache');
        const index = store.index('category');
        const range = IDBKeyRange.only(category);
        
        const keys = await index.getAllKeys(range);
        for (const key of keys) {
          await store.delete(key);
        }
        
        await tx.done;
      } catch (error) {
        console.warn('Failed to clear DB cache category:', error);
      }
    }
  }

  // Get cache statistics
  async getStats() {
    let dbSize = 0;
    let dbCount = 0;

    if (this.dbCache) {
      try {
        const all = await this.dbCache.getAll('cache');
        dbCount = all.length;
        dbSize = all.reduce((total, entry) => total + (entry.size || 0), 0);
      } catch { /* ignore */ }
    }

    return {
      memory: {
        count: this.memoryCache.size(),
        maxSize: this.memoryCache.maxSize
      },
      session: {
        count: this.sessionCache.size(),
        maxSize: this.sessionCache.maxSize
      },
      db: {
        count: dbCount,
        size: dbSize
      }
    };
  }
}

// Global cache instance
const cacheManager = new CacheManager();

// Export commonly used methods
export const {
  get,
  set,
  cacheApiCall,
  clearCategory,
  getStats,
  generateKey
} = cacheManager;

export default cacheManager;