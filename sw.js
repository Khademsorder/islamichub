// ═══════════════════════════════════════════════════
// Islamic Hub — Offline-First Service Worker
// Cache everything for zero-data usage
// ═══════════════════════════════════════════════════

const CACHE_NAME = 'islamic-hub-v10';
const STATIC_ASSETS = [
  './',
  './islamic.html',
  './quran.html',
  './index.html',
  './floating-nav.css',
  './performance-engine.js',
  './capacitor-plugins.js',
  './ai-scholar.js',
  './ai-modal.js',
  './ans-data.js',
  './app-lock.js',
  './asmaul-husna-data.js',
  './bookmark-service.js',
  './daily-content.js',
  './dua-data.js',
  './extended-hadith-data.js',
  './extended-namaz-data.js',
  './hadith-data.js',
  './islamic-stories-data.js',
  './kalima-data.js',
  './location-data.js',
  './misconceptions-data.js',
  './misconceptions-module.js',
  './namaz-data.js',
  './namaz-extras-data.js',
  './namazshikkha-data.js',
  './notification-service.js',
  './permission-service.js',
  './prayer-times.js',
  './profile-service.js',
  './qibla-compass.js',
  './question-data.js',
  './quran-module.js',
  './salah-tracker.js',
  './search-service.js',
  './sync-service.js',
  './tajbeed-checker.js',
  './vision-scanner.js',
  './zikr-counter.js',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  './islamic_banner.png',
  './islamic_premium_bg.png',
  './quran_banner.png'
];

// Install — cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching all static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — Cache-First for static, Network-First for API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls (Google, Firebase) — Network first, cache fallback
  if (url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('generativelanguage')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Audio files — Cache first, network fallback
  if (url.pathname.includes('namaz-audio') || url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Static assets — Cache first (instant load)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./islamic.html');
        }
      });
    })
  );
});
