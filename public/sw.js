const CACHE_NAME = 'todo-v4';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/offline.html',
    '/logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only intercept navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match('/offline.html');
                return cachedResponse || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            })
        );
        return;
    }

    // For non-navigation requests, use cache-first strategy
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(err => {
                // Return nothing or a placeholder for missing assets
                console.log('Fetch failed for asset', event.request.url);
            });
        })
    );
});
