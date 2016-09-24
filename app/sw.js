var CACHE_NAME = 'content-cache-v1';
var urlsToCache = [
 'app/',
 'app/styles/main.css',
 'app/script/main.js'
];

self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['content-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        // IMPORTANT: Clone the request.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if(!(response || response.status !== 200 || response.type !== 'basic')) {
              return response;
            }

            // IMPORTANT: Clone the response.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
     );
 });
