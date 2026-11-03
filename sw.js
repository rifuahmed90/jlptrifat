const CACHE_NAME = 'kanji-dark-v5';
const DATA_CACHE = 'openjlpt-data-v2';

// Core app shell assets
const APP_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/responsive.css',
  '/js/firebase-config.js',
  '/js/firebase-sync.js',
  '/js/data.js',
  '/js/views.js',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable.svg',
  '/icons/icon-maskable-512.png'
];

// Data files to cache for offline use (lazy loaded)
const DATA_ASSETS = [
  '/data/n5.json',
  '/data/n4.json',
  '/data/n3.json',
  '/data/n2.json',
  '/data/n1.json',
  '/data/radicals.json',
  '/data/grammar.json'
];

// Install: cache app shell + data files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_ASSETS))
      .then(() => caches.open(DATA_CACHE))
      .then(cache => cache.addAll(DATA_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first for app shell, stale-while-revalidate for data
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or cross-origin requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Data files: stale-while-revalidate
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Return cached response if network fails
            return response || new Response(JSON.stringify({ error: 'Offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });

          // Return cached immediately, update in background (stale-while-revalidate)
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // App assets: network-first with offline cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Background sync for offline data backup
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-offline-backup') {
    event.waitUntil(saveOfflineBackup());
  }
});

async function saveOfflineBackup() {
  try {
    const allData = {};

    const dataCache = await caches.open(DATA_CACHE);

    const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];
    for (const level of levels) {
      const response = await dataCache.match(`/data/${level}.json`);
      if (response) {
        allData[level] = await response.json();
      }
    }

    const radicalResponse = await dataCache.match('/data/radicals.json');
    if (radicalResponse) {
      allData.radicals = await radicalResponse.json();
    }

    const grammarResponse = await dataCache.match('/data/grammar.json');
    if (grammarResponse) {
      allData.grammar = await grammarResponse.json();
    }

    // Send to client for localStorage save
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'OFFLINE_BACKUP',
        data: allData
      });
    });
  } catch (e) {
    console.warn('Background sync failed:', e);
  }
}