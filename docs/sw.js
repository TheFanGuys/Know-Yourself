const CACHE='know-yourself-static-v10';
const FILES=['./','index.html','style.css','profiles.js','catalog.js','norms.js','extras-data.js','extras.js','engine.js','app.js','gut-data.js','gut.js','assets/gut-hero.webp','assets/hero.webp','assets/cast.webp','assets/favicon-32.png','assets/apple-touch-icon.png','assets/icon-192.png','assets/icon-512.png','assets/oeps-v1.odt','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('know-yourself-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Pages, scripts and styles: try the network first so updates show up right away; fall back to the saved copy when offline.
// Images and other files: use the saved copy first (they rarely change).
self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 const fresh=req.mode==='navigate'||/\.(html|js|css|webmanifest)$/.test(url.pathname)||url.pathname.endsWith('/');
 if(fresh){e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));return;}
 e.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
