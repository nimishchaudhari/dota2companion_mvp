// frontend/src/utils/assetOptimization.js
/**
 * Asset Optimization Utilities for Dota 2 Companion
 * Handles image loading, caching, and performance optimizations
 */

// WebP support detection
let webpSupported = null;

export const checkWebPSupport = () => {
  if (webpSupported !== null) return Promise.resolve(webpSupported);
  
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = (webP.height === 2);
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Image format optimization
export const getOptimizedImageUrl = async (originalUrl, options = {}) => {
  const { 
    width, 
    height, 
    quality = 80, 
    format = 'auto',
    fallback = true 
  } = options;

  // If it's already a data URL or placeholder, return as-is
  if (originalUrl.startsWith('data:') || originalUrl.startsWith('/placeholder-')) {
    return originalUrl;
  }

  // Check if we should use WebP
  const shouldUseWebP = format === 'webp' || (format === 'auto' && await checkWebPSupport());

  // For Steam CDN URLs, we can add query parameters for optimization
  if (originalUrl.includes('steamstatic.com') || originalUrl.includes('opendota.com')) {
    const url = new URL(originalUrl);
    
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    if (quality !== 80) url.searchParams.set('q', quality.toString());
    if (shouldUseWebP && fallback) url.searchParams.set('f', 'webp');
    
    return url.toString();
  }

  return originalUrl;
};

// Lazy loading with Intersection Observer
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    this.observer = null;
    this.images = new Set();
    
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
    }
  }

  observe(imgElement) {
    if (this.observer && imgElement) {
      this.images.add(imgElement);
      this.observer.observe(imgElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(imgElement);
    }
  }

  unobserve(imgElement) {
    if (this.observer && imgElement) {
      this.images.delete(imgElement);
      this.observer.unobserve(imgElement);
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
        this.images.delete(entry.target);
      }
    });
  }

  async loadImage(imgElement) {
    const src = imgElement.dataset.src;
    if (!src) return;

    try {
      // Optimize the image URL
      const optimizedSrc = await getOptimizedImageUrl(src, {
        width: imgElement.dataset.width,
        height: imgElement.dataset.height,
        quality: imgElement.dataset.quality
      });

      // Create new image to preload
      const img = new Image();
      img.onload = () => {
        imgElement.src = optimizedSrc;
        imgElement.classList.add('loaded');
        imgElement.classList.remove('loading');
      };
      img.onerror = () => {
        // Fallback to placeholder or original src
        const fallbackSrc = imgElement.dataset.fallback || src;
        imgElement.src = fallbackSrc;
        imgElement.classList.add('error');
        imgElement.classList.remove('loading');
      };
      img.src = optimizedSrc;
    } catch (error) {
      console.warn('Failed to optimize image:', src, error);
      imgElement.src = src;
      imgElement.classList.remove('loading');
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Global lazy loader instance
export const globalLazyLoader = new LazyImageLoader();

// Image preloading utility
export const preloadImages = (urls, options = {}) => {
  const { priority = 'low', timeout = 10000 } = options;
  
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image preload timeout: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve(url);
      };
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to preload: ${url}`));
      };

      // Set loading priority if supported
      if ('loading' in img) {
        img.loading = priority === 'high' ? 'eager' : 'lazy';
      }

      img.src = url;
    });
  });

  return Promise.allSettled(promises);
};

// Image cache with LRU eviction
export class ImageCache {
  constructor(maxSize = 100, maxAge = 30 * 60 * 1000) { // 30 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
    this.accessTimes = new Map();
  }

  set(key, value) {
    const now = Date.now();
    
    // Remove old entry if it exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
    }

    // Add new entry
    this.cache.set(key, { value, timestamp: now });
    this.accessTimes.set(key, now);

    // Evict if over size limit
    if (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return null;
    }

    // Update access time
    this.accessTimes.set(key, now);
    return entry.value;
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
    }
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  has(key) {
    return this.cache.has(key) && this.get(key) !== null;
  }

  size() {
    return this.cache.size;
  }
}

// Global image cache
export const imageCache = new ImageCache();

// Progressive image loading component helper
export const createProgressiveImageProps = (src, options = {}) => {
  const {
    lowQualitySrc,
    placeholder = '/placeholder-hero.svg',
    alt = '',
    width,
    height,
    loading = 'lazy',
    className = ''
  } = options;

  return {
    'data-src': src,
    'data-width': width,
    'data-height': height,
    'data-fallback': placeholder,
    src: lowQualitySrc || placeholder,
    alt,
    loading,
    className: `${className} loading progressive-image`,
    onLoad: (e) => {
      if (e.target.src !== src) {
        // This is the low quality/placeholder load
        globalLazyLoader.observe(e.target);
      }
    },
    onError: (e) => {
      if (e.target.src !== placeholder) {
        e.target.src = placeholder;
      }
    }
  };
};

// Performance monitoring
export const performanceMonitor = {
  metrics: {
    imageLoads: 0,
    imageErrors: 0,
    totalLoadTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  },

  recordImageLoad(url, loadTime) {
    this.metrics.imageLoads++;
    this.metrics.totalLoadTime += loadTime;
    // Image loaded
  },

  recordImageError(url, error) {
    this.metrics.imageErrors++;
    console.warn(`Image error: ${url}`, error);
  },

  recordCacheHit(url) {
    this.metrics.cacheHits++;
    // Cache hit
  },

  recordCacheMiss(url) {
    this.metrics.cacheMisses++;
    // Cache miss
  },

  getStats() {
    const avgLoadTime = this.metrics.imageLoads > 0 
      ? this.metrics.totalLoadTime / this.metrics.imageLoads 
      : 0;
    
    const errorRate = this.metrics.imageLoads > 0
      ? this.metrics.imageErrors / this.metrics.imageLoads
      : 0;

    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;

    return {
      ...this.metrics,
      avgLoadTime: Math.round(avgLoadTime),
      errorRate: Math.round(errorRate * 100),
      cacheHitRate: Math.round(cacheHitRate * 100)
    };
  },

  reset() {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = 0;
    });
  }
};

// Asset preloading strategy
export const assetPreloader = {
  critical: [
    '/favicon.svg',
    '/data/index.json',
    '/data/heroes/recommendations.json'
  ],
  
  important: [
    '/data/meta/analysis.json',
    '/placeholder-hero.svg',
    '/placeholder-item.svg'
  ],

  async preloadCriticalAssets() {
    // Preloading critical assets...
    try {
      await preloadImages(this.critical, { priority: 'high', timeout: 5000 });
      // Critical assets preloaded
    } catch (error) {
      console.warn('Some critical assets failed to preload:', error);
    }
  },

  async preloadImportantAssets() {
    // Preloading important assets...
    try {
      await preloadImages(this.important, { priority: 'low', timeout: 10000 });
      // Important assets preloaded
    } catch (error) {
      console.warn('Some important assets failed to preload:', error);
    }
  },

  async preloadHeroImages(heroes, count = 20) {
    if (!heroes || heroes.length === 0) return;

    const heroImages = heroes
      .slice(0, count)
      .map(hero => hero.icon || hero.img)
      .filter(Boolean);

    // Preloading hero images...
    try {
      await preloadImages(heroImages, { priority: 'low', timeout: 8000 });
      // Hero images preloaded
    } catch (error) {
      console.warn('Some hero images failed to preload:', error);
    }
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    assetPreloader.preloadCriticalAssets();
    
    // Preload important assets after a delay
    setTimeout(() => {
      assetPreloader.preloadImportantAssets();
    }, 2000);
  });
}

export default {
  checkWebPSupport,
  getOptimizedImageUrl,
  LazyImageLoader,
  globalLazyLoader,
  preloadImages,
  ImageCache,
  imageCache,
  createProgressiveImageProps,
  performanceMonitor,
  assetPreloader
};