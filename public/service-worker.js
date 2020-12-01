const cacheName = "static-cache-v1";
const dataCacheName = "data-cache-v1";

const filesToCache = [
    "/",
	"/index.html",
	"/styles.css",
	"/db.js",
	"/index.js",
	"/manifest.webmanifest",
	"/icons/icon-192x192.png",
	"/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(cacheName).then((cache) => {
                cache.addAll(filesToCache)
            }).catch((error) => {
                console.log("Error caching files: ", error)
            })
        );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== cacheName && key !== dataCacheName) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        }).catch((error) => {
            console.log("Error with Activiation: ", error)
        })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
          caches.open(dataCacheName).then(cache => {
            return fetch(event.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
    
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(event.request);
              });
          }).catch(err => console.log(err))
        );
    
        return;
      }

    event.respondWith(
        caches.open(cacheName).then(cache => {
          return cache.match(event.request).then(response => {
            return response || fetch(event.request);
          });
        })
      );
    });