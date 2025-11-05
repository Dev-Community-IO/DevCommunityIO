/**
 * Cache utility for localStorage and sessionStorage with expiry support
 */

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiry: number; // milliseconds
}

const CACHE_PREFIX = 'devcommunity_cache_';
const CACHE_VERSION = '1.0';

/**
 * Get cache key with prefix
 */
function getCacheKey(key: string): string {
    return `${CACHE_PREFIX}${CACHE_VERSION}_${key}`;
}

/**
 * Check if cache item is expired
 */
function isExpired<T>(item: CacheItem<T> | null): boolean {
    if (!item) return true;
    return Date.now() - item.timestamp > item.expiry;
}

/**
 * Cache service for localStorage
 */
export const localStorageCache = {
    /**
     * Get cached item
     */
    get<T>(key: string): T | null {
        try {
            const cacheKey = getCacheKey(key);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const item: CacheItem<T> = JSON.parse(cached);

            if (isExpired(item)) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error(`Failed to get cache for key ${key}:`, error);
            return null;
        }
    },

    /**
     * Set cached item with expiry
     * @param key Cache key
     * @param data Data to cache
     * @param expiry Expiry time in milliseconds (default: 1 hour)
     */
    set<T>(key: string, data: T, expiry: number = 60 * 60 * 1000): void {
        try {
            const cacheKey = getCacheKey(key);
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                expiry,
            };
            localStorage.setItem(cacheKey, JSON.stringify(item));
        } catch (error) {
            console.error(`Failed to set cache for key ${key}:`, error);
            // If quota exceeded, try to clean up old cache
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                this.clearExpired();
            }
        }
    },

    /**
     * Remove cached item
     */
    remove(key: string): void {
        try {
            const cacheKey = getCacheKey(key);
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.error(`Failed to remove cache for key ${key}:`, error);
        }
    },

    /**
     * Clear all expired cache items
     */
    clearExpired(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    try {
                        const cached = localStorage.getItem(key);
                        if (cached) {
                            const item = JSON.parse(cached);
                            if (isExpired(item)) {
                                localStorage.removeItem(key);
                            }
                        }
                    } catch (e) {
                        // Invalid cache item, remove it
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to clear expired cache:', error);
        }
    },

    /**
     * Clear all cache items
     */
    clear(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    },
};

/**
 * Cache service for sessionStorage
 */
export const sessionStorageCache = {
    /**
     * Get cached item
     */
    get<T>(key: string): T | null {
        try {
            const cacheKey = getCacheKey(key);
            const cached = sessionStorage.getItem(cacheKey);
            if (!cached) return null;

            const item: CacheItem<T> = JSON.parse(cached);

            if (isExpired(item)) {
                sessionStorage.removeItem(cacheKey);
                return null;
            }

            return item.data;
        } catch (error) {
            console.error(`Failed to get cache for key ${key}:`, error);
            return null;
        }
    },

    /**
     * Set cached item with expiry
     */
    set<T>(key: string, data: T, expiry: number = 60 * 60 * 1000): void {
        try {
            const cacheKey = getCacheKey(key);
            const item: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                expiry,
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(item));
        } catch (error) {
            console.error(`Failed to set cache for key ${key}:`, error);
        }
    },

    /**
     * Remove cached item
     */
    remove(key: string): void {
        try {
            const cacheKey = getCacheKey(key);
            sessionStorage.removeItem(cacheKey);
        } catch (error) {
            console.error(`Failed to remove cache for key ${key}:`, error);
        }
    },

    /**
     * Clear all expired cache items
     */
    clearExpired(): void {
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    try {
                        const cached = sessionStorage.getItem(key);
                        if (cached) {
                            const item = JSON.parse(cached);
                            if (isExpired(item)) {
                                sessionStorage.removeItem(key);
                            }
                        }
                    } catch (e) {
                        sessionStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to clear expired cache:', error);
        }
    },

    /**
     * Clear all cache items
     */
    clear(): void {
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_PREFIX)) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    },
};

/**
 * Cache keys
 */
export const CacheKeys = {
    USER: 'user',
    USER_SESSION: 'user_session',
    SITE_SETTINGS: 'site_settings',
    FAVICON: 'favicon',
    LOGO: 'logo',
    APPLE_TOUCH_ICON: 'apple_touch_icon',
    OG_IMAGE: 'og_image',
    DYNAMIC_ASSETS: 'dynamic_assets',
} as const;

/**
 * Clear expired cache on load
 */
if (typeof window !== 'undefined') {
    localStorageCache.clearExpired();
    sessionStorageCache.clearExpired();
}

