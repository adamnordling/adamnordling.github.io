// sw.js - Safe Stale-While-Revalidate Service Worker
const CACHE_NAME = 'portfolio-cache-v1';

// List of core assets to cache on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './src/style.css',
    './src/main.js',
    './src/assets/profile-picture-resized.webp',
    './src/assets/favicon.svg'
];

self.addEventListener('install', event => {
    // Force immediate activation; do not wait in limbo
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', event => {
    // Clean up old caches if CACHE_NAME increments
    event.waitUntil(
        caches
            .keys()
            .then(keys =>
                Promise.all(
                    keys.map(key => {
                        if (key !== CACHE_NAME) return caches.delete(key);
                    })
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Do not intercept external API calls (e.g. GitHub API)
    if (!event.request.url.startsWith(self.location.origin)) return;

    // Stale-While-Revalidate: Return cache immediately, update cache in background
    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const cachedResponse = await cache.match(event.request);

            const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Network failed; offline mode fallback
                    return cachedResponse;
                });

            return cachedResponse || fetchPromise;
        })
    );
});
