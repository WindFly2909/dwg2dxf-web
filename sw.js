// Lưu trang và bộ chuyển đổi vào bộ nhớ đệm để lần sau chạy được khi không có mạng.
// Đổi VERSION mỗi khi cập nhật file.
const VERSION = 'dwg2dxf-v1';
const FILES = [
  './', 'index.html', 'style.css', 'app.js', 'worker.js', 'icon.svg',
  'vendor/libredwg-web.js', 'vendor/libredwg-web.wasm',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request)));
});
