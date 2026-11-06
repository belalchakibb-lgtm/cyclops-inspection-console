/* CYCLOPS service worker: keeps the app usable offline on site.
   Bump VERSION whenever a cached file changes so devices pick up the update. */
const VERSION = 'cyclops-v2026-11-06a';
const SHELL = [
  '/', '/cyclops-study.js', '/cyclops-academy.js', '/cyclops-ndt-academy.js', '/cyclops-surfsim.js', '/cyclops-challenges.js', '/cyclops-scenarios.js', '/cyclops-insight.js', '/cyclops-lab.js', '/cyclops-workspace.js', '/cyclops-twin.js', '/cyclops-defects3d.js', '/cyclops-home.js', '/cyclops-guide.js', '/cyclops-procourse.js','/cyclops-procs.js', '/cyclops-courses.js', '/cyclops3D.js', '/cyclops-gl.js', '/vendor/three.module.min.js', '/cyclops-utsim.js', '/cyclops-rtsim.js', '/cyclops-quiz.js', '/cyclops-tools.js',
  '/cyclops-field.css', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/login' || url.pathname === '/login.html') return; // always live

  // Pages: network first (so sign-in redirects still work), cached copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok && !response.redirected) caches.open(VERSION).then((cache) => cache.put('/', response.clone()));
        return response;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  // Static files: cached copy first, refreshed in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok && !response.redirected) caches.open(VERSION).then((cache) => cache.put(request, response.clone()));
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
