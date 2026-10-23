const CACHE='theway-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','style.css','app.js','data.json','assets/icon.svg'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('theway-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/assets/audio/'))return; // 음원은 범위 요청이라 브라우저 캐시에 맡긴다
  e.respondWith(fetch(e.request).then(r=>{if(r.status===200){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match(e.request)));});
