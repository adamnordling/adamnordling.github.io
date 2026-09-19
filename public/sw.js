const CACHE_NAME = 'portfolio-cache-v4'; // 👈 Bumped to v4 to clear old cache
const STATIC_ASSETS = [
    './',
    './index.html',
    './404.html',
    './manifest.webmanifest',
    './assets/favicons/favicon.ico',
    './assets/favicons/favicon-16x16.png',
    './assets/favicons/favicon-32x32.png',
    './assets/favicons/apple-touch-icon.png',
    './assets/favicons/android-chrome-192x192.png',
    './assets/favicons/android-chrome-512x512.png',
    './assets/profile-300.webp',
    './assets/profile-600.webp',
    './assets/nutrition-400.webp',
    './assets/nutrition-800.webp',
    './assets/resume.pdf'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('api.github.com')) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    })
                    .catch(() => {
                        // Offline
                    });
                return cachedResponse;
            }

            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            });
        })
    );
});