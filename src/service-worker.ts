/// <reference lib="webworker" />

import { files, timestamp } from '$service-worker';

const worker = (self as unknown) as ServiceWorkerGlobalScope;
const CACHE_NAME = `cache${timestamp}`;

// `files` is an array of everything in the `static` directory
const toCache = files;
const offlineRequest = toCache.filter((value) => value.includes("offline.html"))[0]

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(toCache))
			.then(() => {
				worker.skipWaiting();
			})
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(async (keys) => {
			// delete old caches
			for (const key of keys) {
				if (key !== CACHE_NAME) await caches.delete(key);
			}

			worker.clients.claim();
		})
	);
});

worker.addEventListener('fetch', (event) => {
	const request = event.request;
  if(request.method === "GET") {
    event.respondWith(
      fetch(request).catch((error) => {
        console.warn("Fetch failed. Serving cached offline fallback.", error)
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match(offlineRequest)
        })
      })
    )
  }
});
