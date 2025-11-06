/**
 * Browser Push Notification Service
 * Handles native browser push notifications and service worker registration
 */

/**
 * Detect API URL dynamically (without /api suffix)
 * Uses VITE_API_PORT from environment (default: 3333)
 */
function getApiUrl(): string {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Get API port from environment or use default 3333
    const apiPort = import.meta.env.VITE_API_PORT || '3333';

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

        // Production domains
        const productionDomains = [
            'devcommunity.io',
            'www.devcommunity.io',
            'www.devcommunity.com',
        ];

        const isProductionDomain = productionDomains.includes(hostname);

        if (isLocalhost) {
            return `http://localhost:${apiPort}`;
        } else if (isProductionDomain) {
            // Use HTTPS and API subdomain for production (no port needed)
            if (hostname.startsWith('www.')) {
                const baseDomain = hostname.replace('www.', '');
                return `https://api.${baseDomain}`;
            } else {
                return `https://api.${hostname}`;
            }
        } else {
            // For other environments, use the current protocol
            const protocol = window.location.protocol;
            return `${protocol}//${hostname}:${apiPort}`;
        }
    }

    return `http://localhost:${apiPort}`;
}

interface PushSubscriptionData {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

class PushNotificationService {
    private swRegistration: ServiceWorkerRegistration | null = null
    private subscription: PushSubscriptionData | null = null
    private isSupported: boolean

    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
        if (this.isSupported) {
            this.initialize()
        }
    }

    /**
     * Initialize service worker
     */
    private async initialize() {
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            })
            this.swRegistration = registration
            console.log('✅ Service Worker registered')

            // Check for existing subscription
            const existingSubscription = await registration.pushManager.getSubscription()
            if (existingSubscription) {
                this.subscription = this.subscriptionToObject(existingSubscription)
                console.log('✅ Existing push subscription found')
            }
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error)
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            throw new Error('This browser does not support notifications')
        }

        if (Notification.permission === 'granted') {
            return 'granted'
        }

        if (Notification.permission === 'denied') {
            throw new Error('Notification permission was denied')
        }

        const permission = await Notification.requestPermission()
        return permission
    }

    /**
     * Subscribe to push notifications
     */
    async subscribe(userId: string): Promise<PushSubscriptionData | null> {
        if (!this.isSupported || !this.swRegistration) {
            console.warn('Push notifications not supported')
            return null
        }

        try {
            // Request permission
            const permission = await this.requestPermission()
            if (permission !== 'granted') {
                throw new Error('Notification permission not granted')
            }

            // Get VAPID public key from server (you'll need to add this endpoint)
            const apiUrl = getApiUrl()
            const response = await fetch(`${apiUrl}/api/push/vapid-public-key`)
            const { publicKey } = await response.json()

            // Convert VAPID key
            const applicationServerKey = this.urlBase64ToUint8Array(publicKey)

            // Subscribe to push
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource,
            })

            this.subscription = this.subscriptionToObject(subscription)

            // Send subscription to server
            await fetch(`${apiUrl}/api/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    subscription: this.subscription,
                }),
            })

            console.log('✅ Push subscription created')
            return this.subscription
        } catch (error) {
            console.error('❌ Failed to subscribe to push notifications:', error)
            throw error
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe(): Promise<void> {
        if (!this.swRegistration) return

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription()
            if (subscription) {
                await subscription.unsubscribe()
                this.subscription = null

                // Notify server
                const apiUrl = getApiUrl()
                await fetch(`${apiUrl}/api/push/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        endpoint: subscription.endpoint,
                    }),
                })

                console.log('✅ Push subscription removed')
            }
        } catch (error) {
            console.error('❌ Failed to unsubscribe from push notifications:', error)
        }
    }

    /**
     * Check if subscribed
     */
    async isSubscribed(): Promise<boolean> {
        if (!this.swRegistration) return false

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription()
            return subscription !== null
        } catch {
            return false
        }
    }

    /**
     * Get current subscription
     */
    async getSubscription(): Promise<PushSubscriptionData | null> {
        if (!this.swRegistration) return null

        try {
            const subscription = await this.swRegistration.pushManager.getSubscription()
            if (subscription) {
                return this.subscriptionToObject(subscription)
            }
        } catch (error) {
            console.error('Failed to get subscription:', error)
        }

        return null
    }

    /**
     * Show local notification (for testing)
     */
    async showNotification(title: string, options: NotificationOptions = {}) {
        if (this.swRegistration) {
            await this.swRegistration.showNotification(title, {
                icon: '/devcommunity-new_LOG (1).png',
                badge: '/devcommunity-new_LOG (1).png',
                ...options,
            })
        } else if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/devcommunity-new_LOG (1).png',
                ...options,
            })
        }
    }

    /**
     * Convert subscription to object
     */
    private subscriptionToObject(subscription: globalThis.PushSubscription): PushSubscriptionData {
        const key = subscription.getKey ? subscription.getKey('p256dh') : null
        const auth = subscription.getKey ? subscription.getKey('auth') : null

        return {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: key ? this.arrayBufferToBase64(key) : '',
                auth: auth ? this.arrayBufferToBase64(auth) : '',
            },
        }
    }

    /**
     * Convert VAPID key from base64 to Uint8Array
     */
    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        // Ensure we return a proper Uint8Array that TypeScript recognizes as BufferSource
        return new Uint8Array(outputArray.buffer)
    }

    /**
     * Convert ArrayBuffer to base64
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return window.btoa(binary)
    }

    /**
     * Check if push notifications are supported
     */
    get supported(): boolean {
        return this.isSupported
    }

    /**
     * Check notification permission
     */
    get permission(): NotificationPermission {
        return Notification.permission
    }
}

export const pushNotificationService = new PushNotificationService()
