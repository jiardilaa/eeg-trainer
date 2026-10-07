const CACHE = 'eeg-trainer-v2'; // súbelo a v2, v3... cada vez que publiques cambios
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'css/app.css',
  'js/app.js', 'js/course.js', 'js/geometry.js', 'js/rules.js', 'js/topview.js',
  'js/quiz.js', 'js/photo.js', 'js/live.js',
  'assets/icon-192.png', 'assets/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});