const CACHE = "shundoku-v1";

const PRECACHE = [
  "./training-prototype.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./texts/index.json",
  "./texts/flash/gokan.txt",
  "./texts/flash/kioku-gijutsu.txt",
  "./texts/flash/shunkan-chikaku.txt",
  "./texts/flash/shuukan-no-chikara.txt",
  "./texts/flash/chishiki-no-tobira.txt",
  "./texts/word-list.txt",
  "./texts/memory-word-list.txt",
  "./texts/image-sentences.txt"
];

// インストール時：全ローカルリソースをプリキャッシュ
self.addEventListener("install", e =>
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
);

// アクティベート時：古いキャッシュを削除
self.addEventListener("activate", e =>
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
);

// フェッチ：CDNはネットワーク優先、ローカルはキャッシュファースト
self.addEventListener("fetch", e => {
  const url = e.request.url;
  const isCDN = url.includes("cdn.jsdelivr") || url.includes("fonts.googleapis") || url.includes("fonts.gstatic");

  if (isCDN) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request)
        .then(r => r || fetch(e.request))
    );
  }
});
