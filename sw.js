// Keep source code fresh on GitHub Pages while retaining offline support.
const CACHE='daypiece-shell-v16-9-food-search';
const APP_FILES=['./jogaki-room.webp','./jogaki-cat.webp','./mascot.svg','./eggroll.png','./sundubu.png','./budae.png','./','./index.html','./styles.css','./app.js','./sync.js','./manifest.webmanifest','./app-icon.svg','./app-icon-192.png','./app-icon-512.png','./app-icon-180.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_FILES.map(path=>new Request(path,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('daypiece-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 const isCode=/\.(js|css)$/.test(url.pathname);
 const isPage=request.mode==='navigate'||url.pathname.endsWith('/index.html');
 if(isCode||isPage){
  event.respondWith(fetch(request,{cache:'no-store'}).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
   return response;
  }).catch(async()=>{
   const cached=await caches.match(request,{ignoreSearch:true});
   if(cached)return cached;
   if(isPage){const fallback=await caches.match('./index.html');if(fallback)return fallback;}
   return Response.error();
  }));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
  return response;
 })));
});
