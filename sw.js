const C="pipeline-v35";
self.addEventListener("install",e=>{
 e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","dados-empresas-v1.json"])));
 self.skipWaiting();
});
self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));
 self.clients.claim();
});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET"||e.request.url.includes("nominatim"))return;
 const req=e.request;
 const isPage=req.mode==="navigate"||new URL(req.url).pathname.endsWith("/index.html")||new URL(req.url).pathname.endsWith("/");
 if(isPage){
  e.respondWith(fetch(req,{cache:"no-store"}).then(res=>{
   if(res&&res.ok)caches.open(C).then(c=>c.put(req,res.clone()));
   return res;
  }).catch(()=>caches.match(req).then(r=>r||caches.match("./")||caches.match("index.html"))));
  return;
 }
 e.respondWith(caches.open(C).then(async c=>{
  const cached=await c.match(req);
  if(cached)return cached;
  const res=await fetch(req);
  if(res&&res.ok)c.put(req,res.clone());
  return res;
 }));
});
