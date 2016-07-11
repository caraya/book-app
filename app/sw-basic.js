/* jshint node: true */
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
 * If it's not supported then we can easily transpile it to ES5 using Babel
 * as configured in the build process
 *
 * Yes, I know there's a shorter way to write arrow functions when there is
 * only 1 parameter or when there is only one return statement but what I
 * wrote is what I'm comfortable with as it helps me read the function better.
 *
 */

'use strict';
 // Chrome's currently missing some useful cache methods, this polyfill adds them.
 importScripts('js/serviceworker-cache-polyfill.js');

 // Define constants for cache names and versions
 const SHELL_CACHE = 'shell_cache';
 const SHELL_VERSION = 1;
 const CONTENT_CACHE = 'content_cache';
 const CONTENT_VERSION = 1;

// Content to  cache when the ServiceWorker is installed
// Change to match the files you need for your app shell.
// Do not add anything outside of your shell to this
// object unless you want it to be cached when the application
// loads for the first time
 const SHELL_CONTENT = [
   '/',
   '/path/to/javascript.js',
   '/path/to/stylesheet.css',
   '/path/to/someimage.png',
   '/path/to/someotherimage.png',
   '/offline.html',
 ];

  // 1. Register Service Worker
  // If the user agent has a serviceWorker property in navigator then we
  // install the service worker. If it's not supported then we fail silently.
  //
  // We may want to do something else like pop up or a toaster alert message
  // to make sure the user knows whether it succeeded or not
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
    // It worked, SW registered
    console.log('ServiceWorker successfully registered');
  } else {
    // something happened, SW didn't register
    console.log('ServiceWorker barfed and did not register: ' + error);
  }

  // 2. Install the Service Worker and cache the shell content. This is only
  // the shell content, not the content inside.
  self.addEventListener('install',  () => {
    event.waitUntil(
      caches.open(SHELL_CACHE + ' -v' + SHELL_VERSION)
        .then( (cache) => {
          return cache.addAll(SHELL_CONTENT);
      })
        .then(() => {
            return self.skipWaiting();
        })
    );
  });

  // 3. Activate event
  self.addEventListener('activate', (event) => {
    // FIXME: Write cache cleaning logic
    return self.clients.claim();
  });

  // 4. Fetch resources
  self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Response 1:  Generic Response, fetch content from the network and put it
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
    ); // closes respondWith
});// closes the fetch event listener
