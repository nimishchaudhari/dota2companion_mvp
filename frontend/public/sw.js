// Service Worker for Dota 2 Companion PWA
const CACHE_NAME = 'dota2-companion-v1.0.2';
const STATIC_CACHE = 'dota2-static-v1.2';
const DATA_CACHE = 'dota2-data-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-48.png',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-144.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/icon-192.svg',
  '/icon-512.svg',
  '/placeholder-hero.svg',
  '/placeholder-item.svg',
  '/splash-640x1136.svg',
  '/splash-1280x720.svg',
  '/data/index.json',
  '/data/heroes/recommendations.json',
  '/data/meta/analysis.json',
  '/data/users/schema.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  'https://api.opendota.com/api/heroStats',
  'https://api.opendota.com/api/constants/heroes'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SW: Installing service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('SW: Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE && cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.hostname === 'api.opendota.com') {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle data files
  if (request.url.includes('/data/')) {
    event.respondWith(handleDataRequest(request));
    return;
  }

  // Handle static assets
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Strategy: Cache First for static assets
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Static request failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Strategy: Network First with Cache Fallback for API data
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: API request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Strategy: Cache First for data files
async function handleDataRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cache is stale (older than 5 minutes)
      const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
      const now = new Date();
      const cacheAge = now - cacheDate;
      
      // If cache is fresh, return it
      if (cacheAge < 5 * 60 * 1000) {
        return cachedResponse;
      }
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Data request failed:', error);
    
    // Return cached version even if stale
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for data updates
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-data') {
    event.waitUntil(updateDataCache());
  }
});

// Update data cache in background
async function updateDataCache() {
  try {
    const cache = await caches.open(DATA_CACHE);
    
    // Update hero data
    const heroResponse = await fetch('https://api.opendota.com/api/heroStats');
    if (heroResponse.ok) {
      await cache.put('https://api.opendota.com/api/heroStats', heroResponse);
    }
    
    console.log('SW: Background data sync completed');
  } catch (error) {
    console.log('SW: Background sync failed:', error);
  }
}

// Handle push notifications (future feature)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New Dota 2 update available!',
      icon: '/icon-192.svg',
      badge: '/favicon.svg',
      tag: 'dota2-companion',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Dota 2 Companion', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Cache management - limit cache size
async function manageCacheSize(cacheName, maxSize = 50) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Remove oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`SW: Cleaned ${keysToDelete.length} entries from ${cacheName}`);
  }
}

// Periodic cleanup
setInterval(() => {
  manageCacheSize(DATA_CACHE, 50);
  manageCacheSize(STATIC_CACHE, 100);
}, 10 * 60 * 1000); // Every 10 minutes