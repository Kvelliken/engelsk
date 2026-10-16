// Service worker: cacher hele appen slik at den virker uten nett.
// Bytt VERSJON når noe endres, så kommer oppdateringen frem til iPaden.
const VERSJON = '2026-10-16.3';
const CACHE = 'engelsk-' + VERSJON;

const FILER = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/app.js',
  './js/belonning.js',
  './js/bilder.js',
  './js/dato.js',
  './js/dom.js',
  './js/felles.js',
  './js/hjem.js',
  './js/lagring.js',
  './js/lyd.js',
  './js/nav.js',
  './js/okt.js',
  './js/oppdatering.js',
  './js/opptak.js',
  './js/ordliste.js',
  './js/profiler.js',
  './js/setninger.js',
  './js/srs.js',
  './js/tilstand.js',
  './js/voksen.js',
  './js/aktiviteter/lytt-og-trykk.js',
  './js/aktiviteter/se-og-hor.js',
  './js/aktiviteter/setningsbygger.js',
  './js/aktiviteter/si-det-hoyt.js',
  './data/ord.json',
  './data/rammer.json',
  './data/temaer.json',
  './data/lyd.json',
  './assets/ikoner/ikon-180.png',
  './assets/ikoner/ikon-192.png',
  './assets/ikoner/ikon-512.png',
  './assets/ikoner/ikon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  // cache: 'reload' går forbi nettleserens HTTP-cache, så vi får ferske filer.
  // Lydfilene står i data/lyd.json og lagres også, så lyden virker uten nett.
  const ferske = (filer) => filer.map((f) => new Request(f, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ferske(FILER))
    .then(() => fetch('./data/lyd.json', { cache: 'reload' }))
    .then((svar) => svar.json())
    .then((l) => c.addAll(ferske(l.filer.map((n) => './assets/lyd/' + n + '.mp3'))))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((nokler) => Promise.all(nokler
      .filter((n) => n.indexOf('engelsk-') === 0 && n !== CACHE)
      .map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => {
  if (e.data === 'hoppOver') self.skipWaiting();
  if (e.data === 'versjon' && e.ports[0]) e.ports[0].postMessage({ versjon: VERSJON });
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(caches.match(req, { ignoreSearch: true }).then((treff) => {
    if (treff) return treff;
    return fetch(req).then((svar) => {
      // Egne lydfiler (ord.lyd) caches når de først er hentet.
      if (svar.ok && url.pathname.indexOf('/assets/lyd/') !== -1) {
        const kopi = svar.clone();
        caches.open(CACHE).then((c) => c.put(req, kopi));
      }
      return svar;
    }).catch(() => {
      if (req.mode === 'navigate') return caches.match('./index.html');
      return Response.error();
    });
  }));
});
