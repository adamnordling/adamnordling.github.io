const CACHE_NAME = 'portfolio-cache-v5'; // 👈 Bumpad till v5 för att aktivera direkt
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

    // 1. GYLLENE REGEL: Fånga BARA upp anrop till din egen domän (same-origin)
    // Låt Cloudflare Insights, GitHub API och tillägg skötas direkt av webbläsaren!
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    const url = new URL(event.request.url);

    // 2. Ignorera eventuella lokala utvecklingsfiler
    if (
        url.pathname.startsWith('/@') ||
        url.pathname.includes('/src/') ||
        url.searchParams.has('t')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                // Hämta färsk version i bakgrunden (stale-while-revalidate)
                fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse).catch(() => {
                                });
                            });
                        }
                    })
                    .catch(() => {
                        // Offline
                    });
                return cachedResponse;
            }

            return fetch(event.request)
                .then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache).catch(() => {
                        });
                    });
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match('./index.html');
                });
        })
    );
});