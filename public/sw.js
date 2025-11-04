/**
 * Service Worker for PWA and Push Notifications
 */

const CACHE_NAME = 'devcommunity-v2'
const STATIC_CACHE = 'devcommunity-static-v2'
const DYNAMIC_CACHE = 'devcommunity-dynamic-v2'

const urlsToCache = [
    '/',
    '/icon.png',
    '/manifest.json',
    '/index.html',
]

// Install service worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...')
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[Service Worker] Caching static assets')
            return cache.addAll(urlsToCache).catch(err => {
                console.error('[Service Worker] Failed to cache some assets:', err)
            })
        })
    )
    self.skipWaiting()
})

// Activate service worker
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...')
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    return self.clients.claim()
})

/**
 * Check if a request should be cached
 */
function shouldCacheRequest(request) {
    try {
        const url = new URL(request.url)

        // Only cache HTTP/HTTPS requests
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false
        }

        // Skip chrome-extension, moz-extension, safari-extension, etc.
        if (url.protocol.startsWith('chrome-extension') ||
            url.protocol.startsWith('moz-extension') ||
            url.protocol.startsWith('safari-extension') ||
            url.protocol.startsWith('edge-extension') ||
            url.href.includes('chrome-extension://') ||
            url.href.includes('moz-extension://') ||
            url.href.includes('safari-extension://') ||
            url.href.includes('edge-extension://')) {
            return false
        }

        // Skip file:// protocol
        if (url.protocol === 'file:') {
            return false
        }

        // Skip API calls (they should always go to network)
        if (url.pathname.startsWith('/api/')) {
            return false
        }

        // Skip WebSocket and non-HTTP connections
        if (url.protocol === 'ws:' || url.protocol === 'wss:') {
            return false
        }

        // Skip data: and blob: URLs
        if (url.protocol === 'data:' || url.protocol === 'blob:') {
            return false
        }

        return true
    } catch (error) {
        // If URL parsing fails, don't cache
        console.warn('[Service Worker] Failed to parse URL:', request.url, error)
        return false
    }
}

// Fetch event - Network first, cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Check if request should be cached
    if (!shouldCacheRequest(request)) {
        return
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Only cache successful responses from same origin
                if (response.status === 200 && response.type === 'basic') {
                    try {
                        // Clone the response before caching
                        const responseToCache = response.clone()

                        // Cache successful responses (wrapped in try-catch to handle any caching errors)
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            // Double-check URL before caching
                            if (shouldCacheRequest(request)) {
                                cache.put(request, responseToCache).catch((error) => {
                                    // Silently fail if caching is not supported for this request
                                    console.warn('[Service Worker] Failed to cache request:', request.url, error.message)
                                })
                            }
                        }).catch((error) => {
                            console.warn('[Service Worker] Cache open error:', error.message)
                        })
                    } catch (error) {
                        // Silently fail if cloning or caching fails
                        console.warn('[Service Worker] Cache error:', error.message)
                    }
                }

                return response
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse
                    }

                    // If no cache, return offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/')
                    }

                    // Return empty response for other requests
                    return new Response('Offline', {
                        status: 503,
                        statusText: 'Service Unavailable',
                    })
                })
            })
    )
})

// Handle push notifications
self.addEventListener('push', (event) => {
    let notificationData = {
        title: 'Dev Community IO',
        body: 'You have a new notification',
        icon: '/icon.png',
        badge: '/icon.png',
        tag: 'notification',
        data: {},
    }

    if (event.data) {
        try {
            const data = event.data.json()
            notificationData = {
                title: data.title || notificationData.title,
                body: data.message || data.body || notificationData.body,
                icon: data.icon || notificationData.icon,
                badge: data.badge || notificationData.badge,
                tag: data.id || data.tag || notificationData.tag,
                data: data.data || {},
                actions: data.actions || [],
                requireInteraction: data.requireInteraction || false,
            }
        } catch (e) {
            notificationData.body = event.data.text()
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            data: notificationData.data,
            actions: notificationData.actions,
            requireInteraction: notificationData.requireInteraction,
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
        })
    )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const notificationData = event.notification.data
    const urlToOpen = notificationData?.actionUrl || '/'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i]
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus().then(() => {
                        // Navigate to notification URL
                        if (client.url !== urlToOpen) {
                            return client.navigate(urlToOpen)
                        }
                    })
                }
            }

            // Open new window if app is not open
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen)
            }
        })
    )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    // You can send analytics here if needed
    console.log('Notification closed:', event.notification.tag)
})
