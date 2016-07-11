/**
 * Sample serviceWorker
 *
 * @author carlos araya
 * @license MIT
 *
 * This is the basis for my work on ServiceWorker, progressive apps and book
 * as web apps / progressive apps.
 *
 * This is written as an ES6 app. It uses constants and arrow functions
 * which should be supported in most browsers without transpilation.
 *
 * Yes, I know there's a cleaner/shorter way to write arrow functions but what I
 * wrote is what I'm comfortable with as it helps me read the function better.
 *
 */

'use strict';
 // Chrome's currently missing some useful cache methods, this polyfill adds them.
 importScripts('js/lib/serviceworker-cache-polyfill.js');

 // Define constants for cache names and versions
 const SHELL_CACHE = 'shell_cache';
 const SHELL_VERSION = 1;
 const CONTENT_CACHE = 'content_cache';
 const CONTENT_VERSION = 1;

// Content to  cache when the ServiceWorker is installed
// Change to match the files you need for your app shell. Please do not add
// anything outside of your shell to this object
 const SHELL_CONTENT = [
   '/path/to/javascript.js',
   '/path/to/stylesheet.css',
   '/path/to/someimage.png',
   '/path/to/someotherimage.png',
   '/',
   '/offline.html'
 ];


  // 1. Register Service Worker
  // If the user agent has a serviceWorker property in navigator then we
  // install the service worker. If it's not supported then we fail silently.
  // We may want to do something else like pop up an alert or something like
  // that to make sure the user knows whether it succeeded or not
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
    // It worked, SW registered
    console.log('ServiceWorker successfully registered');
  } else {
    // something happened, SW didn't register
    console.log('ServiceWorker Barfed, did not register: ' + error);
  }

  // 2. Install the Service Worker and cache the shell content. This is only
  // the shell content, not the content inside.
  self.addEventListener('install',  (event) => {
    event.waitUntil(
      caches.open(SHELL_CACHE + ' - v' + SHELL_VERSION)
        .then( (cache) => {
          return cache.addAll(SHELL_CONTENT);
      })
        .then(() => {
            return self.skipWaiting();
        })
      );
  });

  // 3. Activate event
  self.addEventListener('activate', function(event) {
    // TODO: Write cache cleaning logic
    return self.clients.claim();
  });

  // 4. Fetch resources
  // TODO: Figure out which response is triggered if multiple respondWith match
  self.addEventListener('fetch', function (event) {
    let request = event.request;

    // Response 1: Non GET methods if the request is not GET then fetch from
    // network or return offline page as it makes no sense / it's impossible
    // to cache a request that is not get... it's possible but why would we
    // want to?
    if (request.method !== 'GET') {
      event.respondWith(fetch(request)
        .catch(function () {
          // if the fetch request fails return the offline page
          return caches.match('/offline.html');
        })
      );
      return;
    } // Ends Response 1

    // Response 2: Generic Response, fetch content from the network and put it
    // in the cache, then return it.
    event.respondWith(
      caches.match(request).then(() => {
        return fetch(request)
          .then((response) => {
            return caches.open(CONTENT_CACHE + '-v' + CONTENT_VERSION)
              .then((cache) => {
                cache.put(event.request, response.clone());
                return response;
              });
          })
      })
    ); // closes response 2

    // Response 3: Return response from cache or fetch from network using a cache
    // first strategy if not in cache. If they both fail provide an SVG
    // fallback placeholder, using offlineResponse defined below
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
              .catch(() => {
                if (request.headers.get('Accept').indexOf('image') !== -1) {
                  event.respondsWith(offlineResponse(event));
                }

                // TODO: Add additional content cases we want to highlight: video?
             });
        })
    ); // Ends response 3

    // Function to return image place holder for content that is not available
    // We use a function to make it easier to reuse the same response for
    // content other than images.
    function offlineResponse(event) {
      return new Response('<svg width="400" height="300"' +
        ' role="img" aria-labelledby="offline-title"' +
        '  viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">' +
        '<title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd">' +
        '<path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B"' +
        ' font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72"' +
        ' font-weight="bold">' +
        '<tspan x="93" y="172">offline</tspan></text></g></svg>', {
        headers: {
          'Content-Type': 'image/svg+xml'
        }
      });
    }


});// closes the fetch event listener
