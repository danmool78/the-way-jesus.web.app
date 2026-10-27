const CACHE='theway-v3';
// 페이지(탐색) 요청은 브라우저 HTTP 캐시를 건너 서버에 확인한다 — 첫 화면(/)이 1시간씩 예전 것으로 남던 문제
// (탐색 요청 객체에는 옵션을 덧붙일 수 없어 주소로 다시 요청한다)
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','style.css','app.js','data.json','assets/icon.svg','assets/relief.webp','stage.js','stage/kit.js','stage/people.js','stage/props.js','stage/scenes.js','assets/vendor/three.module.min.js'])));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('theway-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith((e.request.mode==='navigate'?fetch(e.request.url,{cache:'no-cache'}):fetch(e.request)).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}return r;}).catch(()=>caches.match(e.request)));});
