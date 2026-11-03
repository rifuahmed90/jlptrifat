  const CACHE_NAME = 'jlptrifat-v1';
  const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/data.js',
    '/js/firebase-config.js',
    '/js/firebase-sync.js',
    '/js/views.js',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-180.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable.svg',
    '/icons/icon-maskable-512.png'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 0 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        }))
        .catch(() => fetch(event.request))
    );
  });

  self.addEventListener('sync', (event) => {
    if (event.tag === 'save-offline-data') {
      event.waitUntil(saveOfflineData());
    }
  });

  async function saveOfflineData() {
    try {
      const cachedState = await caches.match('/state.json');
      if (cachedState) {
        const state = await cachedState.json();
        localStorage.setItem('kanji-dark-v1', JSON.stringify(state));
      }
    } catch (e) {
      console.log('Background sync error', e);
    }
  }