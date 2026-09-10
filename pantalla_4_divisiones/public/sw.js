// Kiosk Offline & Fast-Loading Service Worker - Divisiones
const CACHE_NAME = 'kiosk-divisiones-cache-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW Divisiones] Precache inicial parcial:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Soporte para peticiones parciales HTTP 206 (para video y audio HTML5)
async function handleRangeRequest(request, cachedResponse) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return cachedResponse;
  }

  const arrayBuffer = await cachedResponse.arrayBuffer();
  const bytes = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(bytes[0], 10) || 0;
  const end = bytes[1] ? parseInt(bytes[1], 10) : arrayBuffer.byteLength - 1;

  const slicedBuffer = arrayBuffer.slice(start, end + 1);
  return new Response(slicedBuffer, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      ...Object.fromEntries(cachedResponse.headers.entries()),
      'Content-Range': `bytes ${start}-${end}/${arrayBuffer.byteLength}`,
      'Content-Length': String(slicedBuffer.byteLength),
      'Accept-Ranges': 'bytes',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Excluir videos (.mp4, .webm) del Service Worker para streaming nativo por hardware sin delay ni carga de memoria
  if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) {
    return;
  }

  const isStaticAsset = (
    url.pathname.startsWith('/assets/') ||
    /\.(png|jpe?g|webp|svg|gif|mp3|woff2?|ttf|css|js)$/i.test(url.pathname)
  );

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cleanUrl = url.origin + url.pathname;
        const cached = await cache.match(cleanUrl);

        if (cached) {
          if (event.request.headers.has('range')) {
            return handleRangeRequest(event.request, cached);
          }
          return cached;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.status === 200) {
            cache.put(cleanUrl, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })
    );
    return;
  }

  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html').then((res) => res || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkPromise = fetch(event.request)
        .then((res) => {
          if (res.status === 200) {
            cache.put(event.request, res.clone());
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkPromise;
    })
  );
});
