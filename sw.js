const CACHE="jawakara-v9";
const SHELL=["./","index.html","manifest.webmanifest","icon.svg","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET") return;
  // Live data: always network; the app keeps its own copy.
  if(/open-meteo\.com|er-api\.com/.test(u.host)) return;
  // App files: network first, cache fallback (so updates arrive, offline still works).
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))));
    return;
  }
  // Fonts: cache first.
  if(/fonts\.(googleapis|gstatic)\.com/.test(u.host)||u.href.includes("gstatic.com/firebasejs/")){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));return res;})));
  }
});
