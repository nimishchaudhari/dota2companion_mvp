// Performance optimization utilities for the Dota 2 Companion

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';

// =================== COMPONENT OPTIMIZATION ===================

/**
 * Higher-order component for automatic memoization
 * @param {React.Component} Component - Component to memoize
 * @param {Function} areEqual - Custom comparison function
 */
export const withMemo = (Component, areEqual) => {
  return memo(Component, areEqual);
};

/**
 * Memoize expensive calculations
 * @param {Function} factory - Function to memoize
 * @param {Array} deps - Dependencies array
 */
export const useMemoized = (factory, deps) => {
  return useMemo(factory, deps);
};

/**
 * Memoize callback functions
 * @param {Function} callback - Callback to memoize
 * @param {Array} deps - Dependencies array
 */
export const useCallbackMemo = (callback, deps) => {
  return useCallback(callback, deps);
};

// =================== DATA OPTIMIZATION ===================

/**
 * Debounce function for search inputs and API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function for scroll events and frequent updates
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * LRU Cache implementation for efficient data storage
 */
export class LRUCache {
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
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// =================== VIRTUAL SCROLLING ===================

/**
 * Virtual scrolling hook for large lists
 * @param {Object} options - Configuration options
 */
export const useVirtualScroll = ({ 
  itemCount, 
  itemHeight, 
  containerHeight, 
  overscan = 5 
}) => {
  const scrollTop = useRef(0);
  const startIndex = Math.floor(scrollTop.current / itemHeight);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop.current + containerHeight) / itemHeight)
  );

  const visibleStartIndex = Math.max(0, startIndex - overscan);
  const visibleEndIndex = Math.min(itemCount - 1, endIndex + overscan);

  const onScroll = useCallback((e) => {
    scrollTop.current = e.currentTarget.scrollTop;
  }, []);

  return {
    visibleStartIndex,
    visibleEndIndex,
    onScroll,
    totalHeight: itemCount * itemHeight,
    offsetY: visibleStartIndex * itemHeight
  };
};

// =================== IMAGE OPTIMIZATION ===================

/**
 * Lazy loading hook using Intersection Observer
 */
export const useLazyLoading = (ref, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, hasLoaded, options]);

  return { isVisible, hasLoaded };
};

/**
 * Image preloader for critical assets
 * @param {Array} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
};

// =================== WEB WORKERS ===================

/**
 * Web Worker utility for heavy calculations
 */
export class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.queue = [];
    this.activeJobs = new Map();
    
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = this.handleMessage.bind(this);
      this.workers.push({ worker, busy: false });
    }
  }

  execute(data, transferable = []) {
    return new Promise((resolve, reject) => {
      const jobId = Date.now() + Math.random();
      const job = { id: jobId, data, transferable, resolve, reject };
      
      const availableWorker = this.workers.find(w => !w.busy);
      if (availableWorker) {
        this.runJob(availableWorker, job);
      } else {
        this.queue.push(job);
      }
    });
  }

  runJob(workerInfo, job) {
    workerInfo.busy = true;
    this.activeJobs.set(job.id, { workerInfo, job });
    
    workerInfo.worker.postMessage(
      { id: job.id, data: job.data }, 
      job.transferable
    );
  }

  handleMessage(event) {
    const { id, result, error } = event.data;
    const activeJob = this.activeJobs.get(id);
    
    if (activeJob) {
      const { workerInfo, job } = activeJob;
      workerInfo.busy = false;
      this.activeJobs.delete(id);
      
      if (error) {
        job.reject(new Error(error));
      } else {
        job.resolve(result);
      }
      
      // Process next job in queue
      if (this.queue.length > 0) {
        const nextJob = this.queue.shift();
        this.runJob(workerInfo, nextJob);
      }
    }
  }

  terminate() {
    this.workers.forEach(({ worker }) => worker.terminate());
    this.workers = [];
    this.queue = [];
    this.activeJobs.clear();
  }
}

// =================== REQUEST DEDUPLICATION ===================

/**
 * Request deduplication cache to prevent duplicate API calls
 */
export class RequestCache {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new LRUCache(500);
  }

  async get(key, requestFn, ttl = 300000) { // 5 minutes default TTL
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make new request
    const requestPromise = requestFn()
      .then(data => {
        this.cache.set(key, { data, timestamp: Date.now() });
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  invalidate(keyPattern) {
    if (typeof keyPattern === 'string') {
      this.cache.cache.delete(keyPattern);
    } else if (keyPattern instanceof RegExp) {
      for (const key of this.cache.cache.keys()) {
        if (keyPattern.test(key)) {
          this.cache.cache.delete(key);
        }
      }
    }
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

// =================== BUNDLE OPTIMIZATION ===================

/**
 * Dynamic import wrapper for code splitting
 * @param {Function} importFn - Dynamic import function
 */
export const lazyImport = (importFn) => {
  return React.lazy(importFn);
};

/**
 * Preload component for better UX
 * @param {Function} importFn - Dynamic import function
 */
export const preloadComponent = (importFn) => {
  importFn();
};

// =================== PERFORMANCE MONITORING ===================

/**
 * Performance timing utilities
 */
export const Performance = {
  mark: (name) => {
    if (performance && performance.mark) {
      performance.mark(name);
    }
  },

  measure: (name, startMark, endMark) => {
    if (performance && performance.measure) {
      performance.measure(name, startMark, endMark);
      const measurement = performance.getEntriesByName(name)[0];
      return measurement ? measurement.duration : 0;
    }
    return 0;
  },

  clearMarks: () => {
    if (performance && performance.clearMarks) {
      performance.clearMarks();
    }
  },

  getMemoryUsage: () => {
    if (performance && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};

// =================== COMPRESSION UTILITIES ===================

/**
 * Compress data for storage
 * @param {Object} data - Data to compress
 */
export const compressData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple compression using gzip-like technique
    return btoa(jsonString);
  } catch (error) {
    console.error('Compression failed:', error);
    return null;
  }
};

/**
 * Decompress stored data
 * @param {string} compressedData - Compressed data string
 */
export const decompressData = (compressedData) => {
  try {
    const jsonString = atob(compressedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decompression failed:', error);
    return null;
  }
};

// =================== EXPORTS ===================

// Global performance cache instance
export const globalRequestCache = new RequestCache();

// Default export with all utilities
export default {
  withMemo,
  useMemoized,
  useCallbackMemo,
  debounce,
  throttle,
  LRUCache,
  useVirtualScroll,
  useLazyLoading,
  preloadImages,
  WorkerPool,
  RequestCache,
  lazyImport,
  preloadComponent,
  Performance,
  compressData,
  decompressData,
  globalRequestCache
};