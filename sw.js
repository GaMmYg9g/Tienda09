const CACHE_NAME = 'catalogo-v2';

const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/productos.js',
    './js/encargos.js',
    './js/ofertas.js',
    './js/combos.js',
    './js/descuentosCantidad.js',
    './js/app.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    // Imágenes de productos (ajusta según las tuyas)
    './img/producto1.jpg',
    './img/producto1-rosa.jpg',
    './img/producto1-verde.jpg',
    './img/producto2.jpg',
    './img/producto3.jpg',
    './img/producto4.jpg',
    './img/producto4-marron.jpg',
    './img/producto5.jpg',
    './img/producto6.jpg',
    './img/producto6-negro.jpg',
    './img/producto6-rojo.jpg',
    './img/producto7.jpg',
    './img/producto8.jpg',
    // Imágenes de encargos
    './img/encargo1.jpg',
    './img/encargo1-lavanda.jpg',
    './img/encargo1-coco.jpg',
    './img/encargo2.jpg',
    './img/encargo3.jpg',
    './img/encargo4.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(err => console.log('Cacheo parcial:', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(respuestaCache => {
            if (respuestaCache) return respuestaCache;

            return fetch(event.request).then(respuestaRed => {
                if (event.request.method === 'GET') {
                    const respuestaClonada = respuestaRed.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, respuestaClonada);
                    });
                }
                return respuestaRed;
            }).catch(() => {
                if (event.request.destination === 'image') {
                    return new Response(
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"></svg>',
                        { headers: { 'Content-Type': 'image/svg+xml' } }
                    );
                }
            });
        })
    );
});