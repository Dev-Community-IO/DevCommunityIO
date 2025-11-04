/**
 * PWA Service - Handles PWA installation, detection, and management
 * Mobile-only (iOS and Android)
 */

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

class PWAService {
    private deferredPrompt: BeforeInstallPromptEvent | null = null
    private isIOS: boolean
    private isAndroid: boolean
    private isMobile: boolean
    private isStandalone: boolean

    constructor() {
        // Detect platform
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        this.isAndroid = /Android/.test(navigator.userAgent)
        this.isMobile = this.isIOS || this.isAndroid
        this.isStandalone =
            (window.navigator as any).standalone === true ||
            window.matchMedia('(display-mode: standalone)').matches ||
            document.referrer.includes('android-app://')

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e: Event) => {
            e.preventDefault()
            this.deferredPrompt = e as BeforeInstallPromptEvent
            this.dispatchEvent('installable')
        })

        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null
            this.dispatchEvent('installed')
        })
    }

    /**
     * Check if device is iOS
     */
    get isIOSDevice(): boolean {
        return this.isIOS
    }

    /**
     * Check if device is Android
     */
    get isAndroidDevice(): boolean {
        return this.isAndroid
    }

    /**
     * Check if device is mobile
     */
    get isMobileDevice(): boolean {
        return this.isMobile
    }

    /**
     * Check if app is installed (standalone mode)
     */
    get isInstalled(): boolean {
        return this.isStandalone
    }

    /**
     * Check if app can be installed
     */
    get canInstall(): boolean {
        return this.deferredPrompt !== null && this.isMobile && !this.isStandalone
    }

    /**
     * Show install prompt
     */
    async promptInstall(): Promise<boolean> {
        if (!this.deferredPrompt) {
            return false
        }

        try {
            await this.deferredPrompt.prompt()
            const choiceResult = await this.deferredPrompt.userChoice

            if (choiceResult.outcome === 'accepted') {
                this.deferredPrompt = null
                this.dispatchEvent('installaccepted')
                return true
            } else {
                this.dispatchEvent('installdismissed')
                return false
            }
        } catch (error) {
            console.error('Error showing install prompt:', error)
            return false
        }
    }

    /**
     * Get iOS install instructions
     */
    getIOSInstallInstructions(): string[] {
        return [
            'Tap the Share button',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" in the top right corner'
        ]
    }

    /**
     * Get Android install instructions
     */
    getAndroidInstallInstructions(): string[] {
        return [
            'Tap the menu (three dots) in your browser',
            'Tap "Install app" or "Add to Home screen"',
            'Confirm the installation'
        ]
    }

    /**
     * Check if PWA is supported
     */
    get isSupported(): boolean {
        return 'serviceWorker' in navigator && this.isMobile
    }

    /**
     * Event listeners
     */
    private listeners: Map<string, Set<() => void>> = new Map()

    on(event: 'installable' | 'installed' | 'installaccepted' | 'installdismissed', callback: () => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }
        this.listeners.get(event)!.add(callback)

        return () => {
            this.off(event, callback)
        }
    }

    off(event: 'installable' | 'installed' | 'installaccepted' | 'installdismissed', callback: () => void) {
        const callbacks = this.listeners.get(event)
        if (callbacks) {
            callbacks.delete(callback)
        }
    }

    private dispatchEvent(event: 'installable' | 'installed' | 'installaccepted' | 'installdismissed') {
        const callbacks = this.listeners.get(event)
        if (callbacks) {
            callbacks.forEach(callback => callback())
        }
    }
}

export const pwaService = new PWAService()
