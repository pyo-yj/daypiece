const CACHE='daypiece-shell-v16-7-samgyetang';
const APP_FILES=['./jogaki-room.webp','./jogaki-cat.webp','./mascot.svg','./eggroll.png','./sundubu.png','./budae.png','./','./index.html','./styles.css','./app.js','./sync.js','./manifest.webmanifest','./app-icon.svg','./app-icon-192.png','./app-icon-512.png','./app-icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(e.request,copy))}return resp})))})
