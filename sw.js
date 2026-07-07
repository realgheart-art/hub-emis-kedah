/* EMIS Kedah — Guru Data Hub · Service Worker
   Strategy:
   - App shell + reference data (SOP/Kalendar/MDV/icons/fonts): cache-first, so the
     rujukan works fully offline once visited.
   - GAS API calls (login, status, dashboard): never cached — always live network.
   Bump CACHE version whenever index.html / mdv-data.js changes to refresh clients. */

const CACHE = 'emis-kedah-v3';
const SHELL = [
  './',
  './index.html',
  './mdv-data.js',
  './manifest.webmanifest',
  './icons/logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Never cache non-GET or the GAS backend — role data must be live.
  if (req.method !== 'GET' || url.hostname.includes('script.google.com')) {
    return; // fall through to network
  }

  // Google Fonts: cache-first (stylesheet + font files) for offline typography.
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then((hit) =>
          hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit)
        )
      )
    );
    return;
  }

  // App shell / same-origin assets: cache-first, then fill cache on first fetch.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res && res.status === 200 && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
