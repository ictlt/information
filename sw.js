const CACHE_NAME = 'school-inventory-cache-v3';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './sw.js',
  './logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through Supabase API calls directly without caching
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Network-First Strategy for HTML pages & navigation requests
  // Ensures PWA always fetches the latest index.html from GitHub/Server when online!
  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.html') || requestUrl.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Cache-First with Network Revalidation fallback for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch((err) => console.log('[SW] Fetch failed, fallback to cache', err));

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle clicking on system notification (Open/Focus PWA)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return self.clients.openWindow('./');
    })
  );
});

// Handle incoming background Web Push notifications
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'แจ้งเตือนระบบพัสดุ', body: event.data.text() };
    }
  }

  const title = data.title || 'ระบบบริหารงานพัสดุและครุภัณฑ์';
  const options = {
    body: data.body || 'มีข้อมูลอัปเดตใหม่ในระบบ',
    icon: './logo.png',
    badge: './logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: './'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
