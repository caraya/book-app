# Service Worker Design

Since I decided to do an app shell architecture for the content we need to split the way we cache content with service worker.  We'll use both [sw-precache](https://github.com/GoogleChrome/sw-precache) to cache the app shell and [sw-toolbox](https://github.com/GoogleChrome/sw-toolbox) to cache the other pages of the application and any associated resources.

Yes, we could build the service worker manually but updating becomes more and more complex. You have to remember to update the worker whenever you make a change and that makes it error prone.

I don't particularly like using third party libraries to build my code but in this case the advantages far surpass the potential problems that I may experience moving forward.

Jeff Posnick presented about App Shell architecture, sw-precache and sw-toolbox libraries and how to make them work together which I think is a good starting point for our work.

<div class="video">
<iframe width="560" height="315" src="https://www.youtube.com/embed/jCKZDTtUA2A?rel=0" frameborder="0" allowfullscreen></iframe>
</div>

## Gulp based build system

We could use sw-precache and sw-toolbox from the command line but why go through the hassle when we're already using Gulp for other optimization tasks on the project?

The code for this project uses a Gulp-based build system to programmatically build the service worker. When we've completed this step we'll explore what would it take to build it manually... it shouldn't be too different.


## sw-precache and the application shell

To cache the shell of the application we'll use sw-precache.
