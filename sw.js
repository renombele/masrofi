/* مصروفي — يخلي التطبيق يشتغل بدون إنترنت، ويلتقط التحديث أول ما ترفع نسخة جديدة */
const V='masrofi-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  /* الصفحة نفسها: من الشبكة أولاً عشان التحديث يوصلك، وإذا ما فيه إنترنت من النسخة المحفوظة */
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put('./index.html',cp));return r;})
      .catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    const cp=res.clone();caches.open(V).then(c=>c.put(req,cp));return res;}).catch(()=>hit)));});
