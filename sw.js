// SMQ SBC : service d'installation. Seule l'enveloppe de la page (logo, icônes) est gardée sur l'appareil ;
// aucune donnée de la plateforme n'est mise en cache (elle reste sur le serveur, derrière la connexion).
const CACHE = 'smq-sbc-v1';
const ENVELOPPE = ['./', 'index.html', 'hors-ligne.html', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'favicon-48.png', 'favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ENVELOPPE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // la plateforme elle-même n'est jamais interceptée
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copie = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copie)); return r; })
      .catch(() => caches.match('hors-ligne.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
