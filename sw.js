// sw.js 수정
const CACHE_NAME = 'starwooni-v1';
const ASSETS = [
  '/starwooni/',           //
  '/starwooni/index.html', //
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// 설치 - 핵심 파일 캐시 저장
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 활성화 - 오래된 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청 처리 - 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', e => {
  // Firebase 실시간 DB는 항상 네트워크 사용
  if (e.request.url.includes('firebasedatabase.app')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(response => {
        // 성공한 응답은 캐시에 저장
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
