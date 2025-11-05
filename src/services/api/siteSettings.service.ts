import apiClient, { isNetworkError } from './config';
import { localStorageCache, CacheKeys } from '../../utils/cache';

class SiteSettingsService {
    /**
     * Get a single site setting by key (with caching)
     */
    async getSetting(key: string, useCache: boolean = true): Promise<string | null> {
        // Try cache first
        if (useCache) {
            const cached = localStorageCache.get<Record<string, string | null>>(CacheKeys.SITE_SETTINGS);
            if (cached && cached[key] !== undefined) {
                return cached[key];
            }
        }

        try {
            const response = await apiClient.get(`/site-settings/${key}`);
            const value = response.data.value;
            
            // Cache the setting
            if (useCache) {
                const cached = localStorageCache.get<Record<string, string | null>>(CacheKeys.SITE_SETTINGS) || {};
                cached[key] = value;
                // Cache for 1 hour
                localStorageCache.set(CacheKeys.SITE_SETTINGS, cached, 60 * 60 * 1000);
            }
            
            return value;
        } catch (error: any) {
            // Don't log network errors (server offline) - already handled by interceptor
            if (!isNetworkError(error)) {
            console.error(`Failed to fetch site setting ${key}:`, error);
            }
            return null;
        }
    }

    /**
     * Get multiple site settings by keys (with caching)
     */
    async getSettings(keys: string[], useCache: boolean = true): Promise<Record<string, string | null>> {
        const result: Record<string, string | null> = {};
        const keysToFetch: string[] = [];

        // Try cache first
        if (useCache) {
            const cached = localStorageCache.get<Record<string, string | null>>(CacheKeys.SITE_SETTINGS);
            if (cached) {
                keys.forEach(key => {
                    if (cached[key] !== undefined) {
                        result[key] = cached[key];
                    } else {
                        keysToFetch.push(key);
                    }
                });
            } else {
                keysToFetch.push(...keys);
            }
        } else {
            keysToFetch.push(...keys);
        }

        // Fetch missing keys from API
        if (keysToFetch.length > 0) {
        try {
            const response = await apiClient.get('/site-settings', {
                    params: { keys: keysToFetch.join(',') }
            });
                const fetchedSettings = response.data.settings || {};
                
                // Merge fetched settings into result
                Object.assign(result, fetchedSettings);
                
                // Update cache with fetched settings
                if (useCache) {
                    const cached = localStorageCache.get<Record<string, string | null>>(CacheKeys.SITE_SETTINGS) || {};
                    Object.assign(cached, fetchedSettings);
                    // Cache for 1 hour
                    localStorageCache.set(CacheKeys.SITE_SETTINGS, cached, 60 * 60 * 1000);
                }
        } catch (error: any) {
            // Don't log network errors (server offline) - already handled by interceptor
            if (!isNetworkError(error)) {
            console.error('Failed to fetch site settings:', error);
            }
            }
        }

        return result;
    }

    /**
     * Get all public site settings (with caching)
     */
    async getPublicSettings(useCache: boolean = true): Promise<Record<string, string | null>> {
        // Try cache first
        if (useCache) {
            const cached = localStorageCache.get<Record<string, string | null>>(CacheKeys.SITE_SETTINGS);
            if (cached) {
                return cached;
            }
        }

        try {
            const response = await apiClient.get('/site-settings/public');
            const settings = response.data.settings || {};
            
            // Cache for 1 hour
            if (useCache) {
                localStorageCache.set(CacheKeys.SITE_SETTINGS, settings, 60 * 60 * 1000);
            }
            
            return settings;
        } catch (error: any) {
            // Don't log network errors (server offline) - already handled by interceptor
            if (!isNetworkError(error)) {
            console.error('Failed to fetch public site settings:', error);
            }
            return {};
        }
    }

    /**
     * Update a site setting (admin only) - invalidates cache
     */
    async updateSetting(key: string, value: string): Promise<void> {
        await apiClient.put(`/site-settings/${key}`, { value });
        
        // Update cache
        const cached = localStorageCache.get<Record<string, string | null>>(CacheKeys.SITE_SETTINGS) || {};
        cached[key] = value;
        localStorageCache.set(CacheKeys.SITE_SETTINGS, cached, 60 * 60 * 1000);
    }

    /**
     * Invalidate cache (useful when settings are updated externally)
     */
    invalidateCache(): void {
        localStorageCache.remove(CacheKeys.SITE_SETTINGS);
    }
}

export default new SiteSettingsService();

