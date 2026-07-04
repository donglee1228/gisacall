// 기사콜 서비스워커 — 설치형 PWA 요건 충족 + 앱 셸 캐시(버전 관리)
// 캐시 버전을 올리면 옛 캐시를 싹 비우고 새로 받는다(아이콘 갱신 반영).
const 캐시버전 = 'gisacall-v8';
const 앱셸 = [
  './',
  './index.html',
  './앱설정.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(캐시버전).then((c) => c.addAll(앱셸)).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== 캐시버전).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 네트워크 우선(최신 우선), 실패 시 캐시 폴백 — 오프라인에서도 열리되 항상 최신 반영 시도
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(캐시버전).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
